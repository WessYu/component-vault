import assert from "node:assert/strict";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import process from "node:process";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const exampleRoot = resolve(repoRoot, "examples/react-vite");
const packageRoot = resolve(repoRoot, "packages/component-vault");
const artifactRoot = resolve(repoRoot, "artifacts/component-vault-demo");
const workRoot = mkdtempSync(resolve(tmpdir(), "component-vault-proof-"));
const packRoot = resolve(workRoot, "package");
const projectRoot = resolve(workRoot, "react-vite");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const transcript = [];

function record(value = "") {
  transcript.push(value);
  process.stdout.write(`${value}\n`);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? repoRoot,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1", FORCE_COLOR: "0" },
  });
  const output = [result.stdout, result.stderr].filter(Boolean).join("").trim();
  if (options.label) record(`\n$ ${options.label}`);
  if (output) record(output);
  return result;
}

function runCli(args, expectedStatus) {
  const cli = resolve(projectRoot, "node_modules/@wess2001/component-vault/bin/component-vault.mjs");
  const result = run(process.execPath, [cli, ...args], {
    cwd: projectRoot,
    label: `npx component-vault ${args.join(" ")}`,
  });
  assert.equal(result.status, expectedStatus, `Unexpected status for component-vault ${args.join(" ")}`);
  return result;
}

try {
  rmSync(artifactRoot, { recursive: true, force: true });
  mkdirSync(artifactRoot, { recursive: true });
  mkdirSync(packRoot, { recursive: true });
  cpSync(exampleRoot, projectRoot, { recursive: true });

  record("Component Vault reproducible product proof");
  record(`Node ${process.version}`);

  const packed = run(npmCommand, ["pack", packageRoot, "--silent", "--pack-destination", packRoot]);
  assert.equal(packed.status, 0, "The CLI package could not be packed");
  const tarballName = packed.stdout.trim().split(/\r?\n/).findLast((line) => line.endsWith(".tgz"));
  assert.ok(tarballName, "npm pack did not return a tarball name");
  const tarball = resolve(packRoot, tarballName);

  const installed = run(npmCommand, ["install", "--silent", "--no-audit", "--no-fund", tarball], {
    cwd: projectRoot,
    label: `npm install ${tarballName}`,
  });
  assert.equal(installed.status, 0, "The packed CLI could not be installed in the demo project");

  const appPath = resolve(projectRoot, "src/App.tsx");
  const before = readFileSync(appPath, "utf8");
  writeFileSync(resolve(artifactRoot, "before.tsx"), before, "utf8");

  const discovery = runCli(["discover"], 0);
  assert.match(discovery.stdout, /2 component candidate\(s\) found in 4 file\(s\)/);

  const firstScan = runCli(["scan"], 1);
  assert.equal((firstScan.stdout.match(/\[CV006\]/g) ?? []).length, 3);

  runCli(["report", "--output", "component-vault-report.json"], 0);
  const reportPath = resolve(projectRoot, "component-vault-report.json");
  const report = JSON.parse(readFileSync(reportPath, "utf8"));
  assert.equal(report.engine, "typescript-ast+semantic");
  assert.equal(report.summary.new, 3);
  assert.equal(report.summary.blocking, 3);
  cpSync(reportPath, resolve(artifactRoot, "component-vault-report.json"));

  runCli(["fix", "--dry-run"], 0);
  assert.equal(readFileSync(appPath, "utf8"), before, "Dry-run changed the source file");

  const fixed = runCli(["fix"], 0);
  assert.match(fixed.stdout, /8 edit\(s\) in 1 file\(s\)/);
  const after = readFileSync(appPath, "utf8");
  assert.notEqual(after, before, "The safe fix did not update the source file");
  assert.match(after, /import \{ Text \}/);
  assert.match(after, /import \{ Button \}/);
  assert.match(after, /<Text\.H1>/);
  assert.match(after, /<Text\.Paragraph>/);
  assert.match(after, /<Button type="button">/);
  writeFileSync(resolve(artifactRoot, "after.tsx"), after, "utf8");

  const cleanScan = runCli(["scan"], 0);
  assert.match(cleanScan.stdout, /no new semantic violations/);

  const build = run(npmCommand, ["run", "build"], { cwd: projectRoot, label: "npm run build" });
  assert.equal(build.status, 0, "The fixed React/Vite project did not build");

  record("\nPROOF PASSED");
  record("discover=2 candidates · scan=3 blocking CV006 · dry-run=no writes · fix=8 edits · rescan=clean · build=green");
  writeFileSync(resolve(artifactRoot, "transcript.txt"), `${transcript.join("\n")}\n`, "utf8");
} catch (error) {
  record(`\nPROOF FAILED: ${error instanceof Error ? error.message : String(error)}`);
  writeFileSync(resolve(artifactRoot, "transcript.txt"), `${transcript.join("\n")}\n`, "utf8");
  process.exitCode = 1;
} finally {
  rmSync(workRoot, { recursive: true, force: true });
}
