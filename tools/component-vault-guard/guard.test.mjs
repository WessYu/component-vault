import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import test from "node:test";

const cli = fileURLToPath(new URL("./cli.mjs", import.meta.url));

function writeFixture(root) {
  mkdirSync(join(root, "src/components/ui"), { recursive: true });
  mkdirSync(join(root, "src/pages"), { recursive: true });
  writeFileSync(join(root, "component-vault.yaml"), `version: 1
scan:
  include: [src]
  exclude: [node_modules, .git]
  extensions: [.ts, .tsx]
duplicates:
  enabled: false
components:
  Text:
    source: src/components/ui/text.tsx
    allowedImportFiles: [src/components/ui/text.tsx]
    forbiddenImports: [tamagui]
    forbiddenProps: [fontSize]
    strategy: touched
    rawElements:
      h1: H1
      p: Paragraph
    variants:
      H1: Main title
      Paragraph: Body copy
`);
  writeFileSync(join(root, "src/components/ui/text.tsx"), `export const Text = { H1: (p) => <h1 {...p} />, Paragraph: (p) => <p {...p} /> };\n`);
  writeFileSync(join(root, "src/pages/good.tsx"), `import { Text } from "../components/ui/text"; export const Good = () => <Text.H1>Good</Text.H1>;\n`);
}

function run(root, args, env = {}) {
  return spawnSync(process.execPath, [cli, ...args], { cwd: root, encoding: "utf8", env: { ...process.env, ...env } });
}

function initGit(root) {
  execFileSync("git", ["init"], { cwd: root, stdio: "ignore" });
  execFileSync("git", ["config", "user.email", "guard@example.com"], { cwd: root });
  execFileSync("git", ["config", "user.name", "Guard Test"], { cwd: root });
  execFileSync("git", ["add", "."], { cwd: root });
  execFileSync("git", ["commit", "-m", "base"], { cwd: root, stdio: "ignore" });
}

test("AST scan ignores raw HTML stored inside strings", () => {
  const root = mkdtempSync(join(tmpdir(), "cv-guard-"));
  writeFixture(root);
  writeFileSync(join(root, "src/pages/example.tsx"), `export const html = '<p>demo only</p>'; export const code = \`<h1>snippet</h1>\`;\n`);
  const result = run(root, ["scan"]);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  assert.doesNotMatch(result.stdout, /example\.tsx/);
});

test("AST scan detects actual JSX and supports ignore directives", () => {
  const root = mkdtempSync(join(tmpdir(), "cv-guard-"));
  writeFixture(root);
  writeFileSync(join(root, "src/pages/bad.tsx"), `export const Bad = () => <h1>Real violation</h1>;\n`);
  writeFileSync(join(root, "src/pages/ignored.tsx"), `export const Allowed = () => (\n  // component-vault-ignore CV003\n  <p>Intentional raw HTML</p>\n);\n`);
  const result = run(root, ["scan"]);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  assert.match(result.stdout, /bad\.tsx/);
  assert.doesNotMatch(result.stdout, /ignored\.tsx/);
});

test("touched strategy blocks violations only in changed files", () => {
  const root = mkdtempSync(join(tmpdir(), "cv-guard-"));
  writeFixture(root);
  writeFileSync(join(root, "src/pages/legacy.tsx"), `export const Legacy = () => <p>Legacy</p>;\n`);
  initGit(root);
  writeFileSync(join(root, "src/pages/good.tsx"), `export const Bad = () => <h1>Changed violation</h1>;\n`);
  execFileSync("git", ["add", "src/pages/good.tsx"], { cwd: root });
  execFileSync("git", ["commit", "-m", "change touched file"], { cwd: root, stdio: "ignore" });
  const result = run(root, ["check", "--base", "HEAD~1"]);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /1 blocking violation/);
  assert.match(result.stdout, /good\.tsx/);
});

test("baseline report separates legacy, resolved and new findings", () => {
  const root = mkdtempSync(join(tmpdir(), "cv-guard-"));
  writeFixture(root);
  writeFileSync(join(root, "src/pages/legacy-a.tsx"), `export const A = () => <p>A</p>;\n`);
  writeFileSync(join(root, "src/pages/legacy-b.tsx"), `export const B = () => <p>B</p>;\n`);
  let result = run(root, ["baseline"]);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  writeFileSync(join(root, "src/pages/legacy-a.tsx"), `import { Text } from "../components/ui/text"; export const A = () => <Text.Paragraph>A</Text.Paragraph>;\n`);
  writeFileSync(join(root, "src/pages/new.tsx"), `export const New = () => <h1>New</h1>;\n`);
  result = run(root, ["report", "--output", "public/report.json"]);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  const report = JSON.parse(readFileSync(join(root, "public/report.json"), "utf8"));
  assert.equal(report.engine, "typescript-ast");
  assert.equal(report.summary.legacy, 1);
  assert.equal(report.summary.resolved, 1);
  assert.equal(report.summary.new, 1);
  assert.equal(report.summary.migrationProgress, 50);
});

test("alias imports from forbidden libraries are detected", () => {
  const root = mkdtempSync(join(tmpdir(), "cv-guard-"));
  writeFixture(root);
  writeFileSync(join(root, "src/pages/import.tsx"), `import { Text as Typography } from "tamagui"; export const X = () => <Typography>Hello</Typography>;\n`);
  const result = run(root, ["scan"]);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  assert.match(result.stdout, /CV001/);
});

test("init creates a five-minute starter setup and doctor validates it", () => {
  const root = mkdtempSync(join(tmpdir(), "cv-guard-init-"));
  mkdirSync(join(root, "src"), { recursive: true });
  let result = run(root, ["init", "--ci"]);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  assert.ok(existsSync(join(root, "component-vault.yaml")));
  assert.ok(existsSync(join(root, "component-vault.baseline.json")));
  assert.ok(existsSync(join(root, ".component-vault/README.md")));
  assert.ok(existsSync(join(root, ".github/workflows/component-vault-guard.yml")));
  const config = readFileSync(join(root, "component-vault.yaml"), "utf8");
  assert.match(config, /components: \{\}/);
  assert.doesNotMatch(config, /src\/components\/ui\/text\.tsx/);
  const workflow = readFileSync(join(root, ".github/workflows/component-vault-guard.yml"), "utf8");
  assert.match(workflow, /actions\/checkout@v6/);
  assert.match(workflow, /actions\/setup-node@v6/);
  assert.match(workflow, /node-version: 24/);
  assert.match(workflow, /@wess2001\/component-vault@latest/);
  initGit(root);
  result = run(root, ["doctor"]);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  assert.match(result.stdout, /⚠ Governed components: none configured yet/);
  assert.match(result.stdout, /Guard setup is valid with 1 warning/);
  result = run(root, ["doctor", "--format", "json"]);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  const doctor = JSON.parse(result.stdout);
  assert.equal(doctor.ok, true);
  assert.equal(doctor.warnings, 1);
  assert.equal(doctor.checks.find((check) => check.label === "Governed components")?.status, "warning");
});

test("doctor reports a configured component whose source is missing", () => {
  const root = mkdtempSync(join(tmpdir(), "cv-guard-doctor-"));
  mkdirSync(join(root, "src"), { recursive: true });
  writeFileSync(join(root, "component-vault.yaml"), `version: 1
scan:
  include: [src]
components:
  Text:
    source: src/components/text.tsx
`);
  writeFileSync(join(root, "component-vault.baseline.json"), '{"version":2,"fingerprints":[],"violations":[]}\n');
  initGit(root);
  const result = run(root, ["doctor"]);
  assert.equal(result.status, 1, result.stderr + result.stdout);
  assert.match(result.stdout, /Component Text/);
  assert.match(result.stdout, /src\/components\/text\.tsx is missing/);
});

test("doctor detects a Git worktree from a nested project", () => {
  const root = mkdtempSync(join(tmpdir(), "cv-guard-monorepo-"));
  mkdirSync(join(root, "examples/app/src"), { recursive: true });
  writeFileSync(join(root, "examples/app/component-vault.yaml"), "version: 1\nscan:\n  include: [src]\ncomponents: {}\n");
  writeFileSync(join(root, "examples/app/component-vault.baseline.json"), '{"version":2,"fingerprints":[],"violations":[]}\n');
  initGit(root);
  const result = run(join(root, "examples/app"), ["doctor"]);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  assert.match(result.stdout, /✓ Git repository: detected/);
});

test("pr command writes a concise summary and fails on blocking drift", () => {
  const root = mkdtempSync(join(tmpdir(), "cv-guard-pr-"));
  writeFixture(root);
  writeFileSync(join(root, "src/pages/legacy.tsx"), `export const Legacy = () => <p>Legacy</p>;\n`);
  let result = run(root, ["baseline"]);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  initGit(root);
  writeFileSync(join(root, "src/pages/good.tsx"), `export const Changed = () => <h1>New drift</h1>;\n`);
  execFileSync("git", ["add", "src/pages/good.tsx"], { cwd: root });
  execFileSync("git", ["commit", "-m", "introduce drift"], { cwd: root, stdio: "ignore" });
  result = run(root, ["pr", "--base", "HEAD~1"]);
  assert.equal(result.status, 1, result.stderr + result.stdout);
  assert.match(result.stdout, /PR · blocked/);
  const summary = readFileSync(join(root, ".component-vault/pr-summary.md"), "utf8");
  assert.match(summary, /blocked this PR/);
  assert.match(summary, /\| Blocking \| 1 \|/);
});
