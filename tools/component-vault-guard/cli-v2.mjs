#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import process from "node:process";
import ts from "typescript";

const VERSION = "0.2.1";
const DEFAULT_CONFIG = "component-vault.yaml";
const DEFAULT_BASELINE = "component-vault.baseline.json";
const RULES = {
  CV001: { title: "Direct component import", explanation: "A governed component was imported directly from a forbidden library instead of the project wrapper." },
  CV002: { title: "Forbidden variant override", explanation: "A semantic component overrides a protected visual prop and can fragment the design system." },
  CV003: { title: "Raw semantic element", explanation: "A real JSX element was used where a governed semantic component should be used." },
  CV004: { title: "Repeated static style", explanation: "The same static className combination appears repeatedly and may deserve extraction." },
  CV005: { title: "Forbidden pattern", explanation: "Source code matches a pattern forbidden by the component vault configuration." },
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
  config.rules ??= {};
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

function compileForbiddenPatterns(config) {
  const rawRules = config.rules?.forbiddenPatterns;
  if (rawRules == null) return [];
  if (!Array.isArray(rawRules)) throw new Error("rules.forbiddenPatterns must be an array.");

  return rawRules.map((entry, index) => {
    const item = typeof entry === "string" ? { pattern: entry } : entry;
    if (!item || typeof item !== "object" || typeof item.pattern !== "string" || item.pattern.length === 0) {
      throw new Error(`rules.forbiddenPatterns[${index}] must contain a non-empty pattern string.`);
    }

    let regexp;
    try {
      regexp = new RegExp(item.pattern, typeof item.flags === "string" ? item.flags : "g");
    } catch (error) {
      throw new Error(`Invalid rules.forbiddenPatterns[${index}] regex: ${error.message}`);
    }

    return {
      id: item.id ? String(item.id) : `pattern-${index + 1}`,
      pattern: item.pattern,
      flags: typeof item.flags === "string" ? item.flags : "g",
      regexp,
      message: item.message ? String(item.message) : "This pattern is forbidden by component-vault.yaml.",
      suggestion: item.suggestion ? String(item.suggestion) : null,
      severity: item.severity ? String(item.severity) : "error",
      files: Array.isArray(item.files) ? item.files.map(String) : null,
      components: Array.isArray(item.components) ? item.components.map(String) : null,
    };
  });
}

function findForbiddenPatternMatches(source, pattern) {
  const regexp = new RegExp(pattern.regexp.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`);
  return [...source.matchAll(regexp)];
}

function scanForbiddenPatterns(file, content, config, sourceFile, patterns) {
  const violations = [];
  for (const pattern of patterns) {
    if (pattern.files && !pattern.files.some((candidate) => matchesPattern(file, candidate))) continue;
    const matches = findForbiddenPatternMatches(content, pattern);
    for (const match of matches) {
      const index = match.index ?? 0;
      const position = sourceFile.getPositionOfLineAndCharacter(
        sourceFile.getLineAndCharacterOfPosition(index).line,
        sourceFile.getLineAndCharacterOfPosition(index).character,
      );
      const lineAndCharacter = sourceFile.getLineAndCharacterOfPosition(position);
      const node = {
        getStart: () => index,
        getText: () => match[0],
      };
      const component = pattern.components?.length === 1 ? pattern.components[0] : undefined;
      violations.push(createViolation({
        rule: "CV005",
        component,
        file,
        sourceFile,
        node,
        message: pattern.message,
        suggestion: pattern.suggestion ?? undefined,
        severity: pattern.severity,
        metadata: {
          patternId: pattern.id,
          pattern: pattern.pattern,
          match: match[0],
          regexLine: lineAndCharacter.line + 1,
          regexColumn: lineAndCharacter.character + 1,
        },
      }));
    }
  }
  return violations;
}

function scanSourceFile(file, content, config, duplicateOccurrences, forbiddenPatterns) {
  const sourceFile = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, scriptKind(file));
  const violations = scanForbiddenPatterns(file, content, config, sourceFile, forbiddenPatterns);
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
    for (const item of items) {
      violations.push(createViolation({
        rule: "CV004",
        file: item.file,
        sourceFile: item.sourceFile,
        node: item.node,
        message: `The same static className combination appears ${items.length} times.`,
        suggestion: "Consider extracting a governed component or reusable style token.",
        metadata: { occurrences: items.length, classes: normalized },
      }));
    }
  }
  return violations;
}

function scan(root, config) {
  const duplicateOccurrences = new Map();
  const forbiddenPatterns = compileForbiddenPatterns(config);
  const violations = [];
  for (const file of collectFiles(root, config)) {
    const content = readFileSync(resolve(root, file), "utf8");
    violations.push(...scanSourceFile(file, content, config, duplicateOccurrences, forbiddenPatterns));
  }
  violations.push(...scanDuplicateStyles(duplicateOccurrences, config));
  return violations;
}

function printViolations(violations) {
  if (!violations.length) {
    console.log("Component Vault: no violations found.");
    return;
  }
  for (const violation of violations) {
    console.log(`\n[${violation.rule}] ${violation.title}`);
    console.log(`${violation.file}:${violation.line}:${violation.column}`);
    console.log(`  ${violation.message}`);
    if (violation.snippet) console.log(`  ${violation.snippet}`);
    if (violation.suggestion) console.log(`  → ${violation.suggestion}`);
  }
  console.log(`\nComponent Vault: ${violations.length} violation(s).`);
}

function commandScan(root, config) {
  const violations = scan(root, config);
  printViolations(violations);
  return violations.length ? 1 : 0;
}

function commandCheck(root, config) {
  return commandScan(root, config);
}

function main() {
  const root = process.cwd();
  const command = process.argv[2] ?? "scan";
  const configPath = process.argv[3] ?? DEFAULT_CONFIG;
  try {
    const config = loadConfig(root, configPath);
    let exitCode = 0;
    if (command === "scan" || command === "check") exitCode = commandCheck(root, config);
    else throw new Error(`Unsupported command in cli-v2: ${command}`);
    process.exitCode = exitCode;
  } catch (error) {
    console.error(`Component Vault error: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
