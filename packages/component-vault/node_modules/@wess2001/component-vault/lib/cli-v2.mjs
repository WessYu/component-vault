#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";
import process from "node:process";
import ts from "typescript";
import YAML from "yaml";

const VERSION = "0.3.0";
const DEFAULT_CONFIG = "component-vault.yaml";
const RULES = { CV001: "Direct component import", CV002: "Forbidden variant override", CV003: "Raw semantic element", CV004: "Repeated static style", CV005: "Forbidden pattern" };
const toPosix = (value) => value.split(sep).join("/");
const hash = (value) => createHash("sha1").update(value).digest("hex").slice(0, 16);

function loadConfig(root, configPath = DEFAULT_CONFIG) {
  const path = resolve(root, configPath);
  if (!existsSync(path)) throw new Error(`Configuration not found: ${configPath}`);
  const config = YAML.parse(readFileSync(path, "utf8"));
  if (!config || config.version !== 1) throw new Error("component-vault.yaml must use version: 1");
  config.scan ??= {};
  config.scan.include ??= ["src"];
  config.scan.exclude ??= ["node_modules", ".next", ".git"];
  config.scan.extensions ??= [".ts", ".tsx", ".js", ".jsx"];
  config.duplicates ??= { enabled: true, minOccurrences: 5, minTokens: 5 };
  config.components ??= {};
  config.rules ??= {};
  config.rules.forbiddenPatterns ??= [];
  config.rules.fixes ??= {};
  return config;
}

function wildcardToRegExp(pattern) {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*\*/g, "__DOUBLE_STAR__").replace(/\*/g, "[^/]*").replace(/__DOUBLE_STAR__/g, ".*");
  return new RegExp(`^${escaped}$`);
}
function matchesPattern(file, pattern) {
  const normalized = toPosix(String(pattern)).replace(/^\.\//, "");
  if (!normalized.includes("*")) return file === normalized || file.startsWith(`${normalized}/`);
  return wildcardToRegExp(normalized).test(file);
}
function collectFiles(root, config) {
  const files = [];
  const extensions = new Set(config.scan.extensions.map(String));
  const excludes = config.scan.exclude.map(String);
  function visit(path) {
    const rel = toPosix(relative(root, path));
    if (rel && excludes.some((pattern) => matchesPattern(rel, pattern))) return;
    const stats = statSync(path);
    if (stats.isDirectory()) { for (const child of readdirSync(path)) visit(join(path, child)); return; }
    if (extensions.has(extname(path))) files.push(rel);
  }
  for (const include of config.scan.include) { const path = resolve(root, String(include)); if (existsSync(path)) visit(path); }
  return files.sort();
}
function scriptKind(file) { if (file.endsWith(".tsx")) return ts.ScriptKind.TSX; if (file.endsWith(".jsx")) return ts.ScriptKind.JSX; if (file.endsWith(".js")) return ts.ScriptKind.JS; return ts.ScriptKind.TS; }
function normalize(value) { return value.replace(/\s+/g, " ").trim().slice(0, 280); }
function violation({ rule, component, file, sourceFile, start, snippet, message, suggestion, metadata = {}, severity = "error" }) {
  const location = sourceFile.getLineAndCharacterOfPosition(start);
  return { rule, title: RULES[rule] ?? rule, component, file, line: location.line + 1, column: location.character + 1, snippet: normalize(snippet), message, suggestion, severity, metadata, fingerprint: hash([rule, component ?? "", file, start, snippet].join("|")) };
}
function ignore(sourceFile, start, rule) {
  const { line } = sourceFile.getLineAndCharacterOfPosition(start);
  const lines = sourceFile.text.split(/\r?\n/);
  const context = lines.slice(Math.max(0, line - 1), line + 1).join("\n");
  return context.includes(`component-vault-ignore ${rule}`) || context.includes("component-vault-ignore all");
}
function moduleMatches(moduleName, forbidden) { return moduleName === forbidden || moduleName.startsWith(`${forbidden}/`); }
function allowedFile(file, rule) { return [rule.source, ...(rule.allowedImportFiles ?? [])].filter(Boolean).some((pattern) => matchesPattern(file, pattern)); }
function importContains(importClause, componentName) {
  if (!importClause) return false;
  if (importClause.name?.text === componentName) return true;
  const bindings = importClause.namedBindings;
  return Boolean(bindings && ts.isNamedImports(bindings) && bindings.elements.some((element) => (element.propertyName?.text ?? element.name.text) === componentName));
}
function staticClassValue(attribute) {
  if (!attribute.initializer) return null;
  if (ts.isStringLiteral(attribute.initializer)) return attribute.initializer.text;
  if (ts.isJsxExpression(attribute.initializer) && attribute.initializer.expression) {
    const expression = attribute.initializer.expression;
    if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) return expression.text;
  }
  return null;
}
function compileForbiddenPatterns(config) {
  if (!Array.isArray(config.rules.forbiddenPatterns)) throw new Error("rules.forbiddenPatterns must be an array.");
  return config.rules.forbiddenPatterns.map((entry, index) => {
    const item = typeof entry === "string" ? { pattern: entry } : entry;
    if (!item || typeof item.pattern !== "string" || !item.pattern) throw new Error(`rules.forbiddenPatterns[${index}] must contain a pattern.`);
    const flags = typeof item.flags === "string" ? item.flags : "g";
    let regex;
    try { regex = new RegExp(item.pattern, flags.includes("g") ? flags : `${flags}g`); } catch (error) { throw new Error(`Invalid forbidden pattern '${item.pattern}': ${error.message}`); }
    return { id: String(item.id ?? `pattern-${index + 1}`), pattern: item.pattern, regex, message: String(item.message ?? "This pattern is forbidden by component-vault.yaml."), suggestion: item.suggestion ? String(item.suggestion) : undefined, severity: String(item.severity ?? "error"), files: Array.isArray(item.files) ? item.files.map(String) : null, components: Array.isArray(item.components) ? item.components.map(String) : null };
  });
}
function scanForbiddenPatterns(file, content, sourceFile, patterns) {
  const violations = [];
  for (const pattern of patterns) {
    if (pattern.files && !pattern.files.some((candidate) => matchesPattern(file, candidate))) continue;
    pattern.regex.lastIndex = 0;
    for (const match of content.matchAll(pattern.regex)) {
      const start = match.index ?? 0;
      if (ignore(sourceFile, start, "CV005")) continue;
      violations.push(violation({ rule: "CV005", component: pattern.components?.length === 1 ? pattern.components[0] : undefined, file, sourceFile, start, snippet: match[0], message: pattern.message, suggestion: pattern.suggestion, severity: pattern.severity, metadata: { patternId: pattern.id, pattern: pattern.pattern, match: match[0] } }));
    }
  }
  return violations;
}
function scanFile(file, content, config, duplicates, forbiddenPatterns) {
  const sourceFile = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, scriptKind(file));
  const violations = scanForbiddenPatterns(file, content, sourceFile, forbiddenPatterns);
  function visit(node) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const moduleName = node.moduleSpecifier.text;
      for (const [componentName, rule] of Object.entries(config.components)) {
        if (allowedFile(file, rule)) continue;
        const forbidden = Array.isArray(rule.forbiddenImports) ? rule.forbiddenImports : [];
        if (forbidden.some((item) => moduleMatches(moduleName, String(item))) && importContains(node.importClause, componentName) && !ignore(sourceFile, node.getStart(sourceFile), "CV001")) violations.push(violation({ rule: "CV001", component: componentName, file, sourceFile, start: node.getStart(sourceFile), snippet: node.getText(sourceFile), message: `Direct import of ${componentName} from ${moduleName} is forbidden.`, suggestion: `Import ${componentName} from ${rule.source}.`, metadata: { moduleName } }));
      }
    }
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tagName = node.tagName.getText(sourceFile);
      const classAttribute = node.attributes.properties.find((attribute) => ts.isJsxAttribute(attribute) && attribute.name.text === "className");
      const classes = classAttribute && ts.isJsxAttribute(classAttribute) ? staticClassValue(classAttribute) : null;
      if (classes) {
        const tokens = classes.trim().split(/\s+/).filter(Boolean);
        if (tokens.length >= Number(config.duplicates.minTokens ?? 5)) {
          const normalized = [...tokens].sort().join(" ");
          const list = duplicates.get(normalized) ?? [];
          list.push({ file, sourceFile, start: classAttribute.getStart(sourceFile), snippet: classAttribute.getText(sourceFile) });
          duplicates.set(normalized, list);
        }
      }
      for (const [componentName, rule] of Object.entries(config.components)) {
        if (allowedFile(file, rule)) continue;
        const rawElements = rule.rawElements ?? {};
        if (Object.hasOwn(rawElements, tagName) && !ignore(sourceFile, node.getStart(sourceFile), "CV003")) {
          const variant = rawElements[tagName];
          violations.push(violation({ rule: "CV003", component: componentName, file, sourceFile, start: node.getStart(sourceFile), snippet: node.getText(sourceFile), message: `Raw <${tagName}> detected in governed JSX.`, suggestion: `Use <${componentName}.${variant}> instead.`, metadata: { element: tagName, variant } }));
        }
        if (tagName.startsWith(`${componentName}.`) && !ignore(sourceFile, node.getStart(sourceFile), "CV002")) {
          const variant = tagName.slice(componentName.length + 1);
          const forbiddenProps = new Set((rule.forbiddenProps ?? []).map(String));
          for (const attribute of node.attributes.properties) if (ts.isJsxAttribute(attribute) && forbiddenProps.has(attribute.name.text)) violations.push(violation({ rule: "CV002", component: componentName, file, sourceFile, start: attribute.getStart(sourceFile), snippet: attribute.getText(sourceFile), message: `${componentName}.${variant} overrides protected prop ${attribute.name.text}.`, suggestion: `Use the documented ${componentName}.${variant} style or create a governed variant.`, metadata: { variant, prop: attribute.name.text } }));
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return violations;
}
function duplicateViolations(duplicates, config) {
  if (!config.duplicates.enabled) return [];
  const output = [];
  for (const [classes, items] of duplicates) {
    if (items.length < Number(config.duplicates.minOccurrences ?? 5)) continue;
    for (const item of items) output.push(violation({ rule: "CV004", file: item.file, sourceFile: item.sourceFile, start: item.start, snippet: item.snippet, message: `The same static className combination appears ${items.length} times.`, suggestion: "Consider extracting a governed component or reusable style token.", metadata: { occurrences: items.length, classes } }));
  }
  return output;
}
function scan(root, config) {
  const duplicates = new Map();
  const violations = [];
  const patterns = compileForbiddenPatterns(config);
  for (const file of collectFiles(root, config)) violations.push(...scanFile(file, readFileSync(resolve(root, file), "utf8"), config, duplicates, patterns));
  return violations.concat(duplicateViolations(duplicates, config));
}
function compileFixes(config) {
  const entries = config.rules.fixes ?? {};
  if (!entries || typeof entries !== "object" || Array.isArray(entries)) throw new Error("rules.fixes must be a YAML map.");
  return Object.entries(entries).map(([id, value]) => {
    if (!value || typeof value !== "object" || typeof value.pattern !== "string" || typeof value.replace !== "string") throw new Error(`rules.fixes.${id} must contain pattern and replace strings.`);
    const flags = typeof value.flags === "string" ? value.flags : "g";
    let regex;
    try { regex = new RegExp(value.pattern, flags.includes("g") ? flags : `${flags}g`); } catch (error) { throw new Error(`Invalid fix '${id}': ${error.message}`); }
    return { id, regex, pattern: value.pattern, replace: value.replace, files: Array.isArray(value.files) ? value.files.map(String) : null };
  });
}
function applyFixes(root, config, dryRun) {
  const fixes = compileFixes(config);
  let changedFiles = 0;
  let replacements = 0;
  for (const file of collectFiles(root, config)) {
    const path = resolve(root, file);
    const original = readFileSync(path, "utf8");
    let updated = original;
    for (const fix of fixes) {
      if (fix.files && !fix.files.some((candidate) => matchesPattern(file, candidate))) continue;
      fix.regex.lastIndex = 0;
      updated = updated.replace(fix.regex, () => { replacements += 1; return fix.replace; });
    }
    if (updated === original) continue;
    changedFiles += 1;
    console.log(`${dryRun ? "Would fix" : "Fixed"} ${file}`);
    if (!dryRun) writeFileSync(path, updated, "utf8");
  }
  console.log(`\nComponent Vault: ${replacements} replacement(s) in ${changedFiles} file(s).`);
  return { changedFiles, replacements };
}
function printViolations(violations) {
  if (!violations.length) { console.log("Component Vault: no violations found."); return; }
  for (const item of violations) { console.log(`\n[${item.rule}] ${item.title}`); console.log(`${item.file}:${item.line}:${item.column}`); console.log(`  ${item.message}`); if (item.snippet) console.log(`  ${item.snippet}`); if (item.suggestion) console.log(`  → ${item.suggestion}`); }
  console.log(`\nComponent Vault: ${violations.length} violation(s).`);
}
function parseArgs(argv) {
  const positional = argv.slice(2).filter((value) => !value.startsWith("-"));
  return { command: positional[0] ?? "scan", config: positional[1] ?? DEFAULT_CONFIG, dryRun: argv.includes("--dry-run"), check: argv.includes("--check") };
}
function main() {
  const root = process.cwd();
  const args = parseArgs(process.argv);
  try {
    if (args.command === "version" || args.command === "--version") { console.log(`component-vault ${VERSION}`); return; }
    const config = loadConfig(root, args.config);
    if (args.command === "scan" || args.command === "check") { const violations = scan(root, config); printViolations(violations); process.exitCode = violations.length ? 1 : 0; return; }
    if (args.command === "fix") { const result = applyFixes(root, config, args.dryRun || args.check); process.exitCode = args.check && result.replacements > 0 ? 1 : 0; return; }
    throw new Error(`Unknown command: ${args.command}`);
  } catch (error) { console.error(`Component Vault error: ${error.message}`); process.exitCode = 1; }
}
main();
