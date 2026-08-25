import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import ts from "typescript";
import { collectFiles, elementFacts, governedTagForElement, scriptKind } from "./semantic.mjs";

const SOURCE_EXTENSIONS = /\.(?:[cm]?[jt]sx?)$/i;
const toPosix = (value) => value.split(sep).join("/");

function readSourceFile(path) {
  const buffer = readFileSync(path);
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
    return { text: buffer.subarray(2).toString("utf16le"), encoding: "utf16le-bom" };
  }
  if (buffer.length >= 2 && buffer[0] === 0xfe && buffer[1] === 0xff) {
    const swapped = Buffer.allocUnsafe(buffer.length - 2);
    for (let index = 2; index + 1 < buffer.length; index += 2) {
      swapped[index - 2] = buffer[index + 1];
      swapped[index - 1] = buffer[index];
    }
    return { text: swapped.toString("utf16le"), encoding: "utf16be-bom" };
  }
  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    return { text: buffer.subarray(3).toString("utf8"), encoding: "utf8-bom" };
  }
  return { text: buffer.toString("utf8"), encoding: "utf8" };
}

function writeSourceFile(path, text, encoding) {
  if (encoding === "utf16le-bom") {
    writeFileSync(path, Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(text, "utf16le")]));
    return;
  }
  if (encoding === "utf16be-bom") {
    const utf16 = Buffer.from(text, "utf16le");
    const swapped = Buffer.allocUnsafe(utf16.length);
    for (let index = 0; index + 1 < utf16.length; index += 2) {
      swapped[index] = utf16[index + 1];
      swapped[index + 1] = utf16[index];
    }
    writeFileSync(path, Buffer.concat([Buffer.from([0xfe, 0xff]), swapped]));
    return;
  }
  if (encoding === "utf8-bom") {
    writeFileSync(path, Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(text, "utf8")]));
    return;
  }
  writeFileSync(path, text, "utf8");
}

function exportedAs(sourceFile, componentName) {
  for (const statement of sourceFile.statements) {
    const modifiers = statement.modifiers ?? [];
    const exported = modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
    const defaultExport = modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword);
    if (exported && defaultExport) return { kind: "default", name: componentName };
    if (exported && (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) && statement.name?.text === componentName) {
      return { kind: "named", name: componentName };
    }
    if (exported && ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name) && declaration.name.text === componentName) return { kind: "named", name: componentName };
      }
    }
    if (ts.isExportDeclaration(statement) && statement.exportClause && ts.isNamedExports(statement.exportClause)) {
      for (const element of statement.exportClause.elements) {
        if ((element.propertyName?.text ?? element.name.text) === componentName) return { kind: "named", name: componentName };
      }
    }
  }
  return null;
}

function importModuleForFile(root, file, source) {
  const absoluteSource = resolve(root, String(source));
  let moduleName = toPosix(relative(dirname(resolve(root, file)), absoluteSource)).replace(SOURCE_EXTENSIONS, "");
  if (moduleName.endsWith("/index")) moduleName = moduleName.slice(0, -6);
  if (!moduleName.startsWith(".")) moduleName = `./${moduleName}`;
  return moduleName;
}

function importPlan(root, file, componentName, rule) {
  const explicit = rule.import;
  if (explicit && typeof explicit === "object" && typeof explicit.from === "string") {
    return {
      plan: {
        from: explicit.from,
        kind: explicit.kind === "default" ? "default" : "named",
        name: String(explicit.name ?? componentName),
      },
      reason: null,
    };
  }

  if (typeof rule.source !== "string") {
    return { plan: null, reason: `${componentName} has no configured source or explicit import.` };
  }
  const sourcePath = resolve(root, rule.source);
  if (!existsSync(sourcePath)) {
    return { plan: null, reason: `Configured source ${toPosix(String(rule.source))} does not exist.` };
  }
  const source = readSourceFile(sourcePath).text;
  const sourceFile = ts.createSourceFile(rule.source, source, ts.ScriptTarget.Latest, true, scriptKind(rule.source));
  const exported = exportedAs(sourceFile, componentName);
  if (!exported) {
    return { plan: null, reason: `${toPosix(String(rule.source))} does not export ${componentName}.` };
  }
  return { plan: { ...exported, from: importModuleForFile(root, file, rule.source) }, reason: null };
}

function existingImport(sourceFile, componentName, expectedModule) {
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || !statement.importClause || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    const clause = statement.importClause;
    if (clause.name?.text === componentName && (!expectedModule || statement.moduleSpecifier.text === expectedModule)) {
      return { localName: clause.name.text };
    }
    if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
      for (const element of clause.namedBindings.elements) {
        if ((element.propertyName?.text ?? element.name.text) === componentName && (!expectedModule || statement.moduleSpecifier.text === expectedModule)) {
          return { localName: element.name.text };
        }
      }
    }
  }
  return null;
}

function hasTopLevelBinding(sourceFile, name) {
  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement) && statement.importClause) {
      if (statement.importClause.name?.text === name) return true;
      const bindings = statement.importClause.namedBindings;
      if (bindings && ts.isNamedImports(bindings) && bindings.elements.some((element) => element.name.text === name)) return true;
    }
    if ((ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) && statement.name?.text === name) return true;
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name) && declaration.name.text === name) return true;
      }
    }
  }
  return false;
}

function importInsertion(sourceFile, source, statement) {
  const lineEnding = source.includes("\r\n") ? "\r\n" : "\n";
  let position = 0;
  for (const item of sourceFile.statements) {
    if (ts.isImportDeclaration(item) || (ts.isExpressionStatement(item) && ts.isStringLiteral(item.expression))) position = item.end;
    else break;
  }
  const before = position > 0 && !source.slice(0, position).endsWith(lineEnding) ? lineEnding : "";
  const after = position === 0 || source.slice(position).startsWith(lineEnding) ? lineEnding : `${lineEnding}${lineEnding}`;
  return { start: position, end: position, replacement: `${before}${statement}${after}` };
}

function applySemanticFixes(root, config, options = {}) {
  const dryRun = options.dryRun === true;
  const logger = options.logger ?? null;
  const elements = elementFacts(config);
  let changedFiles = 0;
  let replacements = 0;
  let importsAdded = 0;
  let skipped = 0;
  const changes = [];
  const skippedDetails = [];

  for (const file of collectFiles(root, config)) {
    const path = resolve(root, file);
    const { text: source, encoding } = readSourceFile(path);
    const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, scriptKind(file));
    const tagPairs = [];

    function visit(node) {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const rawTag = node.tagName.getText(sourceFile);
        const element = elements.get(rawTag);
        const target = element && governedTagForElement(config, rawTag, element);
        const componentName = target?.split(".")[0];
        const componentSource = componentName && config.components?.[componentName]?.source;
        const insideGovernedComponent = componentSource && toPosix(String(componentSource)) === toPosix(file);
        if (target && target !== rawTag && !insideGovernedComponent) tagPairs.push({ node, target });
      }
      ts.forEachChild(node, visit);
    }
    visit(sourceFile);
    if (!tagPairs.length) continue;

    const components = new Set(tagPairs.map(({ target }) => target.split(".")[0]));
    const localNames = new Map();
    const importEdits = [];
    const unavailable = new Map();
    for (const componentName of components) {
      const rule = config.components?.[componentName] ?? {};
      if (rule.source && toPosix(file) === toPosix(String(rule.source))) {
        unavailable.set(componentName, `The finding is inside the configured ${componentName} source file.`);
        continue;
      }
      const resolution = importPlan(root, file, componentName, rule);
      const plan = resolution.plan;
      const found = plan ? existingImport(sourceFile, componentName, plan.from) : null;
      if (found) {
        localNames.set(componentName, found.localName);
        continue;
      }
      if (!plan) {
        unavailable.set(componentName, resolution.reason);
        continue;
      }
      if (hasTopLevelBinding(sourceFile, componentName)) {
        unavailable.set(componentName, `A top-level binding named ${componentName} conflicts with the required import from ${plan.from}.`);
        continue;
      }
      const statement = plan.kind === "default"
        ? `import ${componentName} from ${JSON.stringify(plan.from)};`
        : `import { ${plan.name === componentName ? componentName : `${plan.name} as ${componentName}`} } from ${JSON.stringify(plan.from)};`;
      importEdits.push(importInsertion(sourceFile, source, statement));
      localNames.set(componentName, componentName);
    }

    const edits = [...importEdits];
    for (const { node, target } of tagPairs) {
      const [componentName] = target.split(".");
      if (unavailable.has(componentName)) {
        const location = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
        skipped += 1;
        skippedDetails.push({
          file,
          line: location.line + 1,
          column: location.character + 1,
          element: node.tagName.getText(sourceFile),
          target,
          component: componentName,
          reason: unavailable.get(componentName),
        });
        continue;
      }
      const replacement = `${localNames.get(componentName)}${target.slice(componentName.length)}`;
      edits.push({ start: node.tagName.getStart(sourceFile), end: node.tagName.getEnd(), replacement });
      if (ts.isJsxOpeningElement(node) && node.parent && ts.isJsxElement(node.parent)) {
        edits.push({ start: node.parent.closingElement.tagName.getStart(sourceFile), end: node.parent.closingElement.tagName.getEnd(), replacement });
      }
    }

    const unique = new Map(edits.map((edit) => [`${edit.start}:${edit.end}:${edit.replacement}`, edit]));
    const ordered = [...unique.values()].sort((a, b) => b.start - a.start);
    if (!ordered.length) continue;
    let updated = source;
    for (const edit of ordered) updated = `${updated.slice(0, edit.start)}${edit.replacement}${updated.slice(edit.end)}`;
    if (updated === source) continue;

    const fileReplacements = ordered.length - importEdits.length;
    changedFiles += 1;
    replacements += fileReplacements;
    importsAdded += importEdits.length;
    changes.push({ file, replacements: fileReplacements, importsAdded: importEdits.length });
    logger?.(`${dryRun ? "Would fix" : "Fixed"} ${file}: ${fileReplacements} tag edit(s), ${importEdits.length} import(s)`);
    if (!dryRun) writeSourceFile(path, updated, encoding);
  }

  return { changedFiles, replacements, importsAdded, skipped, skippedDetails, changes };
}

export { applySemanticFixes, readSourceFile, writeSourceFile };
