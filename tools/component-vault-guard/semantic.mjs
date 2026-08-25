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

function normalizeConfig(input) {
  const config = structuredClone(input);
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

function loadConfig(root, configPath = DEFAULT_CONFIG) {
  const path = resolve(root, configPath);
  if (!existsSync(path)) throw new Error(`Configuration not found: ${configPath}`);
  return normalizeConfig(YAML.parse(readFileSync(path, "utf8")));
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

function ignored(sourceFile, start, ...rules) {
  const line = sourceFile.getLineAndCharacterOfPosition(start).line;
  const lines = sourceFile.text.split(/\r?\n/);
  const context = lines.slice(Math.max(0, line - 1), line + 1).join("\n");
  return rules.some((rule) => context.includes(`component-vault-ignore ${rule}`)) || context.includes("component-vault-ignore all");
}

function addRoleEntry(map, name, role, config = {}) {
  if (!name || !role) return;
  map.set(name, { role: String(role), config: config && typeof config === "object" ? config : {} });
}

function componentRoleMap(config) {
  const map = new Map();
  for (const [name, definition] of Object.entries(config.semantics.components ?? {})) {
    if (!definition || typeof definition !== "object") continue;
    const roles = definition.roles ?? {};
    for (const [role, roleConfig] of Object.entries(roles)) addRoleEntry(map, name, role, roleConfig);
    const variants = definition.variants ?? {};
    for (const [variant, variantConfig] of Object.entries(variants)) {
      if (!variantConfig || typeof variantConfig !== "object") continue;
      const role = variantConfig.role ?? variantConfig.semanticRole;
      if (role) addRoleEntry(map, `${name}.${variant}`, role, { ...variantConfig, variant });
    }
  }
  for (const [name, definition] of Object.entries(config.components ?? {})) {
    if (!definition || typeof definition !== "object") continue;
    const semanticRole = definition.semanticRole;
    if (semanticRole && !map.has(name)) addRoleEntry(map, name, semanticRole);
    for (const [variant, description] of Object.entries(definition.variants ?? {})) {
      if (map.has(`${name}.${variant}`)) continue;
      if (description && typeof description === "object" && (description.role || description.semanticRole)) {
        addRoleEntry(map, `${name}.${variant}`, description.role ?? description.semanticRole, { ...description, variant });
      }
    }
  }
  return map;
}

function elementFacts(config) {
  const map = new Map();
  for (const [element, definition] of Object.entries(config.semantics.elements ?? {})) {
    if (!definition || typeof definition !== "object") continue;
    map.set(element, { role: String(definition.role ?? element), ...definition });
  }
  return map;
}

function governedForElement(componentRoles, element) {
  return [...componentRoles.entries()].filter(([, value]) => {
    if (value.role !== element.role) return false;
    if (element.level === undefined) return true;
    return value.config?.level === element.level;
  });
}

function governedTagForElement(config, elementName, element) {
  const componentRoles = componentRoleMap(config);
  const direct = governedForElement(componentRoles, element);
  if (direct.length) return direct[0][0];

  for (const [name, definition] of Object.entries(config.components ?? {})) {
    if (!definition || typeof definition !== "object") continue;
    const variant = definition.rawElements?.[elementName];
    if (!variant) continue;
    const candidate = `${name}.${variant}`;
    const configured = componentRoles.get(candidate);
    if (configured && configured.role === element.role && (element.level === undefined || configured.config?.level === element.level)) return candidate;
    if (configured && configured.role === element.role && element.level === undefined) return candidate;
    // rawElements is already an explicit repository-owned mapping. It remains
    // a valid deterministic fallback when the optional semantic map is absent.
    if (!configured) return candidate;
  }

  for (const [name, definition] of Object.entries(config.semantics.components ?? {})) {
    const variants = definition?.variants ?? {};
    const variant = element.variant;
    if (variant && variants[variant]) {
      const candidate = `${name}.${variant}`;
      const configured = componentRoles.get(candidate);
      if (configured && configured.role === element.role && (element.level === undefined || configured.config?.level === element.level)) return candidate;
    }
  }
  return null;
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
      const configured = roleMap.get(tag) ?? roleMap.get(tag.includes(".") ? tag.slice(0, tag.indexOf(".")) : tag);
      if (configured) {
        const dot = tag.indexOf(".");
        facts.push({ kind: "usage", name: tag, rootName: dot === -1 ? tag : tag.slice(0, dot), variant: dot === -1 ? undefined : tag.slice(dot + 1), role: configured.role, config: configured.config, file, line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1, tag, props: Object.fromEntries(node.attributes.properties.filter(ts.isJsxAttribute).map((a) => [a.name.text, getLiteralAttribute(node, a.name.text)])) });
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
          const governed = governedForElement(componentRoles, element);
          const fix = governedTagForElement(config, tag, element);
          const componentName = fix?.split(".")[0];
          const componentSource = componentName && config.components?.[componentName]?.source;
          const insideGovernedComponent = componentSource && toPosix(String(componentSource)) === toPosix(file);
          if (!insideGovernedComponent && (governed.length || fix) && !ignored(sourceFile, node.getStart(sourceFile), "CV006", "CV003")) {
            const names = governed.length ? governed.map(([name]) => name) : [fix];
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
              fix,
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
  const governedByRole = new Map();

  for (const fact of result.facts) {
    if (fact.kind !== "usage") continue;
    governedByRole.set(fact.role, (governedByRole.get(fact.role) ?? 0) + 1);
  }

  const elements = elementFacts(config);
  for (const file of result.files) {
    const source = readFileSync(resolve(root, file), "utf8");
    const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, scriptKind(file));
    function visit(node) {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const tag = getTagName(node, sourceFile);
        const element = elements.get(tag);
        if (element) byRole.set(element.role, (byRole.get(element.role) ?? 0) + 1);
      }
      ts.forEachChild(node, visit);
    }
    visit(sourceFile);
  }

  return {
    ...result,
    summary: [...new Set([...byRole.keys(), ...governedByRole.keys()])].sort().map((role) => ({
      role,
      semanticOccurrences: byRole.get(role) ?? 0,
      governedUsages: governedByRole.get(role) ?? 0,
      findings: result.findings.filter((finding) => finding.semanticRole === role).length
    }))
  };
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
    finding.fix ? `Autofix: ${finding.fix}` : "Autofix: unavailable",
    "",
    finding.message,
    finding.suggestion
  ].filter(Boolean).join("\n");
}

export { analyze, explainSemantic, loadConfig, normalizeConfig, semanticScan, componentRoleMap, elementFacts, governedTagForElement, collectFiles, scriptKind };
