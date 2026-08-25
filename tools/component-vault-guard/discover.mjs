import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import ts from "typescript";
import YAML from "yaml";
import { collectFiles, scriptKind } from "./semantic.mjs";

const SOURCE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mts", ".cts", ".mjs", ".cjs"];
const NATIVE_ROLES = {
  h1: { role: "heading", level: 1 },
  h2: { role: "heading", level: 2 },
  h3: { role: "heading", level: 3 },
  h4: { role: "heading", level: 4 },
  h5: { role: "heading", level: 5 },
  h6: { role: "heading", level: 6 },
  p: { role: "body-text" },
  small: { role: "caption" },
  button: { role: "button" },
  a: { role: "link" },
};
const VARIANT_ELEMENTS = {
  H1: "h1", H2: "h2", H3: "h3", H4: "h4", H5: "h5", H6: "h6",
  Paragraph: "p", Body: "p", P: "p", Caption: "small", Small: "small",
};

const toPosix = (value) => value.split(sep).join("/");
const isComponentName = (name) => /^[A-Z][A-Za-z0-9]*$/.test(name);

function unwrapExpression(node) {
  let current = node;
  while (current && (ts.isParenthesizedExpression(current) || ts.isAsExpression(current) || ts.isSatisfiesExpression(current))) current = current.expression;
  return current;
}

function firstNativeJsxTag(node, sourceFile) {
  let found = null;
  function visit(current) {
    if (found) return;
    if (ts.isJsxElement(current) || ts.isJsxSelfClosingElement(current)) {
      const opening = ts.isJsxElement(current) ? current.openingElement : current;
      const tag = opening.tagName.getText(sourceFile);
      if (/^[a-z][a-z0-9-]*$/.test(tag)) found = tag;
      return;
    }
    ts.forEachChild(current, visit);
  }
  visit(node);
  return found;
}

function functionRootTag(initializer, sourceFile) {
  const node = unwrapExpression(initializer);
  if (!node) return null;
  if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
    if (!ts.isBlock(node.body)) return firstNativeJsxTag(node.body, sourceFile);
    for (const statement of node.body.statements) {
      if (ts.isReturnStatement(statement) && statement.expression) return firstNativeJsxTag(statement.expression, sourceFile);
    }
  }
  if (ts.isFunctionDeclaration(node)) return firstNativeJsxTag(node, sourceFile);
  return null;
}

function objectVariants(initializer, sourceFile) {
  const object = unwrapExpression(initializer);
  if (!object || !ts.isObjectLiteralExpression(object)) return [];
  const variants = [];
  for (const property of object.properties) {
    if (!ts.isPropertyAssignment(property) && !ts.isShorthandPropertyAssignment(property) && !ts.isMethodDeclaration(property)) continue;
    const name = property.name && (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) ? property.name.text : null;
    if (!name || !isComponentName(name)) continue;
    const rootElement = ts.isPropertyAssignment(property)
      ? functionRootTag(property.initializer, sourceFile)
      : ts.isMethodDeclaration(property)
        ? firstNativeJsxTag(property, sourceFile)
        : null;
    variants.push({ name, element: rootElement ?? VARIANT_ELEMENTS[name] ?? null });
  }
  return variants;
}

function exportedCandidates(file, source) {
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, scriptKind(file));
  const candidates = [];
  for (const statement of sourceFile.statements) {
    const modifiers = statement.modifiers ?? [];
    const exported = modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
    const defaultExport = modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword);
    if (!exported) continue;

    if ((ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) && statement.name && isComponentName(statement.name.text)) {
      candidates.push({
        name: statement.name.text,
        exportKind: defaultExport ? "default" : "named",
        variants: [],
        rootElement: ts.isFunctionDeclaration(statement) ? firstNativeJsxTag(statement, sourceFile) : null,
      });
    }

    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name) || !isComponentName(declaration.name.text) || !declaration.initializer) continue;
        const variants = objectVariants(declaration.initializer, sourceFile);
        const rootElement = functionRootTag(declaration.initializer, sourceFile);
        if (!variants.length && !rootElement) continue;
        candidates.push({ name: declaration.name.text, exportKind: "named", variants, rootElement });
      }
    }
  }
  return candidates;
}

function readTsConfig(root) {
  const path = resolve(root, "tsconfig.json");
  if (!existsSync(path)) return { baseUrl: root, paths: {} };
  const parsed = ts.parseConfigFileTextToJson(path, readFileSync(path, "utf8")).config ?? {};
  const compiler = parsed.compilerOptions ?? {};
  return { baseUrl: resolve(root, compiler.baseUrl ?? "."), paths: compiler.paths ?? {} };
}

function possibleSourcePaths(path) {
  const normalized = path.replace(/\.(?:[cm]?[jt]sx?)$/i, "");
  return [normalized, ...SOURCE_EXTENSIONS.map((extension) => `${normalized}${extension}`), ...SOURCE_EXTENSIONS.map((extension) => `${normalized}/index${extension}`)];
}

function aliasTargets(moduleName, tsConfig) {
  const targets = [];
  for (const [pattern, replacements] of Object.entries(tsConfig.paths)) {
    const star = pattern.indexOf("*");
    const prefix = star === -1 ? pattern : pattern.slice(0, star);
    const suffix = star === -1 ? "" : pattern.slice(star + 1);
    if (!moduleName.startsWith(prefix) || !moduleName.endsWith(suffix)) continue;
    const match = moduleName.slice(prefix.length, moduleName.length - suffix.length || undefined);
    for (const replacement of replacements) targets.push(resolve(tsConfig.baseUrl, String(replacement).replace("*", match)));
  }
  return targets;
}

function moduleResolvesTo(root, importer, moduleName, source, tsConfig) {
  const sourcePath = toPosix(resolve(root, source));
  const bases = moduleName.startsWith(".")
    ? [resolve(dirname(resolve(root, importer)), moduleName)]
    : aliasTargets(moduleName, tsConfig);
  return bases.some((base) => possibleSourcePaths(base).some((candidate) => toPosix(candidate) === sourcePath));
}

function importedName(importClause, componentName, exportKind) {
  if (!importClause) return false;
  if (exportKind === "default" && importClause.name?.text === componentName) return true;
  const bindings = importClause.namedBindings;
  return Boolean(bindings && ts.isNamedImports(bindings) && bindings.elements.some((element) => (element.propertyName?.text ?? element.name.text) === componentName));
}

function observedImport(root, files, candidate, tsConfig) {
  const occurrences = new Map();
  for (const file of files) {
    const source = readFileSync(resolve(root, file), "utf8");
    const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, scriptKind(file));
    for (const statement of sourceFile.statements) {
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
      const moduleName = statement.moduleSpecifier.text;
      if (!importedName(statement.importClause, candidate.name, candidate.exportKind)) continue;
      if (!moduleResolvesTo(root, file, moduleName, candidate.source, tsConfig)) continue;
      occurrences.set(moduleName, (occurrences.get(moduleName) ?? 0) + 1);
    }
  }
  return [...occurrences.entries()]
    .sort((a, b) => Number(a[0].startsWith(".")) - Number(b[0].startsWith(".")) || b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([moduleName]) => moduleName)[0] ?? null;
}

function candidateDefinition(candidate) {
  const definition = {
    source: candidate.source,
    allowedImportFiles: [candidate.source],
    strategy: "touched",
  };
  if (candidate.importFrom && !candidate.importFrom.startsWith(".")) {
    definition.import = { from: candidate.importFrom, kind: candidate.exportKind, name: candidate.name };
  }
  if (candidate.variants.length) {
    const rawElements = {};
    const variants = {};
    for (const variant of candidate.variants) {
      if (variant.element && NATIVE_ROLES[variant.element]) rawElements[variant.element] = variant.name;
      variants[variant.name] = variant.element ? `Discovered <${variant.element}> variant` : "Discovered compound variant";
    }
    if (Object.keys(rawElements).length) definition.rawElements = rawElements;
    definition.variants = variants;
  } else if (candidate.rootElement && NATIVE_ROLES[candidate.rootElement]) {
    definition.semanticRole = NATIVE_ROLES[candidate.rootElement].role;
  }
  return definition;
}

function discoverComponents(root, config) {
  const files = collectFiles(root, config);
  const tsConfig = readTsConfig(root);
  const all = [];
  for (const file of files) {
    if (!/\.(?:tsx|jsx)$/i.test(file)) continue;
    if (!/(^|\/)(?:components|ui|design-system|primitives)(?:\/|$)/.test(file)) continue;
    const source = readFileSync(resolve(root, file), "utf8");
    for (const candidate of exportedCandidates(file, source)) all.push({ ...candidate, source: file });
  }

  const byName = new Map();
  for (const candidate of all) {
    const current = byName.get(candidate.name);
    const score = candidate.variants.length * 10 + Number(candidate.source.includes("/components/"));
    const currentScore = current ? current.variants.length * 10 + Number(current.source.includes("/components/")) : -1;
    if (!current || score > currentScore || (score === currentScore && candidate.source.length < current.source.length)) byName.set(candidate.name, candidate);
  }

  const components = [...byName.values()].sort((a, b) => a.name.localeCompare(b.name)).map((candidate) => {
    const importFrom = observedImport(root, files, candidate, tsConfig);
    const discovered = { ...candidate, importFrom };
    return { ...discovered, definition: candidateDefinition(discovered) };
  });
  return { filesScanned: files.length, components };
}

function writeDiscoveredComponents(root, configPath, discovery) {
  const path = resolve(root, configPath);
  if (!existsSync(path)) throw new Error(`Configuration not found: ${configPath}. Run init first.`);
  const config = YAML.parse(readFileSync(path, "utf8")) ?? {};
  config.components ??= {};
  const written = [];
  const skippedExisting = [];
  for (const component of discovery.components) {
    if (Object.hasOwn(config.components, component.name)) {
      skippedExisting.push(component.name);
      continue;
    }
    config.components[component.name] = component.definition;
    written.push(component.name);
  }
  if (written.length) writeFileSync(path, `${YAML.stringify(config)}\n`, "utf8");
  return { written, skippedExisting, configPath: toPosix(relative(root, path)) };
}

export { discoverComponents, writeDiscoveredComponents };
