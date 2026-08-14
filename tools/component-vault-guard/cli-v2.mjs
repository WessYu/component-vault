#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { extname, join, relative, resolve, sep, dirname } from "node:path";
import process from "node:process";
import ts from "typescript";
import YAML from "yaml";

const VERSION = "0.3.1";
const DEFAULT_CONFIG = "component-vault.yaml";
const DEFAULT_BASELINE = "component-vault.baseline.json";
const RULES = {
  CV001: "Direct component import",
  CV002: "Forbidden variant override",
  CV003: "Raw semantic element",
  CV004: "Repeated static style",
  CV005: "Forbidden pattern",
};

const toPosix = (value) => value.split(sep).join("/");
const hash = (value) => createHash("sha1").update(value).digest("hex").slice(0, 16);

function parseArgs(argv) {
  const command = argv[0] ?? "scan";
  const options = {};
  for (let i = 1; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith("--")) continue;
    const key = item.slice(2);
    const next = argv[i + 1];
    options[key] = next && !next.startsWith("--") ? next : true;
    if (options[key] !== true) i += 1;
  }
  return { command, options };
}

function loadConfig(root, configPath = DEFAULT_CONFIG) {
  const path = resolve(root, configPath);
  if (!existsSync(path)) throw new Error(`Configuration not found: ${configPath}`);
  const config = YAML.parse(readFileSync(path, "utf8"));
  if (!config || config.version !== 1) throw new Error("component-vault.yaml must use version: 1");
  config.scan ??= {};
  config.scan.include ??= ["src"];
  config.scan.exclude ??= ["node_modules", ".next", ".git", "dist", "build", "coverage"];
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
  if (!normalized.includes("*")) return file === normalized || file.startsWith(`${normalized}/");
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
    if (stats.isDirectory()) {
      for (const child of readdirSync(path)) visit(join(path, child));
      return;
    }
    if (extensions.has(extname(path))) files.push(rel);
  }
  for (const include of config.scan.include) {
    const path = resolve(root, String(include));
    if (existsSync(path)) visit(path);
  }
  return files.sort();
}

function scriptKind(file) {
  if (file.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (file.endsWith(".jsx")) return ts.ScriptKind.JSX;
  if (file.endsWith(".js")) return ts.ScriptKind.JS;
  return ts.ScriptKind.TS;
}

function ignored(sourceFile, start, rule) {
  const { line } = sourceFile.getLineAndCharacterOfPosition(start);
  const lines = sourceFile.text.split(/\r?\n/);
  const context = lines.slice(Math.max(0, line - 1), line + 1).join("\n");
  return context.includes(`component-vault-ignore ${rule}`) || context.includes("component-vault-ignore all");
}

function makeViolation({ rule, component, file, sourceFile, start, snippet, message, suggestion, metadata = {}, severity = "error" }) {
  const location = sourceFile.getLineAndCharacterOfPosition(start);
  return {
    rule,
    title: RULES[rule] ?? rule,
    severity,
    component,
    file,
    line: location.line + 1,
    column: location.character + 1,
    snippet: String(snippet).replace(/\s+/g, " ").trim().slice(0, 280),
    message,
    suggestion,
    metadata,
    fingerprint: hash([rule, component ?? "", file, snippet].join("|")),
  };
}

function allowedFile(file, rule) {
  return [rule.source, ...(rule.allowedImportFiles ?? [])].filter(Boolean).some((pattern) => matchesPattern(file, pattern));
}

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
    const regex = new RegExp(item.pattern, flags.includes("g") ? flags : `${flags}g`);
    return {
      id: String(item.id ?? `pattern-${index + 1}`),
      pattern: item.pattern,
      regex,
      message: String(item.message ?? "This pattern is forbidden by component-vault.yaml."),
      suggestion: item.suggestion ? String(item.suggestion) : undefined,
      severity: String(item.severity ?? "error"),
      files: Array.isArray(item.files) ? item.files.map(String) : null,
      components: Array.isArray(item.components) ? item.components.map(String) : null,
    };
  });
}

function scanFile(file, content, config, duplicates, patterns) {
  const sourceFile = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, scriptKind(file));
  const violations = [];

  for (const pattern of patterns) {
    if (pattern.files && !pattern.files.some((candidate) => matchesPattern(file, candidate))) continue;
    pattern.regex.lastIndex = 0;
    for (const match of content.matchAll(pattern.regex)) {
      const start = match.index ?? 0;
      if (ignored(sourceFile, start, "CV005")) continue;
      violations.push(makeViolation({
        rule: "CV005",
        component: pattern.components?.length === 1 ? pattern.components[0] : undefined,
        file,
        sourceFile,
        start,
        snippet: match[0],
        message: pattern.message,
        suggestion: pattern.suggestion,
        severity: pattern.severity,
        metadata: { patternId: pattern.id, pattern: pattern.pattern, match: match[0] },
      }));
    }
  }

  function visit(node) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const moduleName = node.moduleSpecifier.text;
      for (const [componentName, rule] of Object.entries(config.components)) {
        if (allowedFile(file, rule)) continue;
        const forbidden = Array.isArray(rule.forbiddenImports) ? rule.forbiddenImports.map(String) : [];
        if (forbidden.some((item) => moduleName === item || moduleName.startsWith(`${item}/`)) && importContains(node.importClause, componentName) && !ignored(sourceFile, node.getStart(sourceFile), "CV001")) {
          violations.push(makeViolation({
            rule: "CV001",
            component: componentName,
            file,
            sourceFile,
            start: node.getStart(sourceFile),
            snippet: node.getText(sourceFile),
            message: `Direct import of ${componentName} from ${moduleName} is forbidden.`,
            suggestion: `Import ${componentName} from ${rule.source}.`,
            metadata: { moduleName },
          }));
        }
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
        if (Object.hasOwn(rawElements, tagName) && !ignored(sourceFile, node.getStart(sourceFile), "CV003")) {
          const variant = rawElements[tagName];
          violations.push(makeViolation({
            rule: "CV003",
            component: componentName,
            file,
            sourceFile,
            start: node.getStart(sourceFile),
            snippet: node.getText(sourceFile),
            message: `Raw <${tagName}> detected in governed JSX.`,
            suggestion: `Use <${componentName}.${variant}> instead.`,
            metadata: { element: tagName, variant },
          }));
        }
        if (tagName.startsWith(`${componentName}.`) && !ignored(sourceFile, node.getStart(sourceFile), "CV002")) {
          const variant = tagName.slice(componentName.length + 1);
          const forbiddenProps = new Set((rule.forbiddenProps ?? []).map(String));
          for (const attribute of node.attributes.properties) {
            if (ts.isJsxAttribute(attribute) && forbiddenProps.has(attribute.name.text)) {
              violations.push(makeViolation({
                rule: "CV002",
                component: componentName,
                file,
                sourceFile,
                start: attribute.getStart(sourceFile),
                snippet: attribute.getText(sourceFile),
                message: `${componentName}.${variant} overrides protected prop ${attribute.name.text}.`,
                suggestion: `Use the documented ${componentName}.${variant} style or create a governed variant.`,
                metadata: { variant, prop: attribute.name.text },
              }));
            }
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return violations;
}

function scan(root, config) {
  const duplicates = new Map();
  const patterns = compileForbiddenPatterns(config);
  const violations = [];
  for (const file of collectFiles(root, config)) {
    violations.push(...scanFile(file, readFileSync(resolve(root, file), "utf8"), config, duplicates, patterns));
  }
  if (config.duplicates.enabled) {
    for (const [classes, items] of duplicates) {
      if (items.length < Number(config.duplicates.minOccurrences ?? 5)) continue;
      for (const item of items) violations.push(makeViolation({
        rule: "CV004",
        file: item.file,
        sourceFile: item.sourceFile,
        start: item.start,
        snippet: item.snippet,
        message: `The same static className combination appears ${items.length} times.`,
        suggestion: "Consider extracting a governed component or reusable style token.",
        metadata: { occurrences: items.length, classes },
      }));
    }
  }
  return violations;
}

function loadBaseline(root, path = DEFAULT_BASELINE) {
  const absolute = resolve(root, path);
  if (!existsSync(absolute)) return { version: 2, generatedAt: null, fingerprints: [], violations: [] };
  try {
    return JSON.parse(readFileSync(absolute, "utf8"));
  } catch {
    throw new Error(`Invalid baseline JSON: ${path}`);
  }
}

function changedFiles(root, base) {
  if (!base) return null;
  try {
    const output = execFileSync("git", ["diff", "--name-only", `${base}...HEAD`], { cwd: root, encoding: "utf8" });
    return new Set(output.split(/\r?\n/).map((item) => item.trim()).filter(Boolean).map(toPosix));
  } catch {
    return new Set();
  }
}

function blockingViolations(root, violations, config, base) {
  const changed = changedFiles(root, base);
  if (!changed) return violations;
  return violations.filter((item) => {
    const rule = config.components[item.component] ?? {};
    const strategy = rule.strategy ?? "touched";
    if (strategy === "protect") return true;
    if (strategy === "full") return true;
    return changed.has(item.file);
  });
}

function baseline(root, config, baselinePath) {
  const violations = scan(root, config);
  const payload = {
    version: 2,
    generatedAt: new Date().toISOString(),
    fingerprints: violations.map((item) => item.fingerprint),
    violations,
  };
  const path = resolve(root, baselinePath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Component Vault: baseline captured ${violations.length} violation(s).`);
}

function report(root, config, baselinePath, outputPath, base) {
  const violations = scan(root, config);
  const baselineData = loadBaseline(root, baselinePath);
  const baselineSet = new Set(baselineData.fingerprints ?? []);
  const currentSet = new Set(violations.map((item) => item.fingerprint));
  const legacy = violations.filter((item) => baselineSet.has(item.fingerprint));
  const fresh = violations.filter((item) => !baselineSet.has(item.fingerprint));
  const resolved = (baselineData.fingerprints ?? []).filter((fingerprint) => !currentSet.has(fingerprint)).length;
  const blocking = blockingViolations(root, fresh, config, base);
  const totalBaseline = (baselineData.fingerprints ?? []).length;
  const migrationProgress = totalBaseline === 0 ? (fresh.length === 0 ? 100 : 0) : Math.round((resolved / totalBaseline) * 100);
  const payload = {
    engine: "typescript-ast",
    generatedAt: new Date().toISOString(),
    violations,
    summary: {
      migrationProgress,
      legacy: legacy.length,
      resolved,
      new: fresh.length,
      blocking: blocking.length,
      filesScanned: collectFiles(root, config).length,
    },
  };
  const path = resolve(root, outputPath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Component Vault: report generated with ${blocking.length} blocking violation(s).`);
  return payload;
}

function fix(root, config, dryRun) {
  const entries = Object.entries(config.rules.fixes ?? {});
  let replacements = 0;
  let files = 0;
  for (const file of collectFiles(root, config)) {
    const path = resolve(root, file);
    const original = readFileSync(path, "utf8");
    let updated = original;
    for (const [id, value] of entries) {
      if (!value || typeof value.pattern !== "string" || typeof value.replace !== "string") throw new Error(`rules.fixes.${id} must contain pattern and replace strings.`);
      const flags = typeof value.flags === "string" ? value.flags : "g";
      const regex = new RegExp(value.pattern, flags.includes("g") ? flags : `${flags}g`);
      if (value.files && !value.files.some((candidate) => matchesPattern(file, candidate))) continue;
      const before = updated;
      updated = updated.replace(regex, value.replace);
      if (updated !== before) replacements += 1;
    }
    if (updated === original) continue;
    files += 1;
    console.log(`${dryRun ? "Would fix" : "Fixed"} ${file}`);
    if (!dryRun) writeFileSync(path, updated, "utf8");
  }
  console.log(`Component Vault: ${replacements} replacement(s) in ${files} file(s).`);
  return { replacements, files };
}

function printViolations(violations) {
  if (!violations.length) {
    console.log("Component Vault: no violations found.");
    return;
  }
  for (const item of violations) {
    console.log(`\n[${item.rule}] ${item.title}`);
    console.log(`${item.file}:${item.line}:${item.column}`);
    console.log(`  ${item.message}`);
    if (item.snippet) console.log(`  ${item.snippet}`);
    if (item.suggestion) console.log(`  → ${item.suggestion}`);
  }
  console.log(`\nComponent Vault: ${violations.length} violation(s).`);
}

function main() {
  const root = process.cwd();
  const { command, options } = parseArgs(process.argv.slice(2));
  try {
    if (["version", "--version"].includes(command)) return console.log(`component-vault ${VERSION}`);
    const config = loadConfig(root, String(options.config ?? DEFAULT_CONFIG));

    if (command === "scan") {
      printViolations(scan(root, config));
      process.exitCode = 0;
      return;
    }
    if (command === "check") {
      const violations = scan(root, config);
      const blocking = blockingViolations(root, violations, config, typeof options.base === "string" ? options.base : undefined);
      printViolations(blocking);
      if (blocking.length) console.log(`\n${blocking.length} blocking violation${blocking.length === 1 ? "" : "s"}.`);
      else console.log("\n0 blocking violations.");
      process.exitCode = blocking.length ? 1 : 0;
      return;
    }
    if (command === "baseline") {
      baseline(root, config, String(options.baseline ?? DEFAULT_BASELINE));
      process.exitCode = 0;
      return;
    }
    if (command === "report") {
      report(root, config, String(options.baseline ?? DEFAULT_BASELINE), String(options.output ?? "public/component-vault-report.json"), typeof options.base === "string" ? options.base : undefined);
      process.exitCode = 0;
      return;
    }
    if (command === "fix") {
      const result = fix(root, config, Boolean(options["dry-run"] || options.check));
      process.exitCode = options.check && result.replacements > 0 ? 1 : 0;
      return;
    }
    throw new Error(`Unknown command: ${command}`);
  } catch (error) {
    console.error(`Component Vault error: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}

main();
