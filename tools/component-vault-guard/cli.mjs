#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import process from "node:process";

const VERSION = "0.1.0";
const DEFAULT_CONFIG = "component-vault.yaml";
const DEFAULT_BASELINE = "component-vault.baseline.json";
const RULES = {
  CV001: {
    title: "Direct component import",
    explanation: "A governed component was imported directly from a forbidden external library instead of through the project wrapper.",
  },
  CV002: {
    title: "Forbidden variant override",
    explanation: "A semantic component variant overrides a protected visual prop, which can fragment the design system.",
  },
  CV003: {
    title: "Raw semantic element",
    explanation: "A raw HTML element was used where the governed semantic component should be used.",
  },
  CV004: {
    title: "Repeated static style",
    explanation: "The same static className combination appears repeatedly and may deserve extraction into a reusable component or variant.",
  },
};

function parseScalar(raw) {
  const value = raw.trim();
  if (value === "") return {};
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1).replace(/\\n/g, "\n");
  }
  if (value.startsWith("[") && value.endsWith("]")) {
    const inner = value.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(",").map((item) => parseScalar(item));
  }
  return value;
}

function stripYamlComment(line) {
  let quote = null;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if ((char === '"' || char === "'") && line[index - 1] !== "\\") {
      quote = quote === char ? null : quote ?? char;
    }
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
    if (uncommented.trimStart().startsWith("- ")) {
      throw new Error("Use inline YAML arrays such as [src, test]. Dash-style lists are not supported yet.");
    }

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

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      stack.push({ indent, value: parsed });
    }
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

function toPosix(value) {
  return value.split(sep).join("/");
}

function wildcardToRegExp(pattern) {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*\*/g, "__DOUBLE_STAR__").replace(/\*/g, "[^/]*").replace(/__DOUBLE_STAR__/g, ".*");
  return new RegExp(`^${escaped}$`);
}

function matchesPattern(file, pattern) {
  const normalized = toPosix(pattern).replace(/^\.\//, "");
  if (!normalized.includes("*")) {
    return file === normalized || file.startsWith(`${normalized}/`) || file.split("/").includes(normalized);
  }
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

function lineAt(content, index) {
  return content.slice(0, index).split("\n").length;
}

function lineSnippet(content, index) {
  const start = content.lastIndexOf("\n", index) + 1;
  const end = content.indexOf("\n", index);
  return content.slice(start, end === -1 ? content.length : end).trim().replace(/\s+/g, " ").slice(0, 220);
}

function fingerprint(violation) {
  const stable = [violation.rule, violation.component ?? "", violation.file, violation.snippet.replace(/\d+/g, "#")].join("|");
  return createHash("sha1").update(stable).digest("hex").slice(0, 16);
}

function makeViolation({ rule, component, file, content, index, message, suggestion, severity = "error", metadata = {} }) {
  const violation = {
    rule,
    title: RULES[rule].title,
    severity,
    component,
    file,
    line: lineAt(content, index),
    snippet: lineSnippet(content, index),
    message,
    suggestion,
    metadata,
  };
  violation.fingerprint = fingerprint(violation);
  return violation;
}

function moduleMatches(moduleName, forbidden) {
  return moduleName === forbidden || moduleName.startsWith(`${forbidden}/`);
}

function isAllowedFile(file, rule) {
  const allowed = [rule.source, ...(Array.isArray(rule.allowedImportFiles) ? rule.allowedImportFiles : [])].filter(Boolean).map(String);
  return allowed.some((pattern) => matchesPattern(file, pattern));
}

function scanComponentRules(file, content, componentName, rule) {
  if (isAllowedFile(file, rule)) return [];
  const violations = [];

  const forbiddenImports = Array.isArray(rule.forbiddenImports) ? rule.forbiddenImports.map(String) : [];
  const importRegex = /import\s+([^;]+?)\s+from\s+["']([^"']+)["'];?/g;
  for (const match of content.matchAll(importRegex)) {
    const [, importClause, moduleName] = match;
    const importsComponent = new RegExp(`\\b${componentName}\\b`).test(importClause);
    if (importsComponent && forbiddenImports.some((item) => moduleMatches(moduleName, item))) {
      violations.push(makeViolation({
        rule: "CV001",
        component: componentName,
        file,
        content,
        index: match.index,
        message: `Direct import of ${componentName} from ${moduleName} is forbidden.`,
        suggestion: `Import ${componentName} from ${rule.source}.`,
        metadata: { moduleName },
      }));
    }
  }

  const forbiddenProps = Array.isArray(rule.forbiddenProps) ? rule.forbiddenProps.map(String) : [];
  const compoundRegex = new RegExp(`<${componentName}\\.([A-Za-z0-9_]+)\\b([\\s\\S]*?)(?:\\/>|>)`, "g");
  for (const match of content.matchAll(compoundRegex)) {
    const variant = match[1];
    const attributes = match[2] ?? "";
    for (const prop of forbiddenProps) {
      if (new RegExp(`(?:^|\\s)${prop}\\s*=`).test(attributes)) {
        violations.push(makeViolation({
          rule: "CV002",
          component: componentName,
          file,
          content,
          index: match.index,
          message: `${componentName}.${variant} overrides protected prop ${prop}.`,
          suggestion: `Use the documented ${componentName}.${variant} style or create a governed variant.`,
          metadata: { variant, prop },
        }));
      }
    }
  }

  const rawElements = rule.rawElements && typeof rule.rawElements === "object" ? rule.rawElements : {};
  for (const [element, variant] of Object.entries(rawElements)) {
    const rawRegex = new RegExp(`<${element}\\b`, "g");
    for (const match of content.matchAll(rawRegex)) {
      violations.push(makeViolation({
        rule: "CV003",
        component: componentName,
        file,
        content,
        index: match.index,
        message: `Raw <${element}> detected in a governed typography area.`,
        suggestion: `Use <${componentName}.${variant}> instead.`,
        metadata: { element, variant },
      }));
    }
  }

  return violations;
}

function scanDuplicateStyles(fileEntries, config) {
  if (!config.duplicates?.enabled) return [];
  const minOccurrences = Number(config.duplicates.minOccurrences ?? 4);
  const minTokens = Number(config.duplicates.minTokens ?? 4);
  const occurrences = new Map();

  for (const { file, content } of fileEntries) {
    const classRegex = /className\s*=\s*["']([^"']+)["']/g;
    for (const match of content.matchAll(classRegex)) {
      const classes = match[1].trim().split(/\s+/).filter(Boolean);
      if (classes.length < minTokens) continue;
      const normalized = [...classes].sort().join(" ");
      const item = { file, content, index: match.index, classes: match[1] };
      const list = occurrences.get(normalized) ?? [];
      list.push(item);
      occurrences.set(normalized, list);
    }
  }

  const violations = [];
  for (const [normalized, items] of occurrences) {
    if (items.length < minOccurrences) continue;
    const first = items[0];
    violations.push(makeViolation({
      rule: "CV004",
      component: null,
      file: first.file,
      content: first.content,
      index: first.index,
      severity: "warning",
      message: `Static class combination is repeated ${items.length} times across ${new Set(items.map((item) => item.file)).size} file(s).`,
      suggestion: "Consider extracting a reusable component, variant, or tokenized utility.",
      metadata: { occurrences: items.length, normalized, files: [...new Set(items.map((item) => item.file))] },
    }));
  }
  return violations;
}

function scanProject(root, config) {
  const files = collectFiles(root, config);
  const fileEntries = files.map((file) => ({ file, content: readFileSync(resolve(root, file), "utf8") }));
  const violations = [];

  for (const entry of fileEntries) {
    for (const [componentName, rule] of Object.entries(config.components)) {
      violations.push(...scanComponentRules(entry.file, entry.content, componentName, rule));
    }
  }
  violations.push(...scanDuplicateStyles(fileEntries, config));

  violations.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.rule.localeCompare(b.rule));
  return { files, violations };
}

function loadBaseline(root, path = DEFAULT_BASELINE) {
  const absolute = resolve(root, path);
  if (!existsSync(absolute)) return { version: 1, fingerprints: [] };
  const baseline = JSON.parse(readFileSync(absolute, "utf8"));
  return { version: 1, fingerprints: Array.isArray(baseline.fingerprints) ? baseline.fingerprints : [] };
}

function getChangedFiles(root, baseArg) {
  const candidates = [baseArg, process.env.COMPONENT_VAULT_BASE_REF, "origin/master", "HEAD~1"].filter(Boolean);
  for (const candidate of candidates) {
    try {
      const result = execFileSync("git", ["diff", "--name-only", "--diff-filter=ACMR", `${candidate}...HEAD`], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
      return { base: candidate, files: new Set(result.split(/\r?\n/).filter(Boolean).map(toPosix)) };
    } catch {
      // Try the next base candidate.
    }
  }
  return { base: null, files: null };
}

function strategyFor(violation, config) {
  if (!violation.component) return "protect";
  return String(config.components[violation.component]?.strategy ?? "protect");
}

function evaluatePolicy(violations, config, baseline, changedFiles) {
  const known = new Set(baseline.fingerprints);
  const blocking = [];
  for (const violation of violations) {
    if (violation.severity !== "error") continue;
    const strategy = strategyFor(violation, config);
    if (strategy === "full") blocking.push(violation);
    else if (strategy === "touched") {
      if (!changedFiles || changedFiles.has(violation.file)) blocking.push(violation);
    } else if (!known.has(violation.fingerprint)) {
      blocking.push(violation);
    }
  }
  return blocking;
}

function summarize(scan, blocking, config, changed) {
  const errors = scan.violations.filter((item) => item.severity === "error").length;
  const warnings = scan.violations.length - errors;
  const score = Math.max(0, Math.round(100 - errors * 1.5 - warnings * 0.2));
  const components = Object.fromEntries(Object.keys(config.components).map((name) => {
    const violations = scan.violations.filter((item) => item.component === name);
    return [name, {
      strategy: String(config.components[name].strategy ?? "protect"),
      violations: violations.length,
      errors: violations.filter((item) => item.severity === "error").length,
      warnings: violations.filter((item) => item.severity === "warning").length,
    }];
  }));
  return {
    score,
    scoreFormula: "100 - (errors x 1.5) - (warnings x 0.2)",
    filesScanned: scan.files.length,
    violations: scan.violations.length,
    errors,
    warnings,
    blocking: blocking.length,
    changedFiles: changed?.files ? changed.files.size : null,
    base: changed?.base ?? null,
    components,
  };
}

function printViolation(violation, blockingFingerprints = new Set()) {
  const marker = blockingFingerprints.has(violation.fingerprint) ? "X" : violation.severity === "warning" ? "!" : "-";
  console.log(`${marker} ${violation.rule} ${violation.file}:${violation.line} — ${violation.message}`);
  if (violation.snippet) console.log(`  ${violation.snippet}`);
  if (violation.suggestion) console.log(`  Fix: ${violation.suggestion}`);
}

function printReport(scan, blocking, config, changed) {
  const summary = summarize(scan, blocking, config, changed);
  console.log(`\nComponent Vault Guard v${VERSION}`);
  console.log(`Health ${summary.score}/100 · ${summary.filesScanned} files · ${summary.errors} errors · ${summary.warnings} warnings`);
  if (summary.base) console.log(`Diff base: ${summary.base} · ${summary.changedFiles} changed files`);
  const blockingSet = new Set(blocking.map((item) => item.fingerprint));
  for (const violation of scan.violations) printViolation(violation, blockingSet);
  console.log(blocking.length ? `\nGuard failed with ${blocking.length} blocking violation(s).` : "\nGuard passed with no blocking violations.");
  return summary;
}

function createReport(scan, blocking, config, changed) {
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    summary: summarize(scan, blocking, config, changed),
    violations: scan.violations,
  };
}

function writeJson(root, output, value) {
  const absolute = resolve(root, output);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, `${JSON.stringify(value, null, 2)}\n`);
  console.log(`Written ${toPosix(relative(root, absolute))}`);
}

function generateContext(config) {
  const structured = {
    version: 1,
    generatedAt: new Date().toISOString(),
    components: Object.fromEntries(Object.entries(config.components).map(([name, rule]) => [name, {
      source: rule.source,
      strategy: rule.strategy ?? "protect",
      variants: rule.variants ?? {},
      forbiddenProps: rule.forbiddenProps ?? [],
      forbiddenImports: rule.forbiddenImports ?? [],
      rawElements: rule.rawElements ?? {},
    }])),
  };

  const lines = ["# Component Vault agent context", "", "Use these rules before creating or changing UI components.", ""];
  for (const [name, rule] of Object.entries(structured.components)) {
    lines.push(`## ${name}`, "", `- Import from \`${rule.source}\`.`, `- Migration strategy: \`${rule.strategy}\`.`);
    if (rule.forbiddenImports.length) lines.push(`- Never import ${name} from: ${rule.forbiddenImports.map((item) => `\`${item}\``).join(", ")}.`);
    if (rule.forbiddenProps.length) lines.push(`- Do not override: ${rule.forbiddenProps.map((item) => `\`${item}\``).join(", ")}.`);
    const variants = Object.entries(rule.variants);
    if (variants.length) {
      lines.push("", "Available variants:");
      for (const [variant, description] of variants) lines.push(`- \`${name}.${variant}\`: ${description}`);
    }
    lines.push("");
  }
  return { structured, markdown: `${lines.join("\n").trim()}\n` };
}

function parseArgs(argv) {
  const [command = "scan", ...rest] = argv;
  const options = {};
  for (let index = 0; index < rest.length; index += 1) {
    const item = rest[index];
    if (!item.startsWith("--")) continue;
    const key = item.slice(2);
    const next = rest[index + 1];
    if (!next || next.startsWith("--")) options[key] = true;
    else {
      options[key] = next;
      index += 1;
    }
  }
  return { command, options };
}

function printHelp() {
  console.log(`Component Vault Guard v${VERSION}\n\nCommands:\n  scan                 Scan and print all findings\n  check [--base REF]   Enforce protect, touched and full strategies\n  baseline             Record current errors as accepted legacy\n  report [--output]    Generate a JSON health report\n  context              Generate agent-readable Markdown and JSON\n  explain CV001        Explain a rule\n  init                  Create a starter component-vault.yaml\n\nOptions:\n  --config PATH         Configuration file (default: component-vault.yaml)\n  --baseline PATH       Baseline file (default: component-vault.baseline.json)\n  --output PATH         Output path for report/context\n`);
}

function starterConfig() {
  return `version: 1\n\nscan:\n  include: [src]\n  exclude: [node_modules, .next, .git]\n  extensions: [.ts, .tsx, .js, .jsx]\n\nduplicates:\n  enabled: true\n  minOccurrences: 4\n  minTokens: 4\n\ncomponents:\n  Text:\n    source: src/components/ui/text.tsx\n    allowedImportFiles: [src/components/ui/text.tsx]\n    forbiddenImports: [tamagui, \"@radix-ui/themes\"]\n    forbiddenProps: [fontSize, lineHeight, fontWeight]\n    strategy: touched\n    rawElements:\n      h1: H1\n      h2: H2\n      p: Paragraph\n      small: Caption\n    variants:\n      H1: Main page title\n      H2: Section heading\n      Paragraph: Default body text\n      Caption: Secondary supporting text\n`;
}

function main() {
  const root = process.cwd();
  const { command, options } = parseArgs(process.argv.slice(2));
  if (command === "help" || command === "--help" || command === "-h") return printHelp();
  if (command === "init") {
    const output = String(options.output ?? DEFAULT_CONFIG);
    if (existsSync(resolve(root, output))) throw new Error(`${output} already exists.`);
    writeFileSync(resolve(root, output), starterConfig());
    console.log(`Created ${output}`);
    return;
  }
  if (command === "explain") {
    const code = process.argv[3];
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

  if (command === "scan") {
    printReport(scan, [], config, changed);
    return;
  }
  if (command === "check") {
    printReport(scan, blocking, config, changed);
    if (blocking.length) process.exitCode = 1;
    return;
  }
  if (command === "baseline") {
    const errors = scan.violations.filter((item) => item.severity === "error");
    writeJson(root, baselinePath, {
      version: 1,
      generatedAt: new Date().toISOString(),
      fingerprints: [...new Set(errors.map((item) => item.fingerprint))].sort(),
    });
    console.log(`Accepted ${errors.length} current error(s) as legacy.`);
    return;
  }
  if (command === "report") {
    const output = String(options.output ?? "public/component-vault-report.json");
    const reportBlocking = changed.files
      ? blocking
      : blocking.filter((violation) => strategyFor(violation, config) !== "touched");
    writeJson(root, output, createReport(scan, reportBlocking, config, changed));
    printReport(scan, reportBlocking, config, changed);
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

  throw new Error(`Unknown command: ${command}. Run "node tools/component-vault-guard/cli.mjs help".`);
}

try {
  main();
} catch (error) {
  console.error(`Component Vault Guard: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
