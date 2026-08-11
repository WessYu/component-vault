#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import process from "node:process";
import ts from "typescript";
import YAML from "yaml";
import { analyze, collectFiles, elementFacts, explainSemantic, governedTagForElement, loadConfig, scriptKind, semanticScan } from "./semantic.mjs";

const VERSION = "0.4.1";
const CORE_PATH = fileURLToPath(new URL("./cli.mjs", import.meta.url));
const DEFAULT_CONFIG = "component-vault.yaml";
const SEMANTIC_BASELINE = ".component-vault/semantic-baseline.json";

function parseArgs(argv) {
  const [command = "help", ...rest] = argv;
  const options = {};
  const positional = [];
  for (let index = 0; index < rest.length; index += 1) {
    const item = rest[index];
    if (!item.startsWith("--")) {
      positional.push(item);
      continue;
    }
    const key = item.slice(2);
    const next = rest[index + 1];
    if (!next || next.startsWith("--")) options[key] = true;
    else {
      options[key] = next;
      index += 1;
    }
  }
  return { command, options, positional };
}

function coreArgs(command, options, positional = []) {
  const args = [command, ...positional];
  for (const key of ["base", "config", "baseline", "output", "report"]) {
    if (typeof options[key] === "string") args.push(`--${key}`, options[key]);
  }
  if (options["dry-run"] === true) args.push("--dry-run");
  if (options.check === true) args.push("--check");
  return args;
}

function runLegacy(command, options, positional = []) {
  return spawnSync(process.execPath, [CORE_PATH, ...coreArgs(command, options, positional)], {
    cwd: process.cwd(), encoding: "utf8", stdio: ["ignore", "pipe", "pipe"]
  });
}

function printLegacy(result) {
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
}

function fingerprint(finding) {
  return createHash("sha1").update([finding.code, finding.semanticRole, finding.level ?? "", finding.file, finding.line, finding.column, finding.element].join("|")).digest("hex").slice(0, 16);
}

function semanticBaselinePath(root) { return resolve(root, SEMANTIC_BASELINE); }

function readSemanticBaseline(root) {
  const path = semanticBaselinePath(root);
  if (!existsSync(path)) return new Set();
  try {
    const data = JSON.parse(readFileSync(path, "utf8"));
    return new Set(Array.isArray(data.fingerprints) ? data.fingerprints : []);
  } catch { return new Set(); }
}

function writeSemanticBaseline(root, findings) {
  const path = semanticBaselinePath(root);
  mkdirSync(resolve(root, ".component-vault"), { recursive: true });
  const fingerprints = findings.map(fingerprint).sort();
  writeFileSync(path, `${JSON.stringify({ version: 1, generatedAt: new Date().toISOString(), fingerprints }, null, 2)}\n`, "utf8");
}

function semanticFindings(root, configPath, includeBaseline = true) {
  const config = loadConfig(root, configPath);
  const result = semanticScan(root, config);
  const baseline = includeBaseline ? readSemanticBaseline(root) : new Set();
  return result.findings.map((item) => ({ ...item, fingerprint: fingerprint(item) })).filter((item) => !baseline.has(item.fingerprint));
}

function printSemanticFindings(findings) {
  if (!findings.length) return console.log("Component Vault Semantic Guard: no new semantic violations.");
  for (const item of findings) {
    console.log(`\n[${item.code}] ${item.title}`);
    console.log(`${item.file}:${item.line}:${item.column}`);
    console.log(`  ${item.message}`);
    console.log(`  ${item.snippet}`);
    console.log(`  → ${item.suggestion}`);
    if (item.fix) console.log(`  ↳ Autofix: ${item.fix}`);
  }
  console.log(`\nComponent Vault Semantic Guard: ${findings.length} new semantic violation(s).`);
}

function semanticInit(root, configPath) {
  const path = resolve(root, configPath);
  if (!existsSync(path)) return;
  const config = YAML.parse(readFileSync(path, "utf8")) ?? {};
  config.semantics ??= {};
  config.semantics.strict ??= false;
  config.semantics.elements ??= {};
  config.semantics.components ??= {};
  if (!Object.keys(config.semantics.elements).length) Object.assign(config.semantics.elements, {
    h1: { role: "heading", level: 1 }, h2: { role: "heading", level: 2 }, h3: { role: "heading", level: 3 },
    p: { role: "body-text" }, small: { role: "caption" }, button: { role: "button" }, a: { role: "link" }
  });
  for (const [name, definition] of Object.entries(config.components ?? {})) {
    if (!definition || typeof definition !== "object") continue;
    if (definition.semanticRole && !config.semantics.components[name]) config.semantics.components[name] = { roles: { [String(definition.semanticRole)]: {} } };
  }
  writeFileSync(path, `${YAML.stringify(config)}\n`, "utf8");
}

function formatAnalyze(result) {
  const lines = ["Component Vault Semantic Analysis", "", "Role                 Native   Governed   Findings", "────────────────────────────────────────────────────"];
  for (const item of result.summary) lines.push(`${item.role.padEnd(20)} ${String(item.semanticOccurrences).padStart(6)} ${String(item.governedUsages).padStart(10)} ${String(item.findings).padStart(10)}`);
  if (!result.summary.length) lines.push("No semantic roles configured.");
  lines.push("", `Files analyzed: ${result.files.length}`, `Semantic findings: ${result.findings.length}`);
  return lines.join("\n");
}

function printAnalyze(root, configPath) {
  const config = loadConfig(root, configPath);
  const result = analyze(root, config);
  console.log(formatAnalyze(result));
  if (result.findings.length) {
    console.log("\nFindings:\n");
    result.findings.slice(0, 20).forEach((finding) => console.log(explainSemantic(finding) + "\n"));
  }
}

function applySemanticFixes(root, configPath, dryRun = false) {
  const config = loadConfig(root, configPath);
  const elements = elementFacts(config);
  let changedFiles = 0;
  let replacements = 0;
  let skipped = 0;

  for (const file of collectFiles(root, config)) {
    const path = resolve(root, file);
    const source = readFileSync(path, "utf8");
    const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, scriptKind(file));
    const edits = [];

    function addTagEdit(tagNode, replacement) {
      edits.push({ start: tagNode.getStart(sourceFile), end: tagNode.getEnd(), replacement });
    }

    function visit(node) {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const tag = node.tagName.getText(sourceFile);
        const element = elements.get(tag);
        if (element) {
          const target = governedTagForElement(config, tag, element);
          if (target && target !== tag) {
            addTagEdit(node.tagName, target);
            if (ts.isJsxOpeningElement(node) && node.parent && ts.isJsxElement(node.parent)) {
              const closing = node.parent.closingElement;
              if (closing) addTagEdit(closing.tagName, target);
            }
          } else {
            skipped += 1;
          }
        }
      }
      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
    if (!edits.length) continue;

    const unique = new Map(edits.map((edit) => [`${edit.start}:${edit.end}`, edit]));
    const ordered = [...unique.values()].sort((a, b) => b.start - a.start);
    let updated = source;
    for (const edit of ordered) updated = `${updated.slice(0, edit.start)}${edit.replacement}${updated.slice(edit.end)}`;

    if (updated === source) continue;
    changedFiles += 1;
    replacements += ordered.length;
    console.log(`${dryRun ? "Would fix" : "Fixed"} ${file}: ${ordered.length} semantic replacement(s)`);
    if (!dryRun) writeFileSync(path, updated, "utf8");
  }

  console.log(`\nComponent Vault Semantic Fix: ${replacements} replacement(s) in ${changedFiles} file(s).`);
  if (skipped) console.log(`Skipped ${skipped} semantic occurrence(s) without a resolvable governed target.`);
  return { changedFiles, replacements, skipped };
}

function handleFix(root, options, positional) {
  const configPath = typeof options.config === "string" ? options.config : DEFAULT_CONFIG;
  const dryRun = options["dry-run"] === true || options.check === true;

  console.log("Component Vault Guard Autofix\n");

  const legacy = runLegacy("fix", options, positional);
  printLegacy(legacy);
  if (legacy.status !== 0) {
    process.exitCode = legacy.status ?? 1;
    return;
  }

  const semantic = applySemanticFixes(root, configPath, dryRun);
  process.exitCode = 0;
  if (!semantic.replacements && !legacy.stdout?.includes("replacement(s)")) console.log("\nNo automatically fixable findings were found.");
}

function help() {
  console.log(`Component Vault Guard v${VERSION}\n\nUsage:\n  npx component-vault <command> [options]\n\nSetup:\n  init [--ci] [--force]     Initialize governance and semantic mappings\n  doctor                    Validate local Guard setup\n\nGovernance:\n  scan                      Scan AST and semantic roles\n  check [--base REF]        Enforce governance and semantic policies\n  fix [--dry-run]           Automatically fix supported governance and semantic findings\n  baseline                  Capture accepted legacy findings\n  report [--output FILE]    Generate migration report\n  pr [--base REF]           Generate PR gate summary\n  context                   Export agent-readable rules\n  explain CV001             Explain a Guard rule\n\nSemantic model:\n  analyze                   Inspect semantic roles, coverage and mappings\n  explain CV006             Explain a semantic finding\n\nOptions:\n  --config FILE             Use another YAML configuration\n  --baseline FILE           Use another baseline file\n  --output FILE             Output path for report/PR summary\n  --report FILE             Internal report path used by PR\n  --dry-run                 Preview supported fixes without changing files\n\nExamples:\n  npx component-vault analyze\n  npx component-vault scan\n  npx component-vault fix --dry-run\n  npx component-vault fix\n  npx component-vault baseline\n  npx component-vault check\n  npx component-vault pr --base origin/master\n`);
}

function main() {
  const root = process.cwd();
  const { command, options, positional } = parseArgs(process.argv.slice(2));
  const configPath = typeof options.config === "string" ? options.config : DEFAULT_CONFIG;
  if (["help", "--help", "-h"].includes(command)) return help();
  if (["version", "--version", "-v"].includes(command)) return console.log(VERSION);
  if (command === "analyze") return printAnalyze(root, configPath);
  if (command === "init") {
    const result = runLegacy(command, options, positional); printLegacy(result);
    if (result.status === 0) semanticInit(root, configPath);
    process.exitCode = result.status ?? 1; return;
  }
  if (command === "fix") return handleFix(root, options, positional);
  if (command === "baseline") {
    const result = runLegacy(command, options, positional); printLegacy(result);
    if (result.status === 0) { const config = loadConfig(root, configPath); writeSemanticBaseline(root, semanticScan(root, config).findings); console.log(`Component Vault Semantic Guard: baseline written to ${SEMANTIC_BASELINE}`); }
    process.exitCode = result.status ?? 1; return;
  }
  if (["scan", "check"].includes(command)) {
    const result = runLegacy(command, options, positional); printLegacy(result);
    const findings = semanticFindings(root, configPath, true); printSemanticFindings(findings);
    process.exitCode = result.status !== 0 || findings.length ? 1 : 0; return;
  }
  if (command === "pr") {
    const result = runLegacy(command, options, positional); printLegacy(result);
    const findings = semanticFindings(root, configPath, true);
    if (findings.length) { printSemanticFindings(findings); process.exitCode = 1; } else process.exitCode = result.status ?? 1;
    return;
  }
  if (command === "explain" && positional[0] === "CV006") {
    const findings = semanticFindings(root, configPath, false);
    if (!findings.length) return console.log("CV006: no current semantic findings.");
    console.log(explainSemantic(findings[0])); return;
  }
  const result = runLegacy(command, options, positional); printLegacy(result); process.exitCode = result.status ?? 1;
}

try { main(); } catch (error) {
  console.error(`Component Vault Guard: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
