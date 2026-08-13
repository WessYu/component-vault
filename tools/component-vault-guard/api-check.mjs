#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, relative, resolve } from "node:path";
import ts from "typescript";
import YAML from "yaml";
import { extractProjectApis } from "./component-api.mjs";

const root = process.cwd();
const configFile = resolve(root, process.argv[2] ?? "component-vault.yaml");
const extensions = new Set([".ts", ".tsx", ".js", ".jsx"]);

function loadConfig() {
  if (!existsSync(configFile)) throw new Error(`Configuration not found: ${relative(root, configFile)}`);
  const config = YAML.parse(readFileSync(configFile, "utf8"));
  if (!config || config.version !== 1) throw new Error("component-vault.yaml must use version: 1");
  return config;
}

function collectFiles(config) {
  const output = [];
  const include = config.scan?.include ?? ["src"];
  const exclude = new Set(config.scan?.exclude ?? ["node_modules", ".next", ".git"]);
  function visit(path) {
    if (!existsSync(path)) return;
    const stat = statSync(path);
    if (stat.isDirectory()) {
      for (const child of readdirSync(path)) if (!exclude.has(child)) visit(resolve(path, child));
      return;
    }
    if (extensions.has(extname(path))) output.push(relative(root, path).replaceAll("\\", "/"));
  }
  for (const item of include) visit(resolve(root, item));
  return output.sort();
}

function scriptKind(file) {
  if (file.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (file.endsWith(".jsx")) return ts.ScriptKind.JSX;
  if (file.endsWith(".js")) return ts.ScriptKind.JS;
  return ts.ScriptKind.TS;
}

function literalValue(attribute) {
  if (!attribute.initializer) return true;
  if (ts.isStringLiteral(attribute.initializer)) return attribute.initializer.text;
  if (ts.isJsxExpression(attribute.initializer) && attribute.initializer.expression) {
    const expression = attribute.initializer.expression;
    if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) return expression.text;
  }
  return null;
}

function checkFile(file, apis) {
  const source = readFileSync(resolve(root, file), "utf8");
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, scriptKind(file));
  const byName = new Map(apis.map((api) => [api.name, api]));
  const violations = [];
  function add(attribute, message, suggestion) {
    const position = sourceFile.getLineAndCharacterOfPosition(attribute.getStart(sourceFile));
    violations.push({ code: "CV006", file, line: position.line + 1, column: position.character + 1, message, suggestion });
  }
  function visit(node) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(sourceFile);
      const [component, variant] = tag.split(".");
      const api = byName.get(component);
      if (api) {
        const props = new Map(api.props.map((prop) => [prop.name, prop]));
        for (const attribute of node.attributes.properties) {
          if (!ts.isJsxAttribute(attribute)) continue;
          const name = attribute.name.text;
          if (name === "children") continue;
          const prop = props.get(name);
          if (!prop) {
            add(attribute, `${component}.${variant ? `${variant}.` : ""}${name} is not part of the declared component API.`, `Use one of: ${[...props.keys()].join(", ") || "no declared props"}.`);
            continue;
          }
          const value = literalValue(attribute);
          if (value !== null && prop.values && !prop.values.includes(String(value))) {
            add(attribute, `${component}.${name} received ${JSON.stringify(value)}.`, `Allowed values: ${prop.values.join(", ")}.`);
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return violations;
}

function main() {
  try {
    const config = loadConfig();
    const componentFiles = Object.values(config.components ?? {}).map((rule) => rule.source).filter(Boolean);
    const apis = extractProjectApis(componentFiles, root);
    const violations = collectFiles(config).flatMap((file) => checkFile(file, apis));
    if (!violations.length) {
      console.log(`Component Vault API check: no violations found across ${apis.length} component API(s).`);
      return;
    }
    for (const item of violations) {
      console.log(`\n[${item.code}] ${item.file}:${item.line}:${item.column}`);
      console.log(`  ${item.message}`);
      console.log(`  → ${item.suggestion}`);
    }
    console.log(`\nComponent Vault API check: ${violations.length} violation(s).`);
    process.exitCode = 1;
  } catch (error) {
    console.error(`Component Vault API check: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}

main();
