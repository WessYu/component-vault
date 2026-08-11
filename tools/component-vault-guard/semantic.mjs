import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";
import ts from "typescript";
import YAML from "yaml";

const DEFAULT_CONFIG = "component-vault.yaml";
const DEFAULT_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];
const DEFAULT_EXCLUDES = ["node_modules", ".git", ".next", "dist", "build", "coverage"];

const toPosix = (value) => value.split(sep).join("/");

function matchesPattern(file, pattern) {
  const normalized = toPosix(String(pattern)).replace(/^\.\//, "");
  if (!normalized.includes("*")) return file === normalized || file.startsWith(`${normalized}/`);
  const escaped = normalized
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "__DOUBLE_STAR__")
    .replace(/\*/g, "[^/]*")
    .replace(/__DOUBLE_STAR__/g, ".*");
  return new RegExp(`^${escaped}$`).test(file);
}

function loadConfig(root, configPath = DEFAULT_CONFIG) {
  const path = resolve(root, configPath);
  if (!existsSync(path)) throw new Error(`Configuration not found: ${configPath}`);
  const config = YAML.parse(readFileSync(path, "utf8"));
  if (!config || config.version !== 1) throw new Error("component-vault.yaml must use version: 1");
  config.scan ??= {};
  config.scan.include ??= ["src"];
  config.scan.exclude ??= DEFAULT_EXCLUDES;
  config.scan.extensions ??= DEFAULT_EXTENSIONS;
  config.components ??= {};
  config.semantics ??= {};
  config.semantics.elements ??= {};
  config.semantics.components ??= {};
  config.semantics.strict ??= false;
  return config;
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

function getLiteralAttribute(node, name) {
  for (const attribute of node.attributes.properties) {
    if (!ts.isJsxAttribute(attribute) || attribute.name.text !== name || !attribute.initializer) continue;
    if (ts.isStringLiteral(attribute.initializer)) return attribute.initializer.text;
    if (ts.isJsxExpression(attribute.initializer) && attribute.initializer.expression) {
      const expression = attribute.initializer.expression;
      if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) return expression.text;
      if (ts.isNumericLiteral(expression)) return Number(expression.text);
    }
  }
  return undefined;
}

function getTagName(node, sourceFile) {
  return node.tagName.getText(sourceFile);
}

function componentRoleMap(config) {
  const map = new Map();
  for (const [name, definition] of Object.entries(config.semantics.components ?? {})) {
    const roles = definition?.roles ?? {};
    for (const [role, roleConfig] of Object.entries(roles)) {
      map.set(name, { role, config: roleConfig ?? {} });
    }
  }
  for (const [name, definition] of Object.entries(config.components ?? {})) {
    if (map.has(name)) continue;
    const semanticRole = definition?.semanticRole;
    if (semanticRole) map.set(name, { role: String(semanticRole), config: {} });
  }
  return map;
}

function elementFacts(config) {
  const map = new Map();
  for (const [element, definition] of Object.entries(config.semantics.elements ?? {})) {
    if (!definition || typeof definition !== "object") continue;
    map.set(element, { role: String(definition.role ?? element), ...definition });
  }
  for (const [name, definition] of Object.entries(config.components ?? {})) {
    for (const [element, variant] of Object.entries(definition.rawElements ?? {})) {
      if (!map.has(element)) map.set(element, { role: String(definition.semanticRole ?? name), variant: String(variant) });
    }
  }
  return map;
}

function componentSemanticFacts(sourceFile, file, config) {
  const facts = [];
  const roleMap = componentRoleMap(config);
  function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.name) {
      const name = node.name.text;
      const configured = roleMap.get(name);
      if (configured) facts.push({ kind: "component", name, role: configured.role, file, line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1 });
    }
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
      const configured = roleMap.get(node.name.text);
      if (configured) facts.push({ kind: "component", name: node.name.text, role: configured.role, file, line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1 });
    }
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = getTagName(node, sourceFile);
      const dot = tag.indexOf(".");
      const rootName = dot === -1 ? tag : tag.slice(0, dot);
      const configured = roleMap.get(rootName);
      if (configured) {
        facts.push({ kind: "usage", name: rootName, variant: dot === -1 ? undefined : tag.slice(dot + 1), role: configured.role, file, line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1, tag, props: Object.fromEntries(node.attributes.properties.filter(ts.isJsxAttribute).map((a) => [a.name.text, getLiteralAttribute(node, a.name.text)])) });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return facts;
}

function semanticScan(root, config) {
  const elements = elementFacts(config);
  const componentRoles = componentRoleMap(config);
  const findings = [];
  const facts = [];
  const files = collectFiles(root, config);

  for (const file of files) {
    const source = readFileSync(resolve(root, file), "utf8");
    const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, scriptKind(file));
    facts.push(...componentSemanticFacts(sourceFile, file, config));

    function visit(node) {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const tag = getTagName(node, sourceFile);
        const element = elements.get(tag);
        if (element) {
          const location = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
          const governed = [...componentRoles.entries()].filter(([, value]) => value.role === element.role);
          const exactVariant = element.level === undefined ? true : governed.some(([, value]) => value.config?.level === element.level || value.config?.variants?.[element.variant]?.level === element.level);
          if (governed.length && (!element.level || exactVariant)) {
            const names = governed.map(([name]) => name);
            findings.push({
              code: "CV006",
              title: "Semantic element requires governed component",
              severity: "error",
              file,
              line: location.line + 1,
              column: location.character + 1,
              semanticRole: element.role,
              level: element.level,
              element: tag,
              governedComponents: names,
              snippet: node.getText(sourceFile).replace(/\s+/g, " ").slice(0, 280),
              message: `<${tag}> is mapped to semantic role '${element.role}' and a governed component is available.`,
              suggestion: `Use the project's governed ${names.join(" / ")} component for '${element.role}'.`,
              metadata: { role: element.role, level: element.level, governedComponents: names }
            });
          }
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(sourceFile);
  }

  return { findings, facts, files };
}

function analyze(root, config) {
  const result = semanticScan(root, config);
  const byRole = new Map();
  const nativeByRole = new Map();
  const governedByRole = new Map();

  for (const fact of result.facts) {
    if (fact.kind !== "usage") continue;
    governedByRole.set(fact.role, (governedByRole.get(fact.role) ?? 0) + 1);
  }

  for (const file of result.files) {
    const source = readFileSync(resolve(root, file), "utf8");
    const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, scriptKind(file));
    function visit(node) {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const tag = getTagName(node, sourceFile);
        const element = elementFacts(config).get(tag);
        if (element) {
          byRole.set(element.role, (byRole.get(element.role) ?? 0) + 1);
          nativeByRole.set(element.role, (nativeByRole.get(element.role) ?? 0) + 1);
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(sourceFile);
  }

  return { ...result, summary: [...new Set([...byRole.keys(), ...governedByRole.keys()])].sort().map((role) => ({ role, semanticOccurrences: byRole.get(role) ?? 0, governedUsages: governedByRole.get(role) ?? 0, findings: result.findings.filter((finding) => finding.semanticRole === role).length })) };
}

function formatAnalyze(result) {
  const lines = ["Component Vault Semantic Analysis", "", "Role                 Native   Governed   Findings", "────────────────────────────────────────────────────"];
  for (const item of result.summary) lines.push(`${item.role.padEnd(20)} ${String(item.semanticOccurrences).padStart(6)} ${String(item.governedUsages).padStart(10)} ${String(item.findings).padStart(10)}`);
  if (!result.summary.length) lines.push("No semantic roles configured.");
  lines.push("", `Files analyzed: ${result.files.length}`, `Semantic findings: ${result.findings.length}`);
  return lines.join("\n");
}

function explainSemantic(finding) {
  return [
    `${finding.code} · ${finding.title}`,
    "",
    `Location: ${finding.file}:${finding.line}:${finding.column}`,
    `Element: <${finding.element}>`,
    `Semantic role: ${finding.semanticRole}`,
    finding.level === undefined ? null : `Level: ${finding.level}`,
    `Governed components: ${finding.governedComponents.join(", ")}`,
    "",
    finding.message,
    finding.suggestion
  ].filter(Boolean).join("\n");
}

export { analyze, explainSemantic, loadConfig, semanticScan };
