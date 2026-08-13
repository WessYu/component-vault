import { existsSync, readFileSync } from "node:fs";
import { extname, resolve } from "node:path";
import ts from "typescript";

const SCRIPT_KINDS = { ".tsx": ts.ScriptKind.TSX, ".jsx": ts.ScriptKind.JSX, ".ts": ts.ScriptKind.TS, ".js": ts.ScriptKind.JS };
const scriptKind = (file) => SCRIPT_KINDS[extname(file)] ?? ts.ScriptKind.TSX;

function typeName(typeNode) {
  if (!typeNode) return "unknown";
  if (ts.isLiteralTypeNode(typeNode)) return typeNode.literal.getText();
  if (ts.isUnionTypeNode(typeNode)) return typeNode.types.map(typeName).join(" | ");
  if (ts.isArrayTypeNode(typeNode)) return `${typeName(typeNode.elementType)}[]`;
  return typeNode.getText();
}

function propInfo(member) {
  if (!ts.isPropertySignature(member) || !member.name) return null;
  const type = member.type;
  const result = { name: member.name.getText(), required: !member.questionToken, type: typeName(type) };
  if (type && ts.isUnionTypeNode(type)) {
    const literals = type.types.filter(ts.isLiteralTypeNode).map((item) => item.literal.getText().replace(/^['\"]|['\"]$/g, ""));
    if (literals.length === type.types.length) result.values = literals;
  }
  return result;
}

function resolvePropsType(sourceFile, parameter) {
  if (!parameter?.type) return null;
  if (ts.isTypeLiteralNode(parameter.type)) return parameter.type;
  if (!ts.isTypeReferenceNode(parameter.type)) return null;
  const name = parameter.type.typeName.getText(sourceFile);
  let found = null;
  function visit(node) {
    if (found) return;
    if (ts.isTypeAliasDeclaration(node) && node.name.text === name) found = node.type;
    if (ts.isInterfaceDeclaration(node) && node.name.text === name) found = node;
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return found;
}

function componentFromFunction(sourceFile, name, fn) {
  const propsType = resolvePropsType(sourceFile, fn.parameters[0]);
  const props = (propsType?.members ?? []).map(propInfo).filter(Boolean);
  return { name, props, composition: { children: props.some((prop) => prop.name === "children") } };
}

function findComponents(sourceFile) {
  const components = [];
  function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.name && /^[A-Z]/.test(node.name.text)) {
      components.push(componentFromFunction(sourceFile, node.name.text, node));
    }
    if (ts.isVariableStatement(node)) {
      for (const declaration of node.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name) || !/^[A-Z]/.test(declaration.name.text)) continue;
        const initializer = declaration.initializer;
        if (initializer && (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer))) {
          components.push(componentFromFunction(sourceFile, declaration.name.text, initializer));
        }
      }
    }
    if (ts.isExportAssignment(node) && ts.isObjectLiteralExpression(node.expression)) {
      for (const property of node.expression.properties) {
        if (!ts.isPropertyAssignment(property)) continue;
        const name = property.name.getText(sourceFile);
        const initializer = property.initializer;
        if (initializer && (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer))) {
          components.push(componentFromFunction(sourceFile, name, initializer));
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return components;
}

function exportedObjectComponents(sourceFile) {
  const components = [];
  function inspectObject(object) {
    for (const property of object.properties) {
      if (!ts.isPropertyAssignment(property)) continue;
      const name = property.name.getText(sourceFile);
      const initializer = property.initializer;
      if (ts.isIdentifier(initializer)) {
        const declaration = sourceFile.statements.find((statement) => {
          if (!ts.isFunctionDeclaration(statement) || !statement.name) return false;
          return statement.name.text === initializer.text;
        });
        if (declaration) components.push(componentFromFunction(sourceFile, name, declaration));
      } else if (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer)) {
        components.push(componentFromFunction(sourceFile, name, initializer));
      }
    }
  }
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !ts.isObjectLiteralExpression(declaration.initializer)) continue;
      if (!/^[A-Z]/.test(declaration.name.text)) continue;
      inspectObject(declaration.initializer);
    }
  }
  return components;
}

export function extractComponentApi(file, root = process.cwd()) {
  const absolute = resolve(root, file);
  if (!existsSync(absolute)) throw new Error(`Component source not found: ${file}`);
  const source = readFileSync(absolute, "utf8");
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, scriptKind(file));
  const direct = findComponents(sourceFile);
  const objectComponents = exportedObjectComponents(sourceFile);
  const seen = new Set();
  const components = [...direct, ...objectComponents].filter((component) => {
    const key = `${component.name}:${file}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return components.map((component) => ({ ...component, source: file }));
}

export function extractProjectApis(files, root = process.cwd()) {
  return files.flatMap((file) => extractComponentApi(file, root));
}

function main() {
  const files = process.argv.slice(2).filter((value) => !value.startsWith("-"));
  if (!files.length) {
    console.error("Usage: node tools/component-vault-guard/component-api.mjs <component-file> [...files]");
    process.exitCode = 1;
    return;
  }
  try {
    console.log(JSON.stringify({ version: 1, components: extractProjectApis(files) }, null, 2));
  } catch (error) {
    console.error(`Component Vault API: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}

if (process.argv[1]?.endsWith("component-api.mjs")) main();
