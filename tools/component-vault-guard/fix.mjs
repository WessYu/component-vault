#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";

const DEFAULT_CONFIG = "component-vault.yaml";

function parseScalar(raw) {
  const value = raw.trim();
  if (value === "") return {};
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) return value.slice(1, -1).replace(/\\n/g, "\n");
  if (value.startsWith("[") && value.endsWith("]")) {
    const inner = value.slice(1, -1).trim();
    return inner ? inner.split(",").map(parseScalar) : [];
  }
  return value;
}

function stripYamlComment(line) {
  let quote = null;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if ((char === '"' || char === "'") && line[index - 1] !== "\\") quote = quote === char ? null : quote ?? char;
    if (char === "#" && quote === null) return line.slice(0, index);
  }
  return line;
}

function parseYamlSubset(source) {
  const root = {};
  const stack = [{ indent: -1, value: root }];
  for (const originalLine of source.split(/\r?\n/)) {
    const uncommented = stripYamlComment(originalLine).replace(/\s+$/, "");
    if (!uncommented.trim()) continue;
    if (uncommented.trimStart().startsWith("- ")) throw new Error("Dash-style YAML lists are not supported by the fixer. Use inline arrays or named fix maps.");
    const indent = uncommented.length - uncommented.trimStart().length;
    const line = uncommented.trim();
    const separator = line.indexOf(":");
    if (separator < 1) throw new Error(`Invalid YAML line: ${originalLine}`);
    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1);
    while (stack.length > 1 && indent <= stack.at(-1).indent) stack.pop();
    const parent = stack.at(-1).value;
    const parsed = parseScalar(rawValue);
    parent[key] = parsed;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) stack.push({ indent, value: parsed });
  }
  return root;
}

function toPosix(value) { return value.split(sep).join("/"); }
function wildcardToRegExp(pattern) {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*\*/g, "__DOUBLE_STAR__").replace(/\*/g, "[^/]*").replace(/__DOUBLE_STAR__/g, ".*");
  return new RegExp(`^${escaped}$`);
}
function matchesPattern(file, pattern) {
  const normalized = toPosix(pattern).replace(/^\.\//, "");
  if (!normalized.includes("*")) return file === normalized || file.startsWith(`${normalized}/`) || file.split("/").includes(normalized);
  return wildcardToRegExp(normalized).test(file);
}

function collectFiles(root, config) {
  const files = [];
  const extensions = new Set((config.scan?.extensions ?? [".ts", ".tsx", ".js", ".jsx"]).map(String));
  const excludes = (config.scan?.exclude ?? ["node_modules", ".git"]).map(String);
  function visit(absolutePath) {
    const file = toPosix(relative(root, absolutePath));
    if (file && excludes.some((pattern) => matchesPattern(file, pattern))) return;
    const stats = statSync(absolutePath);
    if (stats.isDirectory()) {
      for (const child of readdirSync(absolutePath)) visit(join(absolutePath, child));
      return;
    }
    if (extensions.has(extname(absolutePath))) files.push(file);
  }
  for (const include of config.scan?.include ?? ["src"]) {
    const absolute = resolve(root, String(include));
    if (existsSync(absolute)) visit(absolute);
  }
  return files.sort();
}

function compileFixes(config) {
  const fixes = config.rules?.fixes ?? {};
  if (!fixes || typeof fixes !== "object" || Array.isArray(fixes)) throw new Error("rules.fixes must be a named map.");
  return Object.entries(fixes).map(([id, raw]) => {
    if (!raw || typeof raw !== "object" || typeof raw.pattern !== "string" || typeof raw.replace !== "string") {
      throw new Error(`rules.fixes.${id} requires pattern and replace.`);
    }
    let regexp;
    try { regexp = new RegExp(raw.pattern, raw.flags ?? "g"); }
    catch (error) { throw new Error(`Invalid regex in rules.fixes.${id}: ${error.message}`); }
    return { id, regexp, pattern: raw.pattern, replace: raw.replace, files: Array.isArray(raw.files) ? raw.files.map(String) : null };
  });
}

function applyFixes(root, config, dryRun) {
  const fixes = compileFixes(config);
  let replacements = 0;
  let changedFiles = 0;
  const changes = [];

  for (const file of collectFiles(root, config)) {
    const absolutePath = resolve(root, file);
    const original = readFileSync(absolutePath, "utf8");
    let updated = original;
    let fileReplacements = 0;

    for (const fix of fixes) {
      if (fix.files && !fix.files.some((candidate) => matchesPattern(file, candidate))) continue;
      fix.regexp.lastIndex = 0;
      updated = updated.replace(fix.regexp, () => {
        fileReplacements += 1;
        return fix.replace;
      });
    }

    if (updated !== original) {
      changedFiles += 1;
      replacements += fileReplacements;
      changes.push({ file, replacements: fileReplacements });
      if (!dryRun) writeFileSync(absolutePath, updated, "utf8");
    }
  }

  return { replacements, changedFiles, changes };
}

function main() {
  const root = process.cwd();
  const configPath = process.argv.find((arg) => arg.startsWith("--config="))?.slice("--config=".length) ?? DEFAULT_CONFIG;
  const dryRun = process.argv.includes("--dry-run");
  const check = process.argv.includes("--check");

  try {
    const configFile = resolve(root, configPath);
    if (!existsSync(configFile)) throw new Error(`Configuration not found: ${configPath}`);
    const config = parseYamlSubset(readFileSync(configFile, "utf8"));
    if (config.version !== 1) throw new Error("component-vault.yaml must use version: 1");

    const result = applyFixes(root, config, dryRun || check);
    if (!result.replacements) {
      console.log("Component Vault: no safe autofixes available.");
      process.exitCode = 0;
      return;
    }

    console.log(`Component Vault: ${result.replacements} safe fix(es) in ${result.changedFiles} file(s).`);
    for (const change of result.changes) console.log(`  ${dryRun || check ? "would update" : "updated"} ${change.file} (${change.replacements})`);

    if (check) {
      console.error("\nComponent Vault: --check found files that can be autofixed.");
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(`Component Vault error: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
