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
    const literals = type.types.filter(ts.isLiteralTypeNode).map((item) => item.literal.getText());
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

function findComponentDeclaration(node) {
  if (ts.isFunctionDeclaration(node) && node.name && /^[A-Z]/.test(node.name.text)) return { name: node.name.text, parameter: node.parameters[0] };
  if (ts.isVariableStatement(node)) {
    for (const declaration of node.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !/^[A-Z]/.test(declaration.name.text)) continue;
      const initializer = declaration.initializer;
      if (initializer && (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer))) return { name: declaration.name.text, parameter: initializer.parameters[0] };
    }
  }
  return null;
}

export function extractComponentApi(file, root = process.cwd()) {
  const absolute = resolve(root, file);
  if (!existsSync(absolute)) throw new Error(`Component source not found: ${file}`);
  const source = readFileSync(absolute, "utf8");
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, scriptKind(file));
  const components = [];
  function visit(node) {
    const declaration = findComponentDeclaration(node);
    if (declaration) {
      const propsType = resolvePropsType(sourceFile, declaration.parameter);
      const props = (propsType?.members ?? []).map(propInfo).filter(Boolean);
      components.push({ name: declaration.name, source: file, props, composition: { children: props.some((prop) => prop.name === "children") } });
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return components;
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
