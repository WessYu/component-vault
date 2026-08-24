#!/usr/bin/env node
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { extname, join, relative, resolve, sep, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";
import ts from "typescript";
import YAML from "yaml";

const VERSION = "0.5.0";
const DEFAULT_CONFIG = "component-vault.yaml";
const DEFAULT_BASELINE = "component-vault.baseline.json";
const RULES = { CV001: "Direct component import", CV002: "Forbidden variant override", CV003: "Raw semantic element", CV004: "Repeated static style", CV005: "Forbidden pattern" };

const posix = (v) => v.split(sep).join("/");
const hash = (v) => createHash("sha1").update(v).digest("hex").slice(0, 16);

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

function normalizeConfig(input) {
  const config = structuredClone(input);
  if (!config || config.version !== 1) throw new Error("component-vault.yaml must use version: 1");
  config.scan ??= {};
  config.scan.include ??= ["src"];
  config.scan.exclude ??= ["node_modules", ".next", ".git", "dist", "build", "coverage"];
  config.scan.extensions ??= [".ts", ".tsx", ".js", ".jsx"];
  config.duplicates ??= {};
  config.duplicates.enabled ??= true;
  config.duplicates.minOccurrences ??= 5;
  config.duplicates.minTokens ??= 5;
  config.components ??= {};
  config.rules ??= {};
  config.rules.forbiddenPatterns ??= [];
  return config;
}

function loadConfig(root, path = DEFAULT_CONFIG) {
  const file = resolve(root, path);
  if (!existsSync(file)) throw new Error(`Configuration not found: ${path}`);
  return normalizeConfig(YAML.parse(readFileSync(file, "utf8")));
}

function wildcard(pattern) {
  const escaped = String(pattern)
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "__DOUBLE__")
    .replace(/\*/g, "[^/]*")
    .replace(/__DOUBLE__/g, ".*");
  return new RegExp(`^${escaped}$`);
}

function matches(file, pattern) {
  const p = posix(String(pattern)).replace(/^\.\//, "");
  return p.includes("*") ? wildcard(p).test(file) : file === p || file.startsWith(`${p}/`);
}

function collectFiles(root, config) {
  const out = [];
  const extensions = new Set(config.scan.extensions.map(String));
  const excludes = config.scan.exclude.map(String);

  function visit(path) {
    const rel = posix(relative(root, path));
    if (rel && excludes.some((pattern) => matches(rel, pattern))) return;
    const stat = statSync(path);
    if (stat.isDirectory()) {
      for (const child of readdirSync(path)) visit(join(path, child));
    } else if (extensions.has(extname(path))) {
      out.push(rel);
    }
  }

  for (const include of config.scan.include) {
    const path = resolve(root, String(include));
    if (existsSync(path)) visit(path);
  }
  return out.sort();
}

function scriptKind(file) {
  if (file.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (file.endsWith(".jsx")) return ts.ScriptKind.JSX;
  if (file.endsWith(".js")) return ts.ScriptKind.JS;
  return ts.ScriptKind.TS;
}

function ignored(sourceFile, start, rule) {
  const line = sourceFile.getLineAndCharacterOfPosition(start).line;
  const lines = sourceFile.text.split(/\r?\n/);
  const context = lines.slice(Math.max(0, line - 1), line + 1).join("\n");
  return context.includes(`component-vault-ignore ${rule}`) || context.includes("component-vault-ignore all");
}

function violation({ rule, component, file, sourceFile, start, snippet, message, suggestion, metadata = {} }) {
  const loc = sourceFile.getLineAndCharacterOfPosition(start);
  return {
    rule,
    title: RULES[rule] ?? rule,
    severity: "error",
    component,
    file,
    line: loc.line + 1,
    column: loc.character + 1,
    snippet: String(snippet).replace(/\s+/g, " ").trim().slice(0, 280),
    message,
    suggestion,
    metadata,
    fingerprint: hash([rule, component ?? "", file, snippet].join("|")),
  };
}

function allowedFile(file, rule) {
  return [rule.source, ...(rule.allowedImportFiles ?? [])]
    .filter(Boolean)
    .some((pattern) => matches(file, pattern));
}

function importContains(clause, name) {
  if (!clause) return false;
  if (clause.name?.text === name) return true;
  const bindings = clause.namedBindings;
  return Boolean(
    bindings &&
      ts.isNamedImports(bindings) &&
      bindings.elements.some((element) => (element.propertyName?.text ?? element.name.text) === name),
  );
}

function staticClass(attribute) {
  if (!attribute?.initializer) return null;
  if (ts.isStringLiteral(attribute.initializer)) return attribute.initializer.text;
  if (ts.isJsxExpression(attribute.initializer) && attribute.initializer.expression) {
    const expression = attribute.initializer.expression;
    if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) return expression.text;
  }
  return null;
}

function forbiddenPatterns(config) {
  return config.rules.forbiddenPatterns.map((entry, index) => {
    const item = typeof entry === "string" ? { pattern: entry } : entry;
    if (!item?.pattern) throw new Error(`rules.forbiddenPatterns[${index}] must contain a pattern.`);
    const flags = String(item.flags ?? "g");
    return {
      ...item,
      id: String(item.id ?? `pattern-${index + 1}`),
      regex: new RegExp(item.pattern, flags.includes("g") ? flags : `${flags}g`),
    };
  });
}

function scan(root, config) {
  const duplicates = new Map();
  const patterns = forbiddenPatterns(config);
  const findings = [];

  for (const file of collectFiles(root, config)) {
    const content = readFileSync(resolve(root, file), "utf8");
    const sourceFile = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, scriptKind(file));

    for (const pattern of patterns) {
      if (pattern.files && !pattern.files.some((item) => matches(file, item))) continue;
      pattern.regex.lastIndex = 0;
      for (const match of content.matchAll(pattern.regex)) {
        const start = match.index ?? 0;
        if (ignored(sourceFile, start, "CV005")) continue;
        findings.push(
          violation({
            rule: "CV005",
            component: pattern.components?.length === 1 ? pattern.components[0] : undefined,
            file,
            sourceFile,
            start,
            snippet: match[0],
            message: String(pattern.message ?? "Forbidden pattern detected."),
            suggestion: pattern.suggestion,
          }),
        );
      }
    }

    function visit(node) {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        const moduleName = node.moduleSpecifier.text;
        for (const [component, rule] of Object.entries(config.components)) {
          const forbidden = (rule.forbiddenImports ?? []).map(String);
          if (
            !allowedFile(file, rule) &&
            forbidden.some((item) => moduleName === item || moduleName.startsWith(`${item}/`)) &&
            importContains(node.importClause, component) &&
            !ignored(sourceFile, node.getStart(sourceFile), "CV001")
          ) {
            findings.push(
              violation({
                rule: "CV001",
                component,
                file,
                sourceFile,
                start: node.getStart(sourceFile),
                snippet: node.getText(sourceFile),
                message: `Direct import of ${component} from ${moduleName} is forbidden.`,
                suggestion: `Import ${component} from ${rule.source}.`,
                metadata: { moduleName },
              }),
            );
          }
        }
      }

      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const tag = node.tagName.getText(sourceFile);
        const classAttr = node.attributes.properties.find(
          (item) => ts.isJsxAttribute(item) && item.name.text === "className",
        );
        const classes = classAttr && ts.isJsxAttribute(classAttr) ? staticClass(classAttr) : null;

        if (classes) {
          const tokens = classes.trim().split(/\s+/).filter(Boolean);
          if (tokens.length >= Number(config.duplicates.minTokens)) {
            const key = [...tokens].sort().join(" ");
            const list = duplicates.get(key) ?? [];
            list.push({
              file,
              sourceFile,
              start: classAttr.getStart(sourceFile),
              snippet: classAttr.getText(sourceFile),
            });
            duplicates.set(key, list);
          }
        }

        for (const [component, rule] of Object.entries(config.components)) {
          if (allowedFile(file, rule)) continue;
          const raw = rule.rawElements ?? {};

          if (Object.hasOwn(raw, tag) && !ignored(sourceFile, node.getStart(sourceFile), "CV003")) {
            const variant = raw[tag];
            findings.push(
              violation({
                rule: "CV003",
                component,
                file,
                sourceFile,
                start: node.getStart(sourceFile),
                snippet: node.getText(sourceFile),
                message: `Raw <${tag}> detected in governed JSX.`,
                suggestion: `Use <${component}.${variant}> instead.`,
                metadata: { element: tag, variant },
              }),
            );
          }

          if (tag.startsWith(`${component}.`) && !ignored(sourceFile, node.getStart(sourceFile), "CV002")) {
            const variant = tag.slice(component.length + 1);
            const forbiddenProps = new Set((rule.forbiddenProps ?? []).map(String));
            for (const attribute of node.attributes.properties) {
              if (ts.isJsxAttribute(attribute) && forbiddenProps.has(attribute.name.text)) {
                findings.push(
                  violation({
                    rule: "CV002",
                    component,
                    file,
                    sourceFile,
                    start: attribute.getStart(sourceFile),
                    snippet: attribute.getText(sourceFile),
                    message: `${component}.${variant} overrides protected prop ${attribute.name.text}.`,
                    suggestion: `Use the documented ${component}.${variant} style or create a governed variant.`,
                    metadata: { variant, prop: attribute.name.text },
                  }),
                );
              }
            }
          }
        }
      }

      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
  }

  if (config.duplicates.enabled) {
    for (const [classes, list] of duplicates) {
      if (list.length < Number(config.duplicates.minOccurrences)) continue;
      for (const item of list) {
        findings.push(
          violation({
            rule: "CV004",
            file: item.file,
            sourceFile: item.sourceFile,
            start: item.start,
            snippet: item.snippet,
            message: `The same static className combination appears ${list.length} times.`,
            suggestion: "Consider extracting a governed component or reusable style token.",
            metadata: { occurrences: list.length, classes },
          }),
        );
      }
    }
  }

  return findings;
}

function changedFiles(root, base) {
  if (!base) return null;
  try {
    return new Set(
      execFileSync("git", ["diff", "--name-only", `${base}...HEAD`], { cwd: root, encoding: "utf8" })
        .split(/\r?\n/)
        .filter(Boolean)
        .map(posix),
    );
  } catch {
    return new Set();
  }
}

function blocking(root, findings, config, base) {
  const changed = changedFiles(root, base);
  if (!changed) return findings;
  return findings.filter((item) => {
    const strategy = config.components[item.component]?.strategy ?? "touched";
    return strategy === "full" || strategy === "protect" || changed.has(item.file);
  });
}

function loadBaseline(root, path) {
  const file = resolve(root, path);
  if (!existsSync(file)) return { version: 2, fingerprints: [], violations: [] };
  return JSON.parse(readFileSync(file, "utf8"));
}

function baseline(root, config, path) {
  const findings = scan(root, config);
  const file = resolve(root, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(
    file,
    `${JSON.stringify(
      {
        version: 2,
        generatedAt: new Date().toISOString(),
        fingerprints: findings.map((item) => item.fingerprint),
        violations: findings,
      },
      null,
      2,
    )}\n`,
  );
  console.log(`Component Vault: baseline captured ${findings.length} violation(s).`);
}

function report(root, config, baselinePath, output, base) {
  const findings = scan(root, config);
  const old = loadBaseline(root, baselinePath);
  const fingerprints = new Set(old.fingerprints ?? []);
  const current = new Set(findings.map((item) => item.fingerprint));
  const legacy = findings.filter((item) => fingerprints.has(item.fingerprint));
  const fresh = findings.filter((item) => !fingerprints.has(item.fingerprint));
  const resolved = (old.fingerprints ?? []).filter((item) => !current.has(item)).length;
  const blocked = blocking(root, fresh, config, base);
  const total = (old.fingerprints ?? []).length;
  const summary = {
    migrationProgress: total ? Math.round((resolved / total) * 100) : fresh.length ? 0 : 100,
    legacy: legacy.length,
    resolved,
    new: fresh.length,
    blocking: blocked.length,
    filesScanned: collectFiles(root, config).length,
  };
  const data = { engine: "typescript-ast", generatedAt: new Date().toISOString(), violations: findings, summary };
  const file = resolve(root, output);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Component Vault: report generated with ${blocked.length} blocking violation(s).`);
  return data;
}

function print(findings) {
  if (!findings.length) {
    console.log("Component Vault: no violations found.");
    return;
  }
  for (const item of findings) {
    console.log(`\n[${item.rule}] ${item.title}`);
    console.log(`${item.file}:${item.line}:${item.column}`);
    console.log(`  ${item.message}`);
    if (item.snippet) console.log(`  ${item.snippet}`);
    if (item.suggestion) console.log(`  → ${item.suggestion}`);
  }
  console.log(`\nComponent Vault: ${findings.length} violation(s).`);
}

function main() {
  const root = process.cwd();
  const { command, options } = parseArgs(process.argv.slice(2));
  try {
    if (["version", "--version"].includes(command)) {
      console.log(VERSION);
      return;
    }

    const config = loadConfig(root, String(options.config ?? DEFAULT_CONFIG));

    if (command === "scan") {
      print(scan(root, config));
      process.exitCode = 0;
      return;
    }

    if (command === "check") {
      const findings = blocking(root, scan(root, config), config, typeof options.base === "string" ? options.base : undefined);
      print(findings);
      console.log(`\n${findings.length} blocking violation${findings.length === 1 ? "" : "s"}.`);
      process.exitCode = findings.length ? 1 : 0;
      return;
    }

    if (command === "baseline") {
      baseline(root, config, String(options.baseline ?? DEFAULT_BASELINE));
      return;
    }

    if (command === "report") {
      report(
        root,
        config,
        String(options.baseline ?? DEFAULT_BASELINE),
        String(options.output ?? "public/component-vault-report.json"),
        typeof options.base === "string" ? options.base : undefined,
      );
      return;
    }

    throw new Error(`Unknown command: ${command}`);
  } catch (error) {
    console.error(`Component Vault error: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main();

export {
  DEFAULT_BASELINE,
  DEFAULT_CONFIG,
  blocking,
  collectFiles,
  loadBaseline,
  loadConfig,
  normalizeConfig,
  report,
  scan,
};
