#!/usr/bin/env node

import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const VERSION = "0.2.0";
const CORE_PATH = fileURLToPath(new URL("./cli-v2.mjs", import.meta.url));
const DEFAULT_CONFIG = "component-vault.yaml";
const DEFAULT_BASELINE = "component-vault.baseline.json";

function toPosix(value) {
  return value.split(sep).join("/");
}

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
  for (const key of ["base", "config", "baseline", "output"]) {
    if (typeof options[key] === "string") args.push(`--${key}`, options[key]);
  }
  return args;
}

function runCore(args, { capture = false } = {}) {
  return spawnSync(process.execPath, [CORE_PATH, ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });
}

function detectTextSource(root) {
  const candidates = [
    "src/components/ui/text.tsx",
    "src/components/text.tsx",
    "components/ui/text.tsx",
    "components/text.tsx",
  ];
  return candidates.find((candidate) => existsSync(resolve(root, candidate))) ?? "src/components/ui/text.tsx";
}

function detectScanInclude(root) {
  return existsSync(resolve(root, "src")) ? "src" : ".";
}

function starterConfig(root) {
  const include = detectScanInclude(root);
  const textSource = detectTextSource(root);
  return `version: 1

scan:
  include: [${include}]
  exclude: [node_modules, .next, dist, build, coverage, .git]
  extensions: [.ts, .tsx, .js, .jsx]

duplicates:
  enabled: true
  minOccurrences: 4
  minTokens: 4

components:
  Text:
    source: ${textSource}
    allowedImportFiles: [${textSource}]
    forbiddenImports: [tamagui, "@radix-ui/themes"]
    forbiddenProps: [fontSize, lineHeight, fontWeight]
    strategy: touched
    rawElements:
      h1: H1
      h2: H2
      p: Paragraph
      small: Caption
    variants:
      H1: Main page title
      H2: Section heading
      Paragraph: Default body text
      Caption: Secondary supporting text
`;
}

function starterBaseline() {
  return `${JSON.stringify({ version: 2, generatedAt: null, fingerprints: [], violations: [] }, null, 2)}\n`;
}

function setupNotes() {
  return `# Component Vault Guard setup

The project is initialized for AST-based design-system governance.

Recommended next steps:

1. Run \`npx component-vault scan\` to inspect current findings.
2. On an existing codebase, run \`npx component-vault baseline\` once to capture accepted legacy debt.
3. Run \`npx component-vault pr --base HEAD~1\` to generate a concise PR gate summary.
4. Run \`npx component-vault context\` to export agent-readable rules.
5. Promote a component from \`touched\` to \`full\` after its legacy debt reaches zero.

Edit \`component-vault.yaml\` to add governed components, forbidden imports, protected props and semantic variants.
`;
}

function githubWorkflow() {
  return `name: Component Vault Guard

on:
  pull_request:

permissions:
  contents: read

jobs:
  guard:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - name: Component Vault Guard
        run: npx --yes component-vault@latest pr --base "\${{ github.event.pull_request.base.sha }}"
`;
}

function writeText(path, content, force = false) {
  if (existsSync(path) && !force) return false;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  return true;
}

function handleInit(options) {
  const root = process.cwd();
  const force = options.force === true;
  const configPath = resolve(root, String(options.config ?? DEFAULT_CONFIG));
  const baselinePath = resolve(root, String(options.baseline ?? DEFAULT_BASELINE));
  const notesPath = resolve(root, ".component-vault/README.md");

  const created = [];
  if (writeText(configPath, starterConfig(root), force)) created.push(toPosix(relative(root, configPath)));
  if (writeText(baselinePath, starterBaseline(), force)) created.push(toPosix(relative(root, baselinePath)));
  if (writeText(notesPath, setupNotes(), force)) created.push(toPosix(relative(root, notesPath)));

  if (options.ci === true) {
    const workflowPath = resolve(root, ".github/workflows/component-vault-guard.yml");
    if (writeText(workflowPath, githubWorkflow(), force)) created.push(toPosix(relative(root, workflowPath)));
  }

  if (!created.length) {
    console.log("Component Vault Guard is already initialized. Use --force to regenerate starter files.");
  } else {
    console.log("Component Vault Guard initialized.");
    for (const file of created) console.log(`  + ${file}`);
  }

  console.log("\nNext:");
  console.log("  npx component-vault scan");
  console.log("  npx component-vault baseline   # existing codebases");
  console.log("  npx component-vault pr --base HEAD~1");
}

function baselineCount(path) {
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8"));
    return Array.isArray(parsed.fingerprints) ? parsed.fingerprints.length : 0;
  } catch {
    return -1;
  }
}

function handleDoctor(options) {
  const root = process.cwd();
  const configPath = resolve(root, String(options.config ?? DEFAULT_CONFIG));
  const baselinePath = resolve(root, String(options.baseline ?? DEFAULT_BASELINE));
  const checks = [];

  checks.push(["Configuration", existsSync(configPath), toPosix(relative(root, configPath))]);
  const baseline = baselineCount(baselinePath);
  checks.push(["Baseline", baseline !== null && baseline >= 0, baseline === null ? "missing" : baseline < 0 ? "invalid JSON" : `${baseline} accepted error(s)`]);
  const gitDetected = existsSync(resolve(root, ".git"));
  checks.push(["Git repository", gitDetected, gitDetected ? "detected" : "not detected"]);

  let engineReady = false;
  if (existsSync(configPath)) {
    const result = runCore(coreArgs("scan", options), { capture: true });
    engineReady = result.status === 0;
    if (!engineReady && result.stderr) process.stderr.write(result.stderr);
  }
  checks.push(["TypeScript AST engine", engineReady, engineReady ? "ready" : "scan failed"]);

  console.log(`Component Vault Guard doctor v${VERSION}\n`);
  for (const [label, ok, detail] of checks) console.log(`${ok ? "✓" : "✕"} ${label}: ${detail}`);
  const failed = checks.filter(([, ok]) => !ok).length;
  console.log(failed ? `\n${failed} setup check(s) need attention.` : "\nGuard setup looks ready.");
  if (failed) process.exitCode = 1;
}

function renderPrSummary(report) {
  const summary = report.summary;
  const allowed = summary.blocking === 0;
  const heading = allowed ? "✅ Component Vault Guard allows this PR" : "❌ Component Vault Guard blocked this PR";
  const rows = [
    ["Migration", `${summary.migrationProgress}%`],
    ["Legacy", String(summary.legacy)],
    ["Resolved", String(summary.resolved)],
    ["New", String(summary.new)],
    ["Blocking", String(summary.blocking)],
    ["Files scanned", String(summary.filesScanned)],
  ];
  const findings = report.violations.slice(0, 5);
  const lines = [
    `## ${heading}`,
    "",
    `Engine: \`${report.engine ?? "unknown"}\``,
    "",
    "| Metric | Value |",
    "| --- | ---: |",
    ...rows.map(([label, value]) => `| ${label} | ${value} |`),
    "",
  ];
  if (findings.length) {
    lines.push("### Sample findings", "");
    for (const finding of findings) {
      lines.push(`- \`${finding.rule}\` \`${finding.file}:${finding.line}:${finding.column ?? 1}\` — ${finding.message}${finding.suggestion ? ` Fix: ${finding.suggestion}` : ""}`);
    }
    lines.push("");
  }
  lines.push(allowed ? "No blocking design-system drift was introduced by this gate." : "Resolve the blocking findings before merging.", "");
  return `${lines.join("\n")}\n`;
}

function handlePr(options) {
  const root = process.cwd();
  const reportPath = String(options.report ?? ".component-vault/pr-report.json");
  const summaryPath = String(options.output ?? ".component-vault/pr-summary.md");
  const reportOptions = { ...options, output: reportPath };
  const result = runCore(coreArgs("report", reportOptions), { capture: true });
  if (result.status !== 0) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    process.exitCode = result.status ?? 1;
    return;
  }

  const report = JSON.parse(readFileSync(resolve(root, reportPath), "utf8"));
  const markdown = renderPrSummary(report);
  const absoluteSummary = resolve(root, summaryPath);
  mkdirSync(dirname(absoluteSummary), { recursive: true });
  writeFileSync(absoluteSummary, markdown);

  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);

  const summary = report.summary;
  console.log(`Component Vault Guard PR · ${summary.blocking === 0 ? "allowed" : "blocked"}`);
  console.log(`Migration ${summary.migrationProgress}% · ${summary.legacy} legacy · ${summary.new} new · ${summary.resolved} resolved · ${summary.blocking} blocking`);
  console.log(`Summary: ${toPosix(relative(root, absoluteSummary))}`);
  if (summary.blocking > 0) process.exitCode = 1;
}

function printHelp() {
  console.log(`Component Vault Guard v${VERSION}

Usage:
  npx component-vault <command> [options]

Setup:
  init [--ci] [--force]     Create component-vault.yaml, baseline and setup notes
  doctor                    Validate local Guard setup

Governance:
  scan                      Scan TypeScript/JavaScript AST and print findings
  check [--base REF]        Enforce protect, touched and full strategies
  baseline                  Capture current AST errors as accepted legacy
  report [--output FILE]    Generate the full JSON migration report
  pr [--base REF]           Generate a concise PR summary and fail when blocked
  context                   Export agent-readable Markdown and JSON rules
  explain CV001             Explain a Guard rule

Options:
  --config FILE             Use another YAML configuration
  --baseline FILE           Use another baseline file
  --output FILE             Output path for report/PR summary
  --report FILE             Internal JSON report path used by the PR command

Examples:
  npx component-vault init --ci
  npx component-vault scan
  npx component-vault baseline
  npx component-vault pr --base origin/master
`);
}

function main() {
  const { command, options, positional } = parseArgs(process.argv.slice(2));
  if (["help", "--help", "-h"].includes(command)) return printHelp();
  if (["version", "--version", "-v"].includes(command)) return console.log(VERSION);
  if (command === "init") return handleInit(options);
  if (command === "doctor") return handleDoctor(options);
  if (command === "pr") return handlePr(options);

  const result = runCore(coreArgs(command, options, positional));
  process.exitCode = result.status ?? 1;
}

try {
  main();
} catch (error) {
  console.error(`Component Vault Guard: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
