# Component Vault

AST-based **semantic design-system governance** for developers, CI pipelines and AI coding agents.

Component Vault started as a configurable AST guard for Design System rules. Version `0.6.0` adds deterministic component discovery, structured CLI output and safer real-project onboarding to the semantic governance and autofix engine.

## Quick start

```bash
npm install -D @wess2001/component-vault
npx component-vault init
npx component-vault discover
npx component-vault discover --write
npx component-vault doctor
npx component-vault analyze
npx component-vault scan
```

`init` only preconfigures a `Text` component when a supported source file actually exists. Otherwise it creates an honest `components: {}` starter; add your real governed components, then run `doctor` to validate every configured source path.

`discover` finds proven named/default React exports, compound variants, semantic root elements and TypeScript path aliases. The default mode is a non-writing preview. `--write` merges only new candidates and preserves every existing component policy.

## Programmatic API

Use the Guard inside build scripts, codemods or custom CI checks:

```js
import { defineConfig, scanProject } from "@wess2001/component-vault";

const config = defineConfig({
  version: 1,
  scan: { include: ["src"] },
  components: {},
});

const result = scanProject({ root: process.cwd(), config });
console.log(result.findings);
```

Available exports:

- `defineConfig(config)` validates and normalizes an in-memory policy.
- `scanProject(options)` returns structured AST and semantic findings.
- `analyzeProject(options)` returns semantic coverage and facts.
- `fixProject(options)` previews safe edits by default; set `dryRun: false` to write them.

For an existing codebase, capture current debt once:

```bash
npx component-vault baseline
```

Then gate changes locally or in CI:

```bash
npx component-vault check --base origin/master
npx component-vault pr --base origin/master
```

## Autofix

Version `0.5.0` adds import-safe deterministic autofix for supported governance and semantic findings.

Preview changes without modifying files:

```bash
npx component-vault fix --dry-run
```

Apply supported fixes:

```bash
npx component-vault fix
```

The Guard resolves configured semantic mappings from `component-vault.yaml` and can replace native semantic elements with their configured governed components. For example, a configured `<button>` → `Button` mapping can be applied automatically.

The autofix is intentionally conservative: it verifies the configured component export, adds the required import and preserves existing aliases. Findings without a provable target and import are reported as skipped with the exact missing-source, missing-export or binding-conflict reason.

For projects that use path aliases or barrel exports, declare the import explicitly:

```yaml
components:
  Text:
    source: src/components/ui/text.tsx
    import:
      from: "@/components/ui/text"
      kind: named
      name: Text
    rawElements:
      h1: H1
```

A recommended workflow is:

```text
scan / analyze
      ↓
fix --dry-run
      ↓
review proposed replacements
      ↓
fix
      ↓
scan again
```

## Semantic governance

The semantic layer separates three concerns:

```text
TypeScript / JSX AST
        ↓
Semantic facts
        ↓
Governance policies
        ↓
Findings / Fixes / CI / PR output
```

This means a policy can describe a semantic role such as `heading` instead of being permanently coupled to `<h1>`.

Example:

```yaml
version: 1

semantics:
  strict: false
  elements:
    h1:
      role: heading
      level: 1
    h2:
      role: heading
      level: 2
    p:
      role: body-text
    small:
      role: caption
    button:
      role: button
    a:
      role: link

  components:
    Typography:
      roles:
        heading:
          variants:
            h1:
              level: 1
            h2:
              level: 2
```

Now the Guard can reason about:

```text
<h1>
  ↓
role = heading
level = 1
  ↓
Typography is configured for heading/1
  ↓
CV006
```

The important part is that the semantic role belongs to the **project policy**, not to the Component Vault implementation.

### Component mappings

Existing component rules can opt into semantic roles:

```yaml
components:
  Text:
    source: src/components/ui/text.tsx
    semanticRole: typography
    forbiddenProps: [fontSize, lineHeight, fontWeight]
```

Or use the dedicated semantic map:

```yaml
semantics:
  components:
    Text:
      roles:
        typography: {}
```

This allows different Design Systems to use different component names while sharing the same semantic vocabulary.

## Analyze a project

Use `analyze` before changing policies:

```bash
npx component-vault analyze
```

The report shows the semantic coverage discovered by the Guard:

```text
Component Vault Semantic Analysis

Role                 Native   Governed   Findings
────────────────────────────────────────────────────
heading                   23         19          4
body-text                 17          0          0
button                     8         31          0

Files analyzed: 42
Semantic findings: 4
```

This makes the semantic model observable and helps identify false positives, unmapped roles and migration opportunities before enabling strict enforcement.

## Semantic rule: CV006

`CV006` reports a native semantic element when the project's configuration says that role should be governed by a component.

Example:

```text
[CV006] Semantic element requires governed component
src/components/Hero.tsx:12:5
  <h1> is mapped to semantic role 'heading' and a governed component is available.
  → Use the project's governed Typography component for 'heading'.
```

The rule is deterministic: it uses the TypeScript AST and the repository's YAML policy. It does not require an AI model to decide whether CI should pass or fail.

## Explain semantic findings

```bash
npx component-vault explain CV006
```

The explanation includes the element, semantic role, level and configured governed components.

## Baselines

`baseline` captures existing debt so teams can adopt governance without having to rewrite an entire codebase first.

Component Vault `0.4` also keeps a semantic baseline at:

```text
.component-vault/semantic-baseline.json
```

New semantic violations remain visible and can block `check`/`pr`, while accepted legacy findings remain part of the migration path.

## Initialize GitHub Actions too

```bash
npx component-vault init --ci
```

This creates:

- `component-vault.yaml`
- `component-vault.baseline.json`
- `.component-vault/README.md`
- `.github/workflows/component-vault-guard.yml` when `--ci` is used

## Commands

```text
init [--ci] [--force]  initialize governance and semantic mappings
discover [--write]     detect exports and safely merge new component definitions
doctor [--format json] validate setup with pass, warning and failure states
scan [--format json]   scan AST and semantic roles
check --base REF       enforce protect/touched/full + semantic policies
fix [--dry-run]        automatically fix supported findings
baseline               capture accepted legacy debt
report --output FILE   write full JSON migration report
pr --base REF          create PR summary and fail when blocked
context                export rules for coding agents
analyze                inspect semantic roles and coverage
explain CV001          explain a rule
explain CV006          explain a semantic finding
```

`scan`, `doctor` and `discover` support `--format json` for deterministic CI, editor and build-tool integration.

## Existing AST rules

The semantic layer complements the original configurable rules:

- `CV001`: forbidden direct import of a governed component.
- `CV002`: protected visual prop override.
- `CV003`: raw semantic JSX where a governed variant exists.
- `CV004`: repeated static class combination.
- `CV005`: configurable forbidden pattern.
- `CV006`: semantic role requires a governed component.

## Strategies

- `protect`: allow baseline debt and block newly introduced violations.
- `touched`: require governed violations to be fixed when a file is changed.
- `full`: block every governed violation.

## Design principles

### Deterministic core

The enforcement and autofix engine is AST + YAML driven. AI can help developers understand or author policies, but the CI decision and supported code transformations remain deterministic.

### Repository-owned semantics

Component Vault does not assume that every Design System calls its typography component `Text`, `Typography` or `Heading`. The repository defines its own semantic mappings.

### Conservative autofix

`fix` only applies replacements when the Guard can resolve a configured governed target. It does not guess which component should replace an element.

### Migration instead of rewrite

Baselines make it possible to introduce governance into an existing codebase without requiring a one-shot rewrite.

### Observable analysis

`analyze` exposes the semantic model so teams can see what the Guard believes before enabling stricter policies.

## PR output

`component-vault pr` writes `.component-vault/pr-summary.md` by default and also appends the same Markdown to `GITHUB_STEP_SUMMARY` when running in GitHub Actions.

Example:

```text
Component Vault Guard PR · allowed
Migration 24% · 118 legacy · 0 new · 38 resolved · 0 blocking
```

## Package

```bash
npm install -D @wess2001/component-vault
```

The package is published as `@wess2001/component-vault`.

## Repository

The CLI is developed inside the Component Vault repository:

https://github.com/WessYu/component-vault
