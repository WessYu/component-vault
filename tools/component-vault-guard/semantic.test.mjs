import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { analyzeProject } from "./semantic.mjs";

test("maps native JSX to semantic roles and reports unmapped nodes", () => {
  const root = mkdtempSync(join(tmpdir(), "component-vault-semantic-"));
  try {
    mkdirSync(join(root, "src"), { recursive: true });
    writeFileSync(join(root, "src/App.tsx"), `export function App() { return <main><h1>Hello</h1><p>Body</p><section /></main>; }`);
    const report = analyzeProject(root, {
      scan: { include: ["src"], exclude: [], extensions: [".tsx"] },
      semantics: { elements: { h1: { role: "heading", level: 1 }, p: { role: "body-text" } } },
      components: {},
    });

    assert.equal(report.filesScanned, 1);
    assert.equal(report.semanticNodes, 2);
    assert.equal(report.nativeNodes, 2);
    assert.equal(report.governedNodes, 0);
    assert.equal(report.unmappedNodes, 2);
    assert.deepEqual(report.roles.map((role) => `${role.role}/${role.level ?? ""}`), ["body-text/", "heading/1"]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("recognizes governed component variants", () => {
  const root = mkdtempSync(join(tmpdir(), "component-vault-semantic-"));
  try {
    mkdirSync(join(root, "src"), { recursive: true });
    writeFileSync(join(root, "src/App.tsx"), `export function App() { return <Typography.H1>Hello</Typography.H1>; }`);
    const report = analyzeProject(root, {
      scan: { include: ["src"], exclude: [], extensions: [".tsx"] },
      semantics: { elements: {} },
      components: { Typography: { roles: { heading: {} }, variants: { H1: { role: "heading", level: 1 } } } },
    });

    assert.equal(report.semanticNodes, 1);
    assert.equal(report.governedNodes, 1);
    assert.equal(report.roles[0].role, "heading");
    assert.equal(report.roles[0].level, 1);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
