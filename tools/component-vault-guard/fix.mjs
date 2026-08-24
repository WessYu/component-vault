#!/usr/bin/env node

import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readSourceFile, writeSourceFile } from "./autofix.mjs";
import { collectFiles, loadConfig } from "./semantic.mjs";

const DEFAULT_CONFIG = "component-vault.yaml";

function compileFixes(config) {
  const fixes = config.rules?.fixes ?? {};
  if (!fixes || typeof fixes !== "object" || Array.isArray(fixes)) throw new Error("rules.fixes must be a named map.");
  return Object.entries(fixes).map(([id, raw]) => {
    if (!raw || typeof raw !== "object" || typeof raw.pattern !== "string" || typeof raw.replace !== "string") {
      throw new Error(`rules.fixes.${id} requires pattern and replace.`);
    }
    const flags = String(raw.flags ?? "g");
    try {
      return {
        id,
        regexp: new RegExp(raw.pattern, flags),
        counter: new RegExp(raw.pattern, flags.includes("g") ? flags : `${flags}g`),
        replace: raw.replace,
        files: Array.isArray(raw.files) ? raw.files.map(String) : null,
      };
    } catch (error) {
      throw new Error(`Invalid regex in rules.fixes.${id}: ${error.message}`);
    }
  });
}

function toPosix(value) { return value.replaceAll("\\", "/"); }
function wildcardToRegExp(pattern) {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*\*/g, "__DOUBLE_STAR__").replace(/\*/g, "[^/]*").replace(/__DOUBLE_STAR__/g, ".*");
  return new RegExp(`^${escaped}$`);
}
function matchesPattern(file, pattern) {
  const normalized = toPosix(pattern).replace(/^\.\//, "");
  if (!normalized.includes("*")) return file === normalized || file.startsWith(`${normalized}/`) || file.split("/").includes(normalized);
  return wildcardToRegExp(normalized).test(file);
}

function applyConfiguredFixes(root, config, options = {}) {
  const dryRun = options.dryRun === true;
  const logger = options.logger ?? null;
  const fixes = compileFixes(config);
  let replacements = 0;
  let changedFiles = 0;
  const changes = [];

  for (const file of collectFiles(root, config)) {
    const absolutePath = resolve(root, file);
    const { text: original, encoding } = readSourceFile(absolutePath);
    let updated = original;
    let fileReplacements = 0;

    for (const fix of fixes) {
      if (fix.files && !fix.files.some((candidate) => matchesPattern(file, candidate))) continue;
      fix.counter.lastIndex = 0;
      fileReplacements += fix.regexp.global ? [...updated.matchAll(fix.counter)].length : Number(fix.counter.test(updated));
      fix.regexp.lastIndex = 0;
      updated = updated.replace(fix.regexp, fix.replace);
    }

    if (updated === original) continue;
    changedFiles += 1;
    replacements += fileReplacements;
    changes.push({ file, replacements: fileReplacements });
    logger?.(`${dryRun ? "Would update" : "Updated"} ${file}: ${fileReplacements} configured replacement(s)`);
    if (!dryRun) writeSourceFile(absolutePath, updated, encoding);
  }

  return { replacements, changedFiles, changes };
}

function main() {
  const root = process.cwd();
  const configArgument = process.argv.find((arg) => arg.startsWith("--config="));
  const configIndex = process.argv.indexOf("--config");
  const configPath = configArgument?.slice("--config=".length) ?? (configIndex >= 0 ? process.argv[configIndex + 1] : DEFAULT_CONFIG);
  const dryRun = process.argv.includes("--dry-run");
  const check = process.argv.includes("--check");

  try {
    const config = loadConfig(root, configPath);
    const result = applyConfiguredFixes(root, config, { dryRun: dryRun || check, logger: console.log });
    if (!result.replacements) console.log("Component Vault: no configured autofixes available.");
    else console.log(`Component Vault: ${result.replacements} configured fix(es) in ${result.changedFiles} file(s).`);
    if (check && result.replacements) {
      console.error("\nComponent Vault: --check found files that can be autofixed.");
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(`Component Vault error: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main();

export { applyConfiguredFixes, compileFixes };
