import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
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
});

test("v4 scan and analyze execute the semantic engine", () => {
  const root = fixture();
  writeFileSync(join(root, "src/pages/bad.tsx"), `export const Page = () => <h1>Finding</h1>;\n`);
  const scan = run(root, ["scan"]);
  assert.equal(scan.status, 1, scan.stderr + scan.stdout);
  assert.match(scan.stdout, /CV006/);
  const analysis = run(root, ["analyze"]);
  assert.equal(analysis.status, 0, analysis.stderr + analysis.stdout);
  assert.match(analysis.stdout, /Semantic findings: 1/);
});
