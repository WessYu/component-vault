# Component Vault

<p align="center">
  <a href="https://component-vault-dun.vercel.app/">
    <img src="https://raw.githubusercontent.com/WessYu/WESSYU-ARQUIVO/main/public/projects/component-vault/landing.svg" alt="Component Vault" width="100%" />
  </a>
</p>

<p align="center">
  <strong>Visual component workspace + AST-based design-system governance.</strong>
</p>

<p align="center">
  <a href="https://component-vault-dun.vercel.app/">Live Demo</a> ·
  <a href="https://www.npmjs.com/package/@wess2001/component-vault">npm CLI</a> ·
  <a href="https://github.com/WessYu/component-vault">GitHub</a> ·
  <a href="https://wessyu-arquivo.vercel.app/">Portfolio</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-111111?style=flat-square&logo=nextdotjs" />
  <img src="https://img.shields.io/badge/TypeScript-Compiler_API-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-111111?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/Convex-111111?style=flat-square" />
  <img src="https://img.shields.io/badge/Vercel-111111?style=flat-square&logo=vercel" />
</p>

## What is Component Vault?

Component Vault started as a personal component library and evolved into a full-stack workspace for creating, organizing, testing, editing and reusing interface components.

The project also contains **Component Vault Guard**: an AST-based governance engine that turns design-system conventions into executable rules for local development, CI and AI-assisted coding workflows.

The core idea is simple:

> **AI can generate code. The repository should still decide what is allowed.**

## Component Vault Guard

The Guard analyzes TypeScript, TSX, JavaScript and JSX through the **TypeScript Compiler API**. Instead of relying only on text searches, it works with the AST to inspect real imports, JSX elements and properties.

```text
Source Code
    │
    ▼
TypeScript / TSX AST
    │
    ├── Component rules
    ├── Import rules
    ├── Property rules
    ├── Semantic rules
    └── Custom forbidden patterns
    │
    ▼
Guard Engine
    │
    ├── Baseline
    ├── Migration strategy
    └── Finding classification
    │
    ▼
CLI / Report / CI
```

### Why build it?

Design-system drift usually happens gradually:

- a raw `<h1>` appears instead of the governed typography component;
- a component is imported directly from a dependency that should be hidden;
- a developer overrides a protected visual prop;
- the same static class combination gets copied across multiple files;
- an AI coding agent generates code that technically works but violates the project's UI contract.

Documentation and code review can catch some of this. The Guard makes the rules **machine-checkable and repeatable**.

## Rules

| Rule | What it catches |
| --- | --- |
| `CV001` | Direct imports of governed components from forbidden sources |
| `CV002` | Protected visual-property overrides |
| `CV003` | Raw semantic JSX where a governed variant exists |
| `CV004` | Repeated static class combinations |
| `CV005` | Configurable repository-specific forbidden patterns |

Example:

```tsx
<h1 style={{ fontSize: 32 }}>
  Título de teste
</h1>
```

can produce:

```text
[CV003] Raw semantic element
src/test.tsx:5:5
  Raw <h1> detected in governed JSX.
  → Use <Text.H1> instead.
```

## YAML is the source of truth

Governance rules live in `component-vault.yaml` rather than inside an AI agent or editor integration.

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

This keeps policy explicit, reviewable and independent from whichever AI tool or IDE is being used.

## Brownfield migration

Existing codebases should not have to fix every historical violation before adopting governance.

Component Vault Guard supports three enforcement strategies:

- **`protect`** — accept known baseline debt and block newly introduced violations;
- **`touched`** — require governed violations to be fixed when a legacy file is changed;
- **`full`** — block every governed violation.

```text
Legacy code
    │
    ▼
Baseline
    │
    ├── existing debt → accepted
    │
    └── touched file → migrate
                         │
                         ▼
                    full enforcement
```

The PR reporting model also tracks:

- **legacy** — already present in the baseline;
- **new** — introduced by the current change;
- **resolved** — previously known violations that were fixed;
- **blocking** — findings that prevent the gate from passing.

## CLI

The Guard is published on npm as `@wess2001/component-vault` and exposes the `component-vault` executable.

### Install

```bash
npm install -D @wess2001/component-vault
```

Or run it without adding it to your project:

```bash
npx @wess2001/component-vault@latest init
```

### Quick start

```bash
npx component-vault init
npx component-vault scan
```

For an existing project:

```bash
npx component-vault baseline
```

For CI:

```bash
npx component-vault init --ci
npx component-vault pr --base origin/master
```

### Commands

```text
init [--ci] [--force]     initialize governance files
doctor                    validate local setup
scan                      scan TypeScript/JavaScript AST
check --base REF          enforce governance strategies
baseline                  capture accepted legacy debt
report --output FILE      generate the full JSON migration report
pr --base REF             generate a PR summary and enforce the gate
context                   export agent-readable rules
explain CV001             explain a rule
```

## AI-assisted development

Component Vault Guard is deliberately **not an AI reviewer**.

The separation is intentional:

```text
AI coding agent
      │
      │ generates / edits
      ▼
Repository code
      │
      │ verified by
      ▼
Component Vault Guard
      │
      ├── allowed
      └── blocked
```

The agent can use `component-vault context` to understand project rules, but the final enforcement remains deterministic and repository-controlled.

## GitHub Actions

`component-vault init --ci` can create a workflow that runs the Guard on pull requests.

The intended workflow is:

```text
Developer / AI agent
        │
        ▼
component-vault check / pr
        │
        ▼
TypeScript AST analysis
        │
   ┌────┴────┐
   │         │
 allowed   violation
   │         │
   ▼         ▼
 CI pass   CI block
```

When running in GitHub Actions, the PR command can also append its Markdown summary to `GITHUB_STEP_SUMMARY`.

## Demo / brownfield example

`examples/messy-app` is a deliberately inconsistent project used to exercise the governance lifecycle:

```text
scan → baseline → change → PR gate → legacy/new/resolved/blocking
```

The project also validates the npm artifact by packaging the CLI, installing the generated `.tgz` in a separate test project and running the published command there. This checks the actual package contents rather than only the source tree.

## Project structure

```text
packages/component-vault/     Published npm CLI
 tools/component-vault-guard/  Guard engine + tests
 examples/messy-app/           Brownfield demonstration
 src/                          Component Vault application
```

## Application

The main Component Vault workspace includes:

- component creation, editing and deletion;
- live previews and responsive states;
- code, usage, accessibility and notes;
- search and command palette;
- favorites and personal collections;
- persistent workspace preferences;
- protected administration;
- Motion Experiences and reusable UI patterns;
- the Guard dashboard at `/vault/guard`;
- migration metrics, baseline debt and findings with file/line/column information.

## Stack

| Area | Technologies |
| --- | --- |
| Front-end | Next.js 16, React 19, TypeScript, Tailwind CSS |
| UI / Motion | Framer Motion, Lucide React |
| State | Zustand, TanStack Query |
| Backend | Convex |
| Validation | Zod, React Hook Form |
| AST / CLI | TypeScript Compiler API, Node.js, YAML |
| Quality | Component Vault Guard, GitHub Actions, TypeScript strict |
| Package | npm |
| Deploy | Vercel |

## Run locally

```bash
git clone https://github.com/WessYu/component-vault.git
cd component-vault
npm install
```

Then configure the required Convex environment and run:

```bash
npx convex dev
npm run dev
```

The application runs at `http://localhost:3000`.

## Project status

The current published Guard CLI is:

```text
@wess2001/component-vault@0.3.0
```

The project is actively evolving around configurable governance, brownfield migration, deterministic AST analysis and better tooling for AI-assisted development.

## Author

**Wesley Cruz** — Front-end Developer & Designer

[GitHub](https://github.com/WessYu) · [Portfolio](https://wessyu-arquivo.vercel.app/) · [LinkedIn](https://www.linkedin.com/in/wesley-santos-cruz-b57589213/)
