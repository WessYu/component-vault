# Component Vault

<p align="center">
  <a href="https://component-vault-dun.vercel.app/">
    <img src="https://raw.githubusercontent.com/WessYu/WESSYU-ARQUIVO/main/public/projects/component-vault/landing.svg" alt="Component Vault" width="100%" />
  </a>
</p>

<p align="center">
  <strong>AST-based component governance and design-system tooling for real codebases.</strong>
</p>

<p align="center">
  <a href="https://component-vault-dun.vercel.app/">Live Demo</a> ·
  <a href="https://www.npmjs.com/package/@wess2001/component-vault">npm CLI</a> ·
  <a href="https://github.com/WessYu/component-vault">Source</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-111111?style=flat-square&logo=nextdotjs" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-111111?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-Compiler_API-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript Compiler API" />
  <img src="https://img.shields.io/badge/Node.js-20+-111111?style=flat-square&logo=nodedotjs" alt="Node.js 20+" />
  <img src="https://img.shields.io/badge/npm-111111?style=flat-square&logo=npm" alt="npm" />
</p>

## The problem

Design-system drift usually happens through small changes that are individually reasonable:

- a raw HTML element replaces a governed component;
- an import bypasses an approved component boundary;
- a protected visual prop is overridden;
- the same class combination is copied across multiple files;
- AI-generated code follows the syntax of the project but not its UI rules.

Documentation and code review help, but they depend on people remembering and enforcing the same rules repeatedly.

**Component Vault turns those rules into executable, repository-owned policies.**

## What it is

Component Vault is a full-stack component workspace paired with **Component Vault Guard**, an AST-based governance engine for local development, CI and pull requests.

The Guard analyzes TypeScript, TSX, JavaScript and JSX through the **TypeScript Compiler API** and evaluates the result against rules defined by the repository.

```text
Codebase
   │
   ▼
TypeScript Compiler API
   │
   ▼
AST + semantic analysis
   │
   ├── component rules
   ├── import rules
   ├── property rules
   ├── semantic rules
   └── custom forbidden patterns
   │
   ▼
Component Vault Guard
   │
   ├── scan / analyze
   ├── baseline / migration
   ├── deterministic autofix
   └── PR reporting
   │
   ▼
CLI · CI · development workflow
```

The important separation is intentional:

> **The engine understands the code. The repository decides what is allowed.**

## Semantic governance

The semantic layer allows policies to describe **meaning**, rather than coupling a rule to one tag or component name.

For example, a repository can define `h1` as the semantic role `heading` at level `1` and map that role to its own typography component:

```yaml
semantics:
  strict: false
  elements:
    h1:
      role: heading
      level: 1
    button:
      role: button

  components:
    Typography:
      roles:
        heading:
          variants:
            h1:
              level: 1
```

This keeps the governance vocabulary **repository-owned**. One Design System can use `Typography`, another can use `Text`, and the policy does not need to change the Guard's implementation.

## Rules

| Rule | Purpose |
| --- | --- |
| `CV001` | Detect forbidden direct imports |
| `CV002` | Detect protected visual-property overrides |
| `CV003` | Detect raw semantic JSX where a governed variant exists |
| `CV004` | Detect repeated static class combinations |
| `CV005` | Enforce repository-specific forbidden patterns |
| `CV006` | Enforce semantic elements through governed components |

## CLI

The published package is `@wess2001/component-vault` and exposes the `component-vault` command.

### Start in an existing project

```bash
npx @wess2001/component-vault@latest init
npx component-vault analyze
npx component-vault scan
```

For brownfield adoption:

```bash
npx component-vault baseline
npx component-vault check --base origin/master
```

For pull-request enforcement:

```bash
npx component-vault init --ci
npx component-vault pr --base origin/master
```

### Deterministic autofix

Supported findings can be fixed using the same repository configuration used by the analyzer.

```bash
npx component-vault fix --dry-run
npx component-vault fix
```

The fixer is deliberately conservative. If a governed target cannot be resolved from the repository configuration, the finding is reported instead of being changed heuristically.

Recommended workflow:

```text
scan / analyze
      ↓
fix --dry-run
      ↓
review
      ↓
fix
      ↓
scan again
```

### Commands

```text
init [--ci] [--force]     initialize governance files
doctor                    validate local setup
scan                      scan TypeScript/JavaScript AST
analyze                   inspect semantic roles and coverage
fix [--dry-run]           fix supported findings
check --base REF          enforce governance strategies
baseline                  capture accepted legacy debt
report --output FILE      generate migration report
pr --base REF             generate PR summary and enforce the gate
context                   export agent-readable rules
explain CV001             explain a Guard rule
explain CV006             explain a semantic finding
```

## AI-assisted development

Component Vault is **not an AI reviewer**.

The intended relationship is:

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
      └── blocked / fixable
```

Agents can read repository rules through `component-vault context`, while enforcement remains deterministic and controlled by the codebase.

## Brownfield migration

Governance should not require a one-shot rewrite of an existing application.

Guard supports three enforcement strategies:

- **`protect`** — accept known baseline debt and block newly introduced violations;
- **`touched`** — require violations to be fixed when a legacy file is changed;
- **`full`** — enforce all governed violations.

```text
Existing code
     │
     ▼
  baseline
     │
     ├── existing debt → accepted
     └── changed file  → migrate
                              │
                              ▼
                         enforcement
```

PR reporting can classify findings as **legacy, new, resolved and blocking**, making migration progress visible instead of hiding existing debt.

## CI / Pull Requests

`component-vault init --ci` can create a GitHub Actions workflow for pull-request validation.

`component-vault pr` can generate a Markdown summary for `GITHUB_STEP_SUMMARY`, keeping governance findings visible alongside the change being reviewed.

## Demo project

`examples/messy-app` is a deliberately inconsistent project used to exercise the brownfield lifecycle:

```text
scan → baseline → change → PR gate → legacy / new / resolved / blocking
```

It also provides a packaged-CLI validation path by generating the npm artifact, installing the generated `.tgz` in a separate project and running the published command locally.

## Component workspace

The main application provides a workspace for creating and maintaining UI components, including:

- component creation, editing and deletion;
- live previews and responsive states;
- code, usage, accessibility and notes;
- search and command palette;
- favorites and collections;
- persistent workspace preferences;
- protected administration;
- Motion Experiences and reusable UI patterns;
- Guard dashboard at `/vault/guard`;
- migration metrics and findings with file/line/column information.

## Architecture & stack

| Area | Technologies |
| --- | --- |
| Front-end | Next.js 16, React 19, TypeScript, Tailwind CSS |
| UI / Motion | Framer Motion, Lucide React |
| State | Zustand, TanStack Query |
| Backend | Convex |
| Validation | Zod, React Hook Form |
| AST / CLI | TypeScript Compiler API, Node.js, YAML |
| Quality | Guard tests, GitHub Actions, TypeScript strict |
| Package | npm |
| Deploy | Vercel |

## Run locally

```bash
git clone https://github.com/WessYu/component-vault.git
cd component-vault
npm install
```

Configure the required backend environment, then run:

```bash
npx convex dev
npm run dev
```

The application runs at `http://localhost:3000`.

For the Guard:

```bash
npm run guard:test
npm run guard
npm run guard:check
```

## Project status

The CLI is currently published as:

```text
@wess2001/component-vault@0.4.1
```

The current focus is semantic governance, deterministic autofix, brownfield migration and tooling for AI-assisted development.

## Links

- **Live Demo:** https://component-vault-dun.vercel.app/
- **npm:** https://www.npmjs.com/package/@wess2001/component-vault
- **Issues:** https://github.com/WessYu/component-vault/issues
- **Portfolio:** https://wessyu-arquivo.vercel.app/

## Author

**Wesley Cruz** — Front-End Developer

[GitHub](https://github.com/WessYu) · [Portfolio](https://wessyu-arquivo.vercel.app/) · [LinkedIn](https://www.linkedin.com/in/wesley-santos-cruz-b57589213/)
