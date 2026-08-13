#!/usr/bin/env node

import { existsSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";
import { extractProjectApis } from "./component-api.mjs";

const DEFAULT_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);
const DEFAULT_EXCLUDES = new Set(["node_modules", ".next", ".git"]);

function toPosix(value) {
  return value.split(sep).join("/");
}

function collectFiles(root, directory) {
  const files = [];
  const start = resolve(root, directory);

  function visit(path) {
    const relativePath = toPosix(relative(root, path));
    if (relativePath && relativePath.split("/").some((part) => DEFAULT_EXCLUDES.has(part))) return;
    const stats = statSync(path);
    if (stats.isDirectory()) {
      for (const child of readdirSync(path)) visit(join(path, child));
      return;
    }
    if (DEFAULT_EXTENSIONS.has(extname(path))) files.push(relativePath);
  }

  if (existsSync(start)) visit(start);
  return files.sort();
}

function printApi(api) {
  console.log("Component Vault — Component API\n");

  if (!api.length) {
    console.log("No React component APIs found.");
    return;
  }

  for (const component of api) {
    console.log(component.name);
    console.log(`  source: ${component.source}`);

    if (!component.props.length) {
      console.log("  props: none");
    } else {
      for (const prop of component.props) {
        const required = prop.required ? "required" : "optional";
        const values = prop.values?.length ? ` [${prop.values.join(" | ")}]` : "";
        console.log(`  ${prop.name}: ${prop.type}${values} (${required})`);
      }
    }

    console.log(`  composition: children=${component.composition.children ? "supported" : "not detected"}`);
    console.log("");
  }

  console.log(`✓ ${api.length} component API(s) analyzed`);
}

const root = process.cwd();
const directory = process.argv[2] ?? "src";

try {
  const files = collectFiles(root, directory);
  const api = extractProjectApis(files, root);
  printApi(api);
} catch (error) {
  console.error(`Component Vault API error: ${error.message}`);
  process.exitCode = 1;
}
