import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";

const cli = new URL("./cli.mjs", import.meta.url).pathname;

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

function run(root, args) {
  return spawnSync(process.execPath, [cli, ...args], { cwd: root, encoding: "utf8" });
}

function initGit(root) {
  execFileSync("git", ["init"], { cwd: root });
  execFileSync("git", ["config", "user.email", "guard@example.com"], { cwd: root });
  execFileSync("git", ["config", "user.name", "Guard Test"], { cwd: root });
  execFileSync("git", ["add", "."], { cwd: root });
  execFileSync("git", ["commit", "-m", "base"], { cwd: root, stdio: "ignore" });
}

test("check passes when a touched file follows the governed component", () => {
  const root = mkdtempSync(join(tmpdir(), "cv-guard-"));
  writeFixture(root);
  initGit(root);
  writeFileSync(join(root, "src/pages/good.tsx"), `import { Text } from "../components/ui/text"; export const Good = () => <Text.H1>Updated</Text.H1>;\n`);
  const result = run(root, ["check", "--base", "HEAD~1"]);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  assert.match(result.stdout, /Guard passed/);
});

test("touched strategy blocks raw elements in changed files", () => {
  const root = mkdtempSync(join(tmpdir(), "cv-guard-"));
  writeFixture(root);
  initGit(root);
  writeFileSync(join(root, "src/pages/good.tsx"), `export const Bad = () => <h1>Duplicated title</h1>;\n`);
  const result = run(root, ["check", "--base", "HEAD~1"]);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /CV003/);
  assert.match(result.stdout, /Text\.H1/);
});

test("baseline accepts protect-mode legacy but not new violations", () => {
  const root = mkdtempSync(join(tmpdir(), "cv-guard-"));
  writeFixture(root);
  const configPath = join(root, "component-vault.yaml");
  writeFileSync(configPath, readFileSync(configPath, "utf8").replace("strategy: touched", "strategy: protect"));
  writeFileSync(join(root, "src/pages/legacy.tsx"), `export const Legacy = () => <p>Legacy</p>;\n`);
  let result = run(root, ["baseline"]);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  result = run(root, ["check"]);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  writeFileSync(join(root, "src/pages/new.tsx"), `export const New = () => <h1>New</h1>;\n`);
  result = run(root, ["check"]);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /blocking violation/);
});

test("report and context generate machine-readable artifacts", () => {
  const root = mkdtempSync(join(tmpdir(), "cv-guard-"));
  writeFixture(root);
  writeFileSync(join(root, "src/pages/legacy.tsx"), `export const Legacy = () => <p>Legacy body</p>;\n`);
  let result = run(root, ["report", "--output", "public/report.json"]);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  const report = JSON.parse(readFileSync(join(root, "public/report.json"), "utf8"));
  assert.equal(report.version, 1);
  assert.equal(typeof report.summary.score, "number");
  assert.equal(report.summary.errors, 1);
  assert.equal(report.summary.blocking, 0);
  result = run(root, ["context"]);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  assert.match(readFileSync(join(root, ".component-vault/AGENTS.md"), "utf8"), /Text\.Paragraph/);
});
