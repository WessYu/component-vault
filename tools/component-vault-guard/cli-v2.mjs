#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import process from "node:process";
import ts from "typescript";

const VERSION = "0.2.0";
const DEFAULT_CONFIG = "component-vault.yaml";
const DEFAULT_BASELINE = "component-vault.baseline.json";
const RULES = {
  CV001: { title: "Direct component import", explanation: "A governed component was imported directly from a forbidden library instead of the project wrapper." },
  CV002: { title: "Forbidden variant override", explanation: "A semantic component overrides a protected visual prop and can fragment the design system." },
  CV003: { title: "Raw semantic element", explanation: "A real JSX element was used where a governed semantic component should be used." },
  CV004: { title: "Repeated static style", explanation: "The same static className combination appears repeatedly and may deserve extraction." },
};

function parseScalar(raw) {
  const value = raw.trim();
  if (value === "") return {};
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) return value.slice(1, -1).replace(/\\n/g, "\n");
  if (value.startsWith("[") && value.endsWith("]")) {
    const inner = value.slice(1, -1).trim();
    return inner ? inner.split(",").map((item) => parseScalar(item)) : [];
  }
  return value;
}

function stripYamlComment(line) {
  let quote = null;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if ((char === '"' || char === "'") && line[index - 1] !== "\\") quote = quote === char ? null : quote ?? char;
    if (char === "#" && quote === null) return line.slice(0, index);
  }
  return line;
}

function parseYamlSubset(source) {
  const root = {};
  const stack = [{ indent: -1, value: root }];
  for (const originalLine of source.split(/\r?\n/)) {
    const uncommented = stripYamlComment(originalLine).replace(/\s+$/, "");
    if (!uncommented.trim()) continue;
    if (uncommented.trimStart().startsWith("- ")) throw new Error("Use inline YAML arrays such as [src, test]. Dash-style lists are not supported yet.");
    const indent = uncommented.length - uncommented.trimStart().length;
    const line = uncommented.trim();
    const separator = line.indexOf(":");
    if (separator < 1) throw new Error(`Invalid YAML line: ${originalLine}`);
    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1);
    while (stack.length > 1 && indent <= stack.at(-1).indent) stack.pop();
    const parent = stack.at(-1).value;
    const parsed = parseScalar(rawValue);
    parent[key] = parsed;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) stack.push({ indent, value: parsed });
  }
  return root;
}

function loadConfig(root, configPath = DEFAULT_CONFIG) {
  const absolutePath = resolve(root, configPath);
  if (!existsSync(absolutePath)) throw new Error(`Configuration not found: ${configPath}`);
  const config = parseYamlSubset(readFileSync(absolutePath, "utf8"));
  if (config.version !== 1) throw new Error("component-vault.yaml must use version: 1");
  config.scan ??= {};
  config.scan.include ??= ["src"];
  config.scan.exclude ??= ["node_modules", ".next", ".git"];
  config.scan.extensions ??= [".ts", ".tsx", ".js", ".jsx"];
  config.duplicates ??= { enabled: true, minOccurrences: 4, minTokens: 4 };
  config.components ??= {};
  return config;
}

function toPosix(value) { return value.split(sep).join("/"); }
function wildcardToRegExp(pattern) {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*\*/g, "__DOUBLE_STAR__").replace(/\*/g, "[^/]*").replace(/__DOUBLE_STAR__/g, ".*");
  return new RegExp(`^${escaped}$`);
}
function matchesPattern(file, pattern) {
  const normalized = toPosix(pattern).replace(/^\.\//, "");
  if (!normalized.includes("*")) return file === normalized || file.startsWith(`${normalized}/`) || file.split("/").includes(normalized);
  return wildcardToRegExp(normalized).test(file);
}

function collectFiles(root, config) {
  const files = [];
  const extensions = new Set(config.scan.extensions.map(String));
  const excludes = config.scan.exclude.map(String);
  function visit(absolutePath) {
    const relativePath = toPosix(relative(root, absolutePath));
    if (relativePath && excludes.some((pattern) => matchesPattern(relativePath, pattern))) return;
    const stats = statSync(absolutePath);
    if (stats.isDirectory()) {
      for (const child of readdirSync(absolutePath)) visit(join(absolutePath, child));
      return;
    }
    if (extensions.has(extname(absolutePath))) files.push(relativePath);
  }
  for (const include of config.scan.include) {
    const absolute = resolve(root, String(include));
    if (existsSync(absolute)) visit(absolute);
  }
  return files.sort();
}

function scriptKind(file) {
  if (file.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (file.endsWith(".jsx")) return ts.ScriptKind.JSX;
  if (file.endsWith(".js")) return ts.ScriptKind.JS;
  return ts.ScriptKind.TS;
}
function normalizeText(value) { return value.replace(/\s+/g, " ").trim().slice(0, 260); }
function hash(value) { return createHash("sha1").update(value).digest("hex").slice(0, 16); }

function hasIgnoreDirective(sourceFile, node, rule) {
  const start = node.getStart(sourceFile);
  const { line } = sourceFile.getLineAndCharacterOfPosition(start);
  const lines = sourceFile.text.split(/\r?\n/);
  const nearby = lines.slice(Math.max(0, line - 1), line + 1).join("\n");
  return nearby.includes(`component-vault-ignore ${rule}`) || nearby.includes("component-vault-ignore all");
}

function createViolation({ rule, component, file, sourceFile, node, message, suggestion, severity = "error", metadata = {} }) {
  const start = node.getStart(sourceFile);
  const location = sourceFile.getLineAndCharacterOfPosition(start);
  const nodeText = normalizeText(node.getText(sourceFile));
  const fingerprintSeed = [rule, component ?? "", file, start, JSON.stringify(metadata), nodeText].join("|");
  return { rule, title: RULES[rule].title, severity, component, file, line: location.line + 1, column: location.character + 1, snippet: nodeText, message, suggestion, metadata, fingerprint: hash(fingerprintSeed) };
}

function moduleMatches(moduleName, forbidden) { return moduleName === forbidden || moduleName.startsWith(`${forbidden}/`); }
function isAllowedFile(file, rule) {
  const allowed = [rule.source, ...(Array.isArray(rule.allowedImportFiles) ? rule.allowedImportFiles : [])].filter(Boolean).map(String);
  return allowed.some((pattern) => matchesPattern(file, pattern));
}
function importContainsComponent(importClause, componentName) {
  if (!importClause) return false;
  if (importClause.name?.text === componentName) return true;
  const bindings = importClause.namedBindings;
  if (bindings && ts.isNamedImports(bindings)) return bindings.elements.some((element) => (element.propertyName?.text ?? element.name.text) === componentName);
  return false;
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

function scanSourceFile(file, content, config, duplicateOccurrences) {
  const sourceFile = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, scriptKind(file));
  const violations = [];
  function visit(node) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const moduleName = node.moduleSpecifier.text;
      for (const [componentName, rule] of Object.entries(config.components)) {
        if (isAllowedFile(file, rule)) continue;
        const forbiddenImports = Array.isArray(rule.forbiddenImports) ? rule.forbiddenImports.map(String) : [];
        if (forbiddenImports.some((item) => moduleMatches(moduleName, item)) && importContainsComponent(node.importClause, componentName) && !hasIgnoreDirective(sourceFile, node, "CV001")) {
          violations.push(createViolation({ rule: "CV001", component: componentName, file, sourceFile, node, message: `Direct import of ${componentName} from ${moduleName} is forbidden.`, suggestion: `Import ${componentName} from ${rule.source}.`, metadata: { moduleName } }));
        }
      }
    }
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tagName = node.tagName.getText(sourceFile);
      const classAttribute = node.attributes.properties.find((attribute) => ts.isJsxAttribute(attribute) && attribute.name.text === "className");
      if (classAttribute && ts.isJsxAttribute(classAttribute)) {
        const classes = staticClassValue(classAttribute);
        if (classes) {
          const tokens = classes.trim().split(/\s+/).filter(Boolean);
          const minTokens = Number(config.duplicates?.minTokens ?? 4);
          if (tokens.length >= minTokens) {
            const normalized = [...tokens].sort().join(" ");
            const list = duplicateOccurrences.get(normalized) ?? [];
            list.push({ file, sourceFile, node: classAttribute });
            duplicateOccurrences.set(normalized, list);
          }
        }
      }
      for (const [componentName, rule] of Object.entries(config.components)) {
        if (isAllowedFile(file, rule)) continue;
        const rawElements = rule.rawElements && typeof rule.rawElements === "object" ? rule.rawElements : {};
        if (Object.hasOwn(rawElements, tagName) && !hasIgnoreDirective(sourceFile, node, "CV003")) {
          const variant = rawElements[tagName];
          violations.push(createViolation({ rule: "CV003", component: componentName, file, sourceFile, node, message: `Raw <${tagName}> detected in governed JSX.`, suggestion: `Use <${componentName}.${variant}> instead.`, metadata: { element: tagName, variant } }));
        }
        if (tagName.startsWith(`${componentName}.`) && !hasIgnoreDirective(sourceFile, node, "CV002")) {
          const variant = tagName.slice(componentName.length + 1);
          const forbiddenProps = new Set(Array.isArray(rule.forbiddenProps) ? rule.forbiddenProps.map(String) : []);
          for (const attribute of node.attributes.properties) {
            if (!ts.isJsxAttribute(attribute)) continue;
            const prop = attribute.name.text;
            if (!forbiddenProps.has(prop)) continue;
            violations.push(createViolation({ rule: "CV002", component: componentName, file, sourceFile, node: attribute, message: `${componentName}.${variant} overrides protected prop ${prop}.`, suggestion: `Use the documented ${componentName}.${variant} style or create a governed variant.`, metadata: { variant, prop } }));
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return violations;
}

function scanDuplicateStyles(duplicateOccurrences, config) {
  if (!config.duplicates?.enabled) return [];
  const minOccurrences = Number(config.duplicates.minOccurrences ?? 4);
  const violations = [];
  for (const [normalized, items] of duplicateOccurrences) {
    if (items.length < minOccurrences) continue;
    const first = items[0];
    violations.push(createViolation({ rule: "CV004", component: null, file: first.file, sourceFile: first.sourceFile, node: first.node, severity: "warning", message: `Static class combination is repeated ${items.length} times across ${new Set(items.map((item) => item.file)).size} file(s).`, suggestion: "Consider extracting a reusable component, variant, or tokenized utility.", metadata: { occurrences: items.length, normalized, files: [...new Set(items.map((item) => item.file))] } }));
  }
  return violations;
}
function dedupeViolations(violations) {
  const unique = new Map();
  for (const violation of violations) {
    const key = `${violation.rule}|${violation.file}|${violation.line}|${violation.column}|${violation.component ?? ""}|${JSON.stringify(violation.metadata)}`;
    if (!unique.has(key)) unique.set(key, violation);
  }
  return [...unique.values()].sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column || a.rule.localeCompare(b.rule));
}
function scanProject(root, config) {
  const files = collectFiles(root, config);
  const duplicateOccurrences = new Map();
  const violations = [];
  for (const file of files) violations.push(...scanSourceFile(file, readFileSync(resolve(root, file), "utf8"), config, duplicateOccurrences));
  violations.push(...scanDuplicateStyles(duplicateOccurrences, config));
  return { files, violations: dedupeViolations(violations) };
}

function loadBaseline(root, path = DEFAULT_BASELINE) {
  const absolute = resolve(root, path);
  if (!existsSync(absolute)) return { version: 2, generatedAt: null, fingerprints: [], violations: [] };
  const raw = JSON.parse(readFileSync(absolute, "utf8"));
  const violations = Array.isArray(raw.violations) ? raw.violations : [];
  const fingerprints = Array.isArray(raw.fingerprints) ? raw.fingerprints : violations.map((item) => item.fingerprint).filter(Boolean);
  return { version: Number(raw.version ?? 1), generatedAt: raw.generatedAt ?? null, fingerprints, violations };
}
function getChangedFiles(root, baseArg) {
  const candidates = [baseArg, process.env.COMPONENT_VAULT_BASE_REF, "origin/master", "HEAD~1"].filter(Boolean);
  for (const candidate of candidates) {
    try {
      const result = execFileSync("git", ["diff", "--name-only", "--diff-filter=ACMR", `${candidate}...HEAD`], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
      return { base: candidate, files: new Set(result.split(/\r?\n/).filter(Boolean).map(toPosix)) };
    } catch {}
  }
  return { base: null, files: null };
}
function strategyFor(violation, config) { return violation.component ? String(config.components[violation.component]?.strategy ?? "protect") : "protect"; }

function classifyViolations(scan, config, baseline, changed) {
  const baselineSet = new Set(baseline.fingerprints);
  const baselineDetails = new Map(baseline.violations.map((item) => [item.fingerprint, item]));
  const currentErrors = scan.violations.filter((item) => item.severity === "error");
  const currentSet = new Set(currentErrors.map((item) => item.fingerprint));
  const baselineIsEmpty = baselineSet.size === 0;
  const legacy = [];
  const introduced = [];
  for (const violation of currentErrors) {
    if (baselineSet.has(violation.fingerprint)) { legacy.push(violation); continue; }
    const strategy = strategyFor(violation, config);
    const untouchedLegacyFallback = baselineIsEmpty && strategy === "touched" && (!changed.files || !changed.files.has(violation.file));
    if (untouchedLegacyFallback) legacy.push(violation); else introduced.push(violation);
  }
  const resolved = baseline.fingerprints.filter((fingerprint) => !currentSet.has(fingerprint)).map((fingerprint) => baselineDetails.get(fingerprint) ?? { fingerprint, component: null, rule: null, file: null });
  const migrationTotal = Math.max(baselineSet.size, legacy.length + resolved.length);
  const migrationProgress = migrationTotal === 0 ? (currentErrors.length === 0 ? 100 : 0) : Math.round((resolved.length / migrationTotal) * 100);
  return { legacy, introduced, resolved, migrationTotal, migrationProgress };
}
function evaluatePolicy(violations, config, baseline, changedFiles) {
  const known = new Set(baseline.fingerprints);
  const blocking = [];
  for (const violation of violations) {
    if (violation.severity !== "error") continue;
    const strategy = strategyFor(violation, config);
    if (strategy === "full") blocking.push(violation);
    else if (strategy === "touched") { if (!changedFiles || changedFiles.has(violation.file)) blocking.push(violation); }
    else if (!known.has(violation.fingerprint)) blocking.push(violation);
  }
  return dedupeViolations(blocking);
}
function summarize(scan, blocking, config, baseline, changed) {
  const warnings = scan.violations.filter((item) => item.severity === "warning").length;
  const errors = scan.violations.filter((item) => item.severity === "error").length;
  const classification = classifyViolations(scan, config, baseline, changed);
  const components = Object.fromEntries(Object.keys(config.components).map((name) => {
    const current = scan.violations.filter((item) => item.component === name);
    const legacy = classification.legacy.filter((item) => item.component === name).length;
    const introduced = classification.introduced.filter((item) => item.component === name).length;
    const resolved = classification.resolved.filter((item) => item.component === name).length;
    const total = legacy + resolved;
    return [name, { strategy: String(config.components[name].strategy ?? "protect"), violations: current.length, errors: current.filter((item) => item.severity === "error").length, warnings: current.filter((item) => item.severity === "warning").length, legacy, new: introduced, resolved, migrationProgress: total ? Math.round((resolved / total) * 100) : (legacy ? 0 : 100) }];
  }));
  return { score: classification.migrationProgress, migrationProgress: classification.migrationProgress, migrationTotal: classification.migrationTotal, baseline: Math.max(baseline.fingerprints.length, classification.migrationTotal), legacy: classification.legacy.length, new: classification.introduced.length, resolved: classification.resolved.length, filesScanned: scan.files.length, violations: scan.violations.length, errors, warnings, blocking: blocking.length, changedFiles: changed.files ? changed.files.size : null, base: changed.base, components };
}
function printViolation(violation, blockingFingerprints = new Set()) {
  const marker = blockingFingerprints.has(violation.fingerprint) ? "X" : violation.severity === "warning" ? "!" : "-";
  console.log(`${marker} ${violation.rule} ${violation.file}:${violation.line}:${violation.column} — ${violation.message}`);
  if (violation.snippet) console.log(`  ${violation.snippet}`);
  if (violation.suggestion) console.log(`  Fix: ${violation.suggestion}`);
}
function printReport(scan, blocking, config, baseline, changed) {
  const summary = summarize(scan, blocking, config, baseline, changed);
  console.log(`\nComponent Vault Guard v${VERSION}`);
  console.log(`Migration ${summary.migrationProgress}% · ${summary.legacy} legacy · ${summary.new} new · ${summary.resolved} resolved · ${summary.blocking} blocking`);
  if (summary.base) console.log(`Diff base: ${summary.base} · ${summary.changedFiles} changed files`);
  const blockingSet = new Set(blocking.map((item) => item.fingerprint));
  for (const violation of scan.violations) printViolation(violation, blockingSet);
  console.log(blocking.length ? `\nGuard failed with ${blocking.length} blocking violation(s).` : "\nGuard passed with no blocking violations.");
  return summary;
}
function createReport(scan, blocking, config, baseline, changed) { return { version: 2, generatedAt: new Date().toISOString(), engine: "typescript-ast", summary: summarize(scan, blocking, config, baseline, changed), violations: scan.violations }; }
function writeJson(root, output, value) {
  const absolute = resolve(root, output);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, `${JSON.stringify(value, null, 2)}\n`);
  console.log(`Written ${toPosix(relative(root, absolute))}`);
}
function generateContext(config) {
  const structured = { version: 2, generatedAt: new Date().toISOString(), components: Object.fromEntries(Object.entries(config.components).map(([name, rule]) => [name, { source: rule.source, strategy: rule.strategy ?? "protect", variants: rule.variants ?? {}, forbiddenProps: rule.forbiddenProps ?? [], forbiddenImports: rule.forbiddenImports ?? [], rawElements: rule.rawElements ?? {} }])) };
  const lines = ["# Component Vault agent context", "", "Use these rules before creating or changing UI components.", ""];
  for (const [name, rule] of Object.entries(structured.components)) {
    lines.push(`## ${name}`, "", `- Import from \`${rule.source}\`.`, `- Migration strategy: \`${rule.strategy}\`.`);
    if (rule.forbiddenImports.length) lines.push(`- Never import ${name} from: ${rule.forbiddenImports.map((item) => `\`${item}\``).join(", ")}.`);
    if (rule.forbiddenProps.length) lines.push(`- Do not override: ${rule.forbiddenProps.map((item) => `\`${item}\``).join(", ")}.`);
    const variants = Object.entries(rule.variants);
    if (variants.length) { lines.push("", "Available variants:"); for (const [variant, description] of variants) lines.push(`- \`${name}.${variant}\`: ${description}`); }
    lines.push("", "Temporary exception: add `// component-vault-ignore CV003` immediately above intentional raw JSX.", "");
  }
  return { structured, markdown: `${lines.join("\n").trim()}\n` };
}
function parseArgs(argv) {
  const [command = "scan", ...rest] = argv;
  const options = {};
  const positional = [];
  for (let index = 0; index < rest.length; index += 1) {
    const item = rest[index];
    if (!item.startsWith("--")) { positional.push(item); continue; }
    const key = item.slice(2);
    const next = rest[index + 1];
    if (!next || next.startsWith("--")) options[key] = true;
    else { options[key] = next; index += 1; }
  }
  return { command, options, positional };
}
function printHelp() { console.log(`Component Vault Guard v${VERSION}\n\nCommands:\n  scan                 Scan AST and print findings\n  check [--base REF]   Enforce protect, touched and full strategies\n  baseline             Record current AST errors as accepted legacy\n  report [--output]    Generate a JSON migration report\n  context              Generate agent-readable Markdown and JSON\n  explain CV001        Explain a rule\n  init                  Create a starter component-vault.yaml\n`); }
function starterConfig() { return `version: 1\n\nscan:\n  include: [src]\n  exclude: [node_modules, .next, .git]\n  extensions: [.ts, .tsx, .js, .jsx]\n\nduplicates:\n  enabled: true\n  minOccurrences: 4\n  minTokens: 4\n\ncomponents:\n  Text:\n    source: src/components/ui/text.tsx\n    allowedImportFiles: [src/components/ui/text.tsx]\n    forbiddenImports: [tamagui, \"@radix-ui/themes\"]\n    forbiddenProps: [fontSize, lineHeight, fontWeight]\n    strategy: touched\n    rawElements:\n      h1: H1\n      h2: H2\n      p: Paragraph\n      small: Caption\n    variants:\n      H1: Main page title\n      H2: Section heading\n      Paragraph: Default body text\n      Caption: Secondary supporting text\n`; }

function main() {
  const root = process.cwd();
  const { command, options, positional } = parseArgs(process.argv.slice(2));
  if (["help", "--help", "-h"].includes(command)) return printHelp();
  if (command === "init") {
    const output = String(options.output ?? DEFAULT_CONFIG);
    if (existsSync(resolve(root, output))) throw new Error(`${output} already exists.`);
    writeFileSync(resolve(root, output), starterConfig());
    console.log(`Created ${output}`);
    return;
  }
  if (command === "explain") {
    const code = positional[0];
    if (!RULES[code]) throw new Error(`Unknown rule: ${code ?? "missing"}`);
    console.log(`${code} — ${RULES[code].title}\n${RULES[code].explanation}`);
    return;
  }
  const configPath = String(options.config ?? DEFAULT_CONFIG);
  const baselinePath = String(options.baseline ?? DEFAULT_BASELINE);
  const config = loadConfig(root, configPath);
  const scan = scanProject(root, config);
  const baseline = loadBaseline(root, baselinePath);
  const changed = getChangedFiles(root, typeof options.base === "string" ? options.base : undefined);
  const blocking = evaluatePolicy(scan.violations, config, baseline, changed.files);
  if (command === "scan") return void printReport(scan, [], config, baseline, changed);
  if (command === "check") { printReport(scan, blocking, config, baseline, changed); if (blocking.length) process.exitCode = 1; return; }
  if (command === "baseline") {
    const errors = scan.violations.filter((item) => item.severity === "error");
    writeJson(root, baselinePath, { version: 2, generatedAt: new Date().toISOString(), fingerprints: errors.map((item) => item.fingerprint).sort(), violations: errors.map(({ fingerprint, rule, component, file, line, column, message }) => ({ fingerprint, rule, component, file, line, column, message })) });
    console.log(`Accepted ${errors.length} current AST error(s) as legacy.`);
    return;
  }
  if (command === "report") {
    const output = String(options.output ?? "public/component-vault-report.json");
    const reportBlocking = changed.files ? blocking : blocking.filter((violation) => strategyFor(violation, config) !== "touched");
    writeJson(root, output, createReport(scan, reportBlocking, config, baseline, changed));
    printReport(scan, reportBlocking, config, baseline, changed);
    return;
  }
  if (command === "context") {
    const output = String(options.output ?? ".component-vault");
    const context = generateContext(config);
    writeJson(root, `${output}/context.json`, context.structured);
    const markdownPath = resolve(root, `${output}/AGENTS.md`);
    mkdirSync(dirname(markdownPath), { recursive: true });
    writeFileSync(markdownPath, context.markdown);
    console.log(`Written ${toPosix(relative(root, markdownPath))}`);
    return;
  }
  throw new Error(`Unknown command: ${command}. Run "node tools/component-vault-guard/cli-v2.mjs help".`);
}
try { main(); } catch (error) { console.error(`Component Vault Guard: ${error instanceof Error ? error.message : String(error)}`); process.exitCode = 1; }
