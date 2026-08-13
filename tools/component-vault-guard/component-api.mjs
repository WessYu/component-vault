import { existsSync, readFileSync } from "node:fs";
import { extname, resolve } from "node:path";
import ts from "typescript";

const SCRIPT_KINDS = {
  ".tsx": ts.ScriptKind.TSX,
  ".jsx": ts.ScriptKind.JSX,
  ".ts": ts.ScriptKind.TS,
  ".js": ts.ScriptKind.JS,
};

function scriptKind(file) {
  return SCRIPT_KINDS[extname(file)] ?? ts.ScriptKind.TSX;
}

function typeName(typeNode) {
  if (!typeNode) return "unknown";
  if (ts.isLiteralTypeNode(typeNode)) return typeNode.literal.getText();
  if (ts.isUnionTypeNode(typeNode)) return typeNode.types.map(typeName).join(" | ");
  if (ts.isArrayTypeNode(typeNode)) return `${typeName(typeNode.elementType)}[]`;
  if (ts.isTypeReferenceNode(typeNode)) return typeNode.getText();
  return typeNode.getText();
}

function propInfo(member) {
  if (!ts.isPropertySignature(member) || !member.name) return null;
  const name = member.name.getText();
  const type = member.type;
  const result = {
    name,
    required: !member.questionToken,
    type: typeName(type),
  };

  if (type && ts.isUnionTypeNode(type)) {
    const literals = type.types
      .filter((item) => ts.isLiteralTypeNode(item))
      .map((item) => item.literal.getText());
    if (literals.length === type.types.length) result.values = literals;
  }

  return result;
}

function resolvePropsType(sourceFile, node) {
  if (!node?.type) return null;
  if (ts.isTypeLiteralNode(node.type)) return node.type;
  if (!ts.isTypeReferenceNode(node.type)) return null;

  const name = node.type.typeName.getText(sourceFile);
  let found = null;
  function visit(child) {
    if (found) return;
    if (ts.isTypeAliasDeclaration(child) && child.name.text === name) found = child.type;
    if (ts.isInterfaceDeclaration(child) && child.name.text === name) found = child;
    ts.forEachChild(child, visit);
  }
  visit(sourceFile);
  return found;
}

function findComponentName(node) {
  if (ts.isFunctionDeclaration(node) && node.name && /^[A-Z]/.test(node.name.text)) return node.name.text;
  if (ts.isVariableStatement(node)) {
    for (const declaration of node.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && /^[A-Z]/.test(declaration.name.text)) return declaration.name.text;
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
    const name = findComponentName(node);
    if (name) {
      let parameter = null;
      if (ts.isFunctionDeclaration(node)) parameter = node.parameters[0];
      if (ts.isVariableStatement(node)) {
        const declaration = node.declarationList.declarations.find((item) => ts.isIdentifier(item.name) && item.name.text === name);
        if (declaration && ts.isArrowFunction(declaration.initializer) || declaration && ts.isFunctionExpression(declaration.initializer)) parameter = declaration.initializer.parameters[0];
      }
      const propsType = resolvePropsType(sourceFile, parameter);
      const members = propsType?.members ?? [];
      const props = members.map(propInfo).filter(Boolean);
      const children = props.some((prop) => prop.name === "children");
      components.push({ name, source: file, props, composition: { children } });
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return components;
}

export function extractProjectApis(files, root = process.cwd()) {
  return files.flatMap((file) => extractComponentApi(file, root));
}
