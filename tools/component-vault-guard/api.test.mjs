import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { analyzeProject, defineConfig, fixProject, scanProject } from "./api.mjs";

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "cv-api-"));
  mkdirSync(join(root, "src/components"), { recursive: true });
  mkdirSync(join(root, "src/pages"), { recursive: true });
  writeFileSync(join(root, "src/components/text.tsx"), `export const Text = { H1: (props) => <h1 {...props} /> };\n`);
  const file = join(root, "src/pages/page.tsx");
  writeFileSync(file, `export const Page = () => <h1>API</h1>;\n`);
  const config = defineConfig({
    version: 1,
    scan: { include: ["src"], exclude: ["node_modules", ".git"], extensions: [".ts", ".tsx"] },
    duplicates: { enabled: false },
    rules: { forbiddenPatterns: [], fixes: {} },
    components: {
      Text: {
        source: "src/components/text.tsx",
        allowedImportFiles: ["src/components/text.tsx"],
        rawElements: { h1: "H1" },
      },
    },
    semantics: { elements: { h1: { role: "heading", level: 1 } } },
  });
  return { root, file, config };
}

test("public API scans and analyzes without invoking the CLI", () => {
  const { root, config } = fixture();
  const result = scanProject({ root, config });
  assert.equal(result.engine, "typescript-ast");
  assert.equal(result.summary.filesScanned, 2);
  assert.equal(result.findings.filter((finding) => finding.rule === "CV003").length, 0);
  assert.equal(result.findings.filter((finding) => finding.rule === "CV006").length, 1);
  const analysis = analyzeProject({ root, config });
  assert.equal(analysis.findings.length, 1);
});

test("public API defaults to dry-run and can apply a safe fix", () => {
  const { root, file, config } = fixture();
  const original = readFileSync(file, "utf8");
  const preview = fixProject({ root, config });
  assert.equal(preview.dryRun, true);
  assert.ok(preview.edits > 0);
  assert.equal(readFileSync(file, "utf8"), original);

  const applied = fixProject({ root, config, dryRun: false });
  assert.equal(applied.dryRun, false);
  assert.match(readFileSync(file, "utf8"), /<Text\.H1>API<\/Text\.H1>/);
});
