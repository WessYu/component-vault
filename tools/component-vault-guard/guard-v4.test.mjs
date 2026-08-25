import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";

const cli = fileURLToPath(new URL("./cli-v4.mjs", import.meta.url));

function fixture(componentSource = "export const Text = { H1: (props) => <h1 {...props} />, Paragraph: (props) => <p {...props} /> };\n") {
  const root = mkdtempSync(join(tmpdir(), "cv-v4-"));
  mkdirSync(join(root, "src/components"), { recursive: true });
  mkdirSync(join(root, "src/pages"), { recursive: true });
  writeFileSync(join(root, "component-vault.yaml"), `version: 1
scan:
  include: [src]
  exclude: [node_modules, .git]
  extensions: [.ts, .tsx]
duplicates:
  enabled: false
rules:
  forbiddenPatterns: []
  fixes:
    token:
      pattern: 'legacy-(\\w+)'
      replace: 'token-$1'
components:
  Text:
    source: src/components/text.tsx
    allowedImportFiles: [src/components/text.tsx]
    rawElements:
      h1: H1
      p: Paragraph
semantics:
  elements:
    h1: { role: heading, level: 1 }
    p: { role: body-text }
`);
  writeFileSync(join(root, "src/components/text.tsx"), componentSource);
  return root;
}

function run(root, args) {
  return spawnSync(process.execPath, [cli, ...args], { cwd: root, encoding: "utf8" });
}

test("v4 init forwards CI options and creates an honest starter", () => {
  const root = mkdtempSync(join(tmpdir(), "cv-v4-init-"));
  mkdirSync(join(root, "src"), { recursive: true });
  const result = run(root, ["init", "--ci"]);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  const config = readFileSync(join(root, "component-vault.yaml"), "utf8");
  assert.match(config, /components: \{\}/);
  assert.doesNotMatch(config, /src\/components\/ui\/text\.tsx/);
  const workflowPath = join(root, ".github/workflows/component-vault-guard.yml");
  assert.ok(existsSync(workflowPath));
  assert.match(readFileSync(workflowPath, "utf8"), /@wess2001\/component-vault@latest/);
  writeFileSync(join(root, "component-vault.yaml"), "version: 1\ncomponents:\n  Fake:\n    source: missing.tsx\n");
  const forced = run(root, ["init", "--force"]);
  assert.equal(forced.status, 0, forced.stderr + forced.stdout);
  assert.doesNotMatch(readFileSync(join(root, "component-vault.yaml"), "utf8"), /Fake/);
});

test("v4 discover previews and safely writes proven components and aliases", () => {
  const root = mkdtempSync(join(tmpdir(), "cv-v4-discover-"));
  mkdirSync(join(root, "src/components/ui"), { recursive: true });
  mkdirSync(join(root, "src/pages"), { recursive: true });
  let result = run(root, ["init"]);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  writeFileSync(
    join(root, "src/components/ui/text.tsx"),
    `export const Text = { H1: (props) => <h1 {...props} />, Paragraph: (props) => <p {...props} /> };\n`,
  );
  writeFileSync(join(root, "src/components/ui/button.tsx"), `export function Button(props) { return <button {...props} />; }\n`);
  writeFileSync(
    join(root, "src/pages/page.tsx"),
    `import { Text } from "@/components/ui/text";\nexport const Page = () => <Text.H1>Page</Text.H1>;\n`,
  );
  writeFileSync(join(root, "tsconfig.json"), `{"compilerOptions":{"baseUrl":".","paths":{"@/*":["src/*"]}}}\n`);

  const before = readFileSync(join(root, "component-vault.yaml"), "utf8");
  result = run(root, ["discover"]);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  assert.match(result.stdout, /Text — src\/components\/ui\/text\.tsx/);
  assert.match(result.stdout, /Button — src\/components\/ui\/button\.tsx/);
  assert.match(result.stdout, /Import: @\/components\/ui\/text/);
  assert.equal(readFileSync(join(root, "component-vault.yaml"), "utf8"), before);

  const jsonResult = run(root, ["discover", "--format", "json"]);
  assert.equal(jsonResult.status, 0, jsonResult.stderr + jsonResult.stdout);
  const preview = JSON.parse(jsonResult.stdout);
  assert.equal(preview.dryRun, true);
  assert.equal(preview.components.length, 2);
  assert.equal(preview.components.find((component) => component.name === "Text")?.definition.import.from, "@/components/ui/text");
  assert.equal(preview.components.find((component) => component.name === "Button")?.definition.import, undefined);

  result = run(root, ["discover", "--write"]);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  const config = readFileSync(join(root, "component-vault.yaml"), "utf8");
  assert.match(config, /Text:/);
  assert.match(config, /Button:/);
  assert.match(config, /from: "@\/components\/ui\/text"/);
  assert.match(config, /semanticRole: button/);

  const git = spawnSync("git", ["init"], { cwd: root, encoding: "utf8" });
  assert.equal(git.status, 0, git.stderr + git.stdout);
  result = run(root, ["doctor"]);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  assert.doesNotMatch(result.stdout, /⚠ Governed components/);
});

test("v4 fix adds a proven import and preserves complex UTF-8 JSX", () => {
  const root = fixture();
  const file = join(root, "src/pages/page.tsx");
  const source = `export function Page({ user }) {
  return (
    <main className="legacy-title">
      <h1 data-name={user?.name ?? "Visitante"}>Título: {user?.name}</h1>
      <p>Olá, <strong>{user?.name ?? "mundo"}</strong>.</p>
    </main>
  );
}
`;
  writeFileSync(file, Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(source)]));

  const result = run(root, ["fix"]);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  const bytes = readFileSync(file);
  assert.deepEqual([...bytes.subarray(0, 3)], [0xef, 0xbb, 0xbf]);
  const updated = bytes.subarray(3).toString("utf8");
  assert.match(updated, /import \{ Text \} from "\.\.\/components\/text";/);
  assert.match(updated, /<Text\.H1 data-name=\{user\?\.name \?\? "Visitante"\}>Título: \{user\?\.name\}<\/Text\.H1>/);
  assert.match(updated, /<Text\.Paragraph>Olá, <strong>\{user\?\.name \?\? "mundo"\}<\/strong>\.<\/Text\.Paragraph>/);
  assert.match(updated, /className="token-title"/);
  assert.doesNotMatch(updated, /ï»¿|TÃ­tulo|OlÃ¡/);
});

test("v4 fix reuses an aliased import", () => {
  const root = fixture();
  const file = join(root, "src/pages/alias.tsx");
  writeFileSync(file, `import { Text as Typography } from "../components/text";\nexport const Page = () => <h1>Alias</h1>;\n`);
  const result = run(root, ["fix"]);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  const updated = readFileSync(file, "utf8");
  assert.match(updated, /<Typography\.H1>Alias<\/Typography\.H1>/);
  assert.equal((updated.match(/from "\.\.\/components\/text"/g) ?? []).length, 1);
});

test("v4 fix refuses a conflicting local component binding", () => {
  const root = fixture();
  const file = join(root, "src/pages/conflict.tsx");
  const source = `import { Text } from "somewhere-else";\nexport const Page = () => <h1>Conflict</h1>;\n`;
  writeFileSync(file, source);
  const result = run(root, ["fix"]);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  assert.equal(readFileSync(file, "utf8"), source);
  assert.match(result.stdout, /Skipped 1 semantic occurrence/);
  assert.match(result.stdout, /top-level binding named Text conflicts/);
});

test("v4 dry-run and check never write files", () => {
  for (const [flag, expectedStatus] of [["--dry-run", 0], ["--check", 1]]) {
    const root = fixture();
    const file = join(root, "src/pages/preview.tsx");
    const source = `export const Page = () => <h1>Prévia</h1>;\n`;
    writeFileSync(file, source);
    const result = run(root, ["fix", flag]);
    assert.equal(result.status, expectedStatus, result.stderr + result.stdout);
    assert.equal(readFileSync(file, "utf8"), source);
    assert.match(result.stdout, /Would fix/);
  }
});

test("v4 fix skips JSX when the component export cannot be proven", () => {
  const root = fixture("export const SomethingElse = {};\n");
  const file = join(root, "src/pages/unsafe.tsx");
  const source = `export const Page = () => <h1>Não alterar</h1>;\n`;
  writeFileSync(file, source);
  const result = run(root, ["fix"]);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  assert.equal(readFileSync(file, "utf8"), source);
  assert.match(result.stdout, /Skipped 1 semantic occurrence/);
  assert.match(result.stdout, /does not export Text/);
});

test("v4 scan and analyze execute the semantic engine", () => {
  const root = fixture();
  writeFileSync(join(root, "src/pages/bad.tsx"), `export const Page = () => <h1>Finding</h1>;\n`);
  const scan = run(root, ["scan"]);
  assert.equal(scan.status, 1, scan.stderr + scan.stdout);
  assert.equal((scan.stdout.match(/\[CV003\]/g) ?? []).length, 0);
  assert.equal((scan.stdout.match(/\[CV006\]/g) ?? []).length, 1);
  const jsonScan = run(root, ["scan", "--format", "json"]);
  assert.equal(jsonScan.status, 1, jsonScan.stderr + jsonScan.stdout);
  const payload = JSON.parse(jsonScan.stdout);
  assert.equal(payload.ok, false);
  assert.equal(payload.summary.total, 1);
  assert.equal(payload.summary.byRule.CV006, 1);
  const analysis = run(root, ["analyze"]);
  assert.equal(analysis.status, 0, analysis.stderr + analysis.stdout);
  assert.match(analysis.stdout, /Semantic findings: 1/);
});

test("v4 semantic scan honors legacy CV003 ignore comments", () => {
  const root = fixture();
  writeFileSync(
    join(root, "src/pages/ignored.tsx"),
    `export const Page = () => (\n  // component-vault-ignore CV003\n  <h1>Intentional exception</h1>\n);\n`,
  );
  const scan = run(root, ["scan"]);
  assert.equal(scan.status, 0, scan.stderr + scan.stdout);
  assert.doesNotMatch(scan.stdout, /ignored\.tsx/);
});
