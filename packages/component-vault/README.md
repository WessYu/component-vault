# component-vault

AST-based design-system governance for developers, CI pipelines and AI coding agents.

Component Vault treats the design system as a policy boundary: TypeScript/JavaScript is parsed with the TypeScript AST, project rules stay in YAML, and the Guard produces deterministic findings for local development and CI.

## What's new in 0.4.0

The Guard now has a semantic analysis layer. Instead of treating every native element as an isolated rule, Component Vault can normalize JSX into semantic roles such as `heading/1`, `body-text`, `button`, `link` and `input`.

This gives projects a stable vocabulary that is independent from a particular component name. A design system can map its own `Text.H1`, `Typography.H1`, `Heading level={1}` or another implementation to the same semantic role.

## Quick start

```bash
npx component-vault init
npx component-vault analyze
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

## Semantic analysis

Run:

```bash
npx component-vault analyze
```

Or save the machine-readable model:

```bash
npx component-vault analyze --output .component-vault/semantic.json
```

The analyzer reports:

- files and JSX nodes scanned;
- native semantic elements detected;
- governed component variants detected;
- semantic roles and heading levels;
- local components that can be inferred from semantic JSX wrappers;
- JSX that is not mapped to a semantic role yet.

Example:

```text
Component Vault Semantic Analysis
=================================

Files scanned: 14
JSX nodes: 182
Semantic nodes: 164
Native semantic nodes: 37
Governed component nodes: 127
Unmapped nodes: 18

Semantic roles
--------------
body-text  total=62 native=11 governed=51
heading/1  total=18 native=4 governed=14
heading/2  total=24 native=6 governed=18
button  total=31 native=3 governed=28
link  total=29 native=8 governed=21
```

The important distinction is that `analyze` is diagnostic. It helps discover how a project is structured before policies are tightened. It does not use AI and does not block a build merely because a JSX node is unmapped.

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
analyze [--output]     build a semantic project model
scan                   scan TypeScript/JavaScript AST
check --base REF       enforce protect/touched/full strategies
baseline               capture accepted legacy debt
report                 write full JSON migration report
pr --base REF          create PR summary and fail when blocked
context                export rules for coding agents
explain CV001          explain a rule
```

## Configuration

```yaml
version: 1

scan:
  include: [src]
  exclude: [node_modules, .next, dist, build, coverage, .git]
  extensions: [.ts, .tsx, .js, .jsx]

semantics:
  elements:
    h1:
      role: heading
      level: 1
    h2:
      role: heading
      level: 2
    h3:
      role: heading
      level: 3
    p:
      role: body-text
    small:
      role: caption
    button:
      role: button
    a:
      role: link
    input:
      role: input

components:
  Typography:
    roles:
      heading: {}
    variants:
      H1:
        role: heading
        level: 1
      H2:
        role: heading
        level: 2

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

The `semantics` section describes what code means. The `components` section describes how a project's governed components implement those meanings. This separation is intentional: policies should not have to be hard-coded around one component library or naming convention.

Strategies:

- `protect`: allow baseline debt and block newly introduced violations.
- `touched`: require governed violations to be fixed when a file is changed.
- `full`: block every governed violation.

## Rules

- `CV001`: forbidden direct import of a governed component.
- `CV002`: protected visual prop override.
- `CV003`: raw semantic JSX where a governed variant exists.
- `CV004`: repeated static class combination.
- `CV005`: configurable forbidden pattern.

## Architecture

```text
TypeScript / JSX
      |
      v
 AST parser
      |
      +--------------------+
      |                    |
      v                    v
 raw findings       semantic normalizer
                           |
                           v
                    semantic model
                           |
                           v
                     policy engine
                           |
             +-------------+-------------+
             |             |             |
             v             v             v
            scan         check        analyze
```

The semantic layer is deterministic. AI can consume the exported model and explain findings, but the CI decision itself does not depend on an LLM call.

## PR output

`component-vault pr` writes `.component-vault/pr-summary.md` by default and also appends the same Markdown to `GITHUB_STEP_SUMMARY` when running in GitHub Actions.

Example:

```text
Component Vault Guard PR · allowed
Migration 24% · 118 legacy · 0 new · 38 resolved · 0 blocking
```

## Development

Run the semantic analyzer tests with Node's built-in test runner:

```bash
node --test tools/component-vault-guard/semantic.test.mjs
```

The analyzer is deliberately kept independent from the CLI so its semantic model can be reused by future reporting, agent context and policy features.

## Repository

The CLI is developed inside the Component Vault repository:

https://github.com/WessYu/component-vault
