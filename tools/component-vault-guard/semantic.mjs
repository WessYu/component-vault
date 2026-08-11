import ts from "typescript";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";

const DEFAULT_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

const toPosix = (value) => value.split(sep).join("/");

function wildcardToRegExp(pattern) {
  const escaped = String(pattern)
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "__DOUBLE_STAR__")
    .replace(/\*/g, "[^/]*")
    .replace(/__DOUBLE_STAR__/g, ".*");
  return new RegExp(`^${escaped}$`);
}

function matchesPattern(file, pattern) {
  const normalized = toPosix(String(pattern)).replace(/^\.\//, "");
  if (!normalized.includes("*")) return file === normalized || file.startsWith(`${normalized}/`);
  return wildcardToRegExp(normalized).test(file);
}

function collectFiles(root, config) {
  const files = [];
  const extensions = new Set((config.scan?.extensions ?? DEFAULT_EXTENSIONS).map(String));
  const excludes = (config.scan?.exclude ?? ["node_modules", ".git", "dist", "build", ".next"]).map(String);

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

  for (const include of config.scan?.include ?? ["src"]) {
    const path = resolve(root, String(include));
    if (existsSync(path)) visit(path);
  }
  return files.sort();
}

function tagName(node, sourceFile) {
  return node.tagName.getText(sourceFile);
}

function semanticElementMap(config) {
  return config.semantics?.elements ?? {};
}

function componentRoleMap(config) {
  return config.components ?? {};
}

function classifyElement(tag, config) {
  const mapping = semanticElementMap(config)[tag];
  if (mapping) return { role: String(mapping.role ?? tag), level: mapping.level ?? null, source: "native", tag };
  return null;
}

function classifyComponent(tag, config) {
  const components = componentRoleMap(config);
  const dot = tag.indexOf(".");
  const component = dot === -1 ? tag : tag.slice(0, dot);
  const variant = dot === -1 ? null : tag.slice(dot + 1);
  const rule = components[component];
  if (!rule) return null;

  const roles = rule.roles ?? {};
  const variants = rule.variants ?? {};
  const variantRule = variant ? variants[variant] : null;
  const roleName = variantRule?.role ?? (typeof roles === "string" ? roles : roles[variant]?.role ?? roles.role);
  if (!roleName) return null;

  return {
    role: String(roleName),
    level: variantRule?.level ?? roles[variant]?.level ?? null,
    source: "governed-component",
    component,
    variant,
    tag,
  };
}

function jsxFacts(sourceFile, file, config) {
  const facts = [];

  function visit(node) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = tagName(node, sourceFile);
      const semantic = classifyElement(tag, config) ?? classifyComponent(tag, config);
      facts.push({
        kind: "jsx",
        file,
        line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
        column: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).character + 1,
        tag,
        semantic,
      });
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return facts;
}

function inferLocalComponents(sourceFile, file, config) {
  const inferred = [];
  const elements = semanticElementMap(config);

  function semanticFromReturn(node) {
    let result = null;
    function find(child) {
      if (result) return;
      if (ts.isJsxOpeningElement(child) || ts.isJsxSelfClosingElement(child)) {
        const tag = tagName(child, sourceFile);
        if (elements[tag]) result = { ...elements[tag], tag };
        return;
      }
      ts.forEachChild(child, find);
    }
    find(node);
    return result;
  }

  function inspect(nameNode, body) {
    if (!nameNode || !body) return;
    const semantic = semanticFromReturn(body);
    if (!semantic) return;
    inferred.push({
      kind: "inferred-component",
      file,
      name: nameNode.text,
      role: String(semantic.role ?? "unknown"),
      level: semantic.level ?? null,
      sourceElement: semantic.tag,
    });
  }

  function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.name) inspect(node.name, node.body);
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer && (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))) inspect(node.name, node.initializer.body);
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return inferred;
}

export function analyzeProject(root, config) {
  const facts = [];
  const inferredComponents = [];
  for (const file of collectFiles(root, config)) {
    const content = readFileSync(resolve(root, file), "utf8");
    const sourceFile = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, file.endsWith(".tsx") ? ts.ScriptKind.TSX : file.endsWith(".jsx") ? ts.ScriptKind.JSX : file.endsWith(".js") ? ts.ScriptKind.JS : ts.ScriptKind.TS);
    facts.push(...jsxFacts(sourceFile, file, config));
    inferredComponents.push(...inferLocalComponents(sourceFile, file, config));
  }

  const semanticFacts = facts.filter((fact) => fact.semantic);
  const nativeFacts = semanticFacts.filter((fact) => fact.semantic.source === "native");
  const governedFacts = semanticFacts.filter((fact) => fact.semantic.source === "governed-component");
  const unmapped = facts.filter((fact) => !fact.semantic);

  const roles = new Map();
  for (const fact of semanticFacts) {
    const key = fact.semantic.level == null ? fact.semantic.role : `${fact.semantic.role}/${fact.semantic.level}`;
    const current = roles.get(key) ?? { role: fact.semantic.role, level: fact.semantic.level ?? null, total: 0, native: 0, governed: 0, examples: [] };
    current.total += 1;
    if (fact.semantic.source === "native") current.native += 1;
    if (fact.semantic.source === "governed-component") current.governed += 1;
    if (current.examples.length < 5) current.examples.push({ file: fact.file, line: fact.line, tag: fact.tag });
    roles.set(key, current);
  }

  return {
    version: 1,
    filesScanned: collectFiles(root, config).length,
    jsxNodes: facts.length,
    semanticNodes: semanticFacts.length,
    nativeNodes: nativeFacts.length,
    governedNodes: governedFacts.length,
    unmappedNodes: unmapped.length,
    roles: [...roles.values()].sort((a, b) => a.role.localeCompare(b.role) || String(a.level).localeCompare(String(b.level))),
    inferredComponents,
    unmapped: unmapped.slice(0, 100).map(({ file, line, column, tag }) => ({ file, line, column, tag })),
  };
}

export function renderAnalysis(report) {
  const lines = [
    "Component Vault Semantic Analysis",
    "=================================",
    "",
    `Files scanned: ${report.filesScanned}`,
    `JSX nodes: ${report.jsxNodes}`,
    `Semantic nodes: ${report.semanticNodes}`,
    `Native semantic nodes: ${report.nativeNodes}`,
    `Governed component nodes: ${report.governedNodes}`,
    `Unmapped nodes: ${report.unmappedNodes}`,
    "",
    "Semantic roles",
    "--------------",
  ];

  if (!report.roles.length) lines.push("No semantic roles were mapped yet.");
  for (const role of report.roles) {
    const suffix = role.level == null ? "" : `/${role.level}`;
    lines.push(`${role.role}${suffix}  total=${role.total} native=${role.native} governed=${role.governed}`);
    for (const example of role.examples.slice(0, 2)) lines.push(`  - ${example.tag}  ${example.file}:${example.line}`);
  }

  lines.push("", "Inferred local components", "--------------------------");
  if (!report.inferredComponents.length) lines.push("No local semantic wrappers inferred.");
  for (const component of report.inferredComponents) lines.push(`${component.name}  role=${component.role}${component.level == null ? "" : `/${component.level}`}  from <${component.sourceElement}>  ${component.file}`);

  lines.push("", "Unmapped JSX", "------------");
  if (!report.unmapped.length) lines.push("None.");
  for (const item of report.unmapped.slice(0, 20)) lines.push(`- <${item.tag}>  ${item.file}:${item.line}:${item.column}`);
  if (report.unmapped.length > 20) lines.push(`...and ${report.unmapped.length - 20} more.`);

  return `${lines.join("\n")}\n`;
}
