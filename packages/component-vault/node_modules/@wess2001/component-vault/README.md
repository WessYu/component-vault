# component-vault

AST-based design-system governance for developers, CI pipelines and AI coding agents.

## Quick start

```bash
npx component-vault init
npx component-vault scan
```

For an existing codebase, capture the current debt once:

```bash
npx component-vault baseline
```

Then gate changes locally or in CI:

```bash
npx component-vault check --base origin/master
npx component-vault pr --base origin/master
```

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
init [--ci] [--force]  initialize governance files
doctor                 validate setup
scan                   scan TypeScript/JavaScript AST
check --base REF       enforce protect/touched/full strategies
baseline               capture accepted legacy debt
report                  write full JSON migration report
pr --base REF          create PR summary and fail when blocked
context                 export rules for coding agents
explain CV001           explain a rule
```

## Configuration

```yaml
version: 1

scan:
  include: [src]
  exclude: [node_modules, .next, dist, build, coverage, .git]
  extensions: [.ts, .tsx, .js, .jsx]

components:
  Text:
    source: src/components/ui/text.tsx
    allowedImportFiles: [src/components/ui/text.tsx]
    forbiddenImports: [tamagui, "@radix-ui/themes"]
    forbiddenProps: [fontSize, lineHeight, fontWeight]
    strategy: touched
    rawElements:
      h1: H1
      h2: H2
      p: Paragraph
      small: Caption
```

Strategies:

- `protect`: allow baseline debt and block newly introduced violations.
- `touched`: require governed violations to be fixed when a file is changed.
- `full`: block every governed violation.

## Rules

- `CV001`: forbidden direct import of a governed component.
- `CV002`: protected visual prop override.
- `CV003`: raw semantic JSX where a governed variant exists.
- `CV004`: repeated static class combination.

## PR output

`component-vault pr` writes `.component-vault/pr-summary.md` by default and also appends the same Markdown to `GITHUB_STEP_SUMMARY` when running in GitHub Actions.

Example:

```text
Component Vault Guard PR · allowed
Migration 24% · 118 legacy · 0 new · 38 resolved · 0 blocking
```

## Repository

The CLI is developed inside the Component Vault repository:

https://github.com/WessYu/component-vault
