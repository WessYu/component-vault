# Component Vault

<p align="center">
  <a href="https://component-vault-dun.vercel.app/">
    <img src="https://raw.githubusercontent.com/WessYu/WESSYU-ARQUIVO/main/public/projects/component-vault/landing.svg" alt="Component Vault" width="100%" />
  </a>
</p>

<p align="center">
  <strong>Component workspace + AST-based design-system governance.</strong>
</p>

<p align="center">
  <a href="https://component-vault-dun.vercel.app/">Live Demo</a> ·
  <a href="https://www.npmjs.com/package/@wess2001/component-vault">npm CLI</a> ·
  <a href="https://github.com/WessYu/component-vault">GitHub</a> ·
  <a href="https://wessyu-arquivo.vercel.app/">Portfolio</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-111111?style=flat-square&logo=nextdotjs" />
  <img src="https://img.shields.io/badge/React-19-111111?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-Compiler_API-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Convex-111111?style=flat-square" />
  <img src="https://img.shields.io/badge/npm-111111?style=flat-square&logo=npm" />
</p>

## Overview

**Component Vault** is a full-stack workspace for creating, organizing, testing, editing and reusing UI components, paired with an AST-based governance engine for enforcing design-system rules in real codebases.

It is built around a simple idea:

> **AI can generate code. The repository should still decide what is allowed.**

The project combines a visual component workspace with **Component Vault Guard**, a deterministic governance tool for local development, CI, pull requests and AI-assisted coding workflows.

## Why Component Vault Guard?

Design-system drift is rarely caused by one large mistake. It accumulates through small inconsistencies:

- raw semantic elements replacing governed components;
- imports that bypass approved component boundaries;
- protected visual props being overridden;
- repeated class combinations spreading through the codebase;
- AI-generated code that works technically but violates the project's UI contract.

Documentation and code review can catch some of these problems. Guard turns the rules into **machine-checkable, repeatable policies**.

## How it works

```text
Source code
    │
    ▼
TypeScript Compiler API
    │
    ▼
AST analysis
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
    ├── baseline
    ├── deterministic autofix
    ├── migration strategies
    └── PR reporting
    │
    ▼
CLI · CI · reports
```

Unlike a text-only search, the Guard analyzes TypeScript/TSX/JavaScript/JSX through the **TypeScript Compiler API**, allowing rules to reason about real imports, JSX elements and properties.

## Semantic governance

Policies can be defined by **semantic role** rather than being coupled to one HTML element or component name.

For example, a project can map `h1` to the semantic role `heading` at level `1`, then define which component should govern that role:

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
    Text.H1:
      roles:
        heading:
          level: 1
    Button:
      roles:
        button: {}
```

The repository's YAML configuration remains the **source of truth**. The engine understands semantic facts; the project decides what those facts mean.

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

### Govern your codebase from the terminal

**Deterministic governance for AI-assisted development.**

The CLI is published as `@wess2001/component-vault` and exposes the `component-vault` executable.

### Quick start

```bash
npx @wess2001/component-vault@latest init
npx component-vault analyze
npx component-vault scan
```

For an existing codebase with accepted legacy violations:

```bash
npx component-vault baseline
```

For pull requests:

```bash
npx component-vault init --ci
npx component-vault pr --base origin/master
```

### Workflow

```text
init
  ↓
analyze
  ↓
scan
  ↓
fix --dry-run
  ↓
fix
  ↓
check / pr
```

### Commands

```text
init [--ci] [--force]     initialize governance files
doctor                    validate local setup
scan                      scan TypeScript/JavaScript AST
analyze                   inspect semantic roles and coverage
fix [--dry-run]           automatically fix supported findings
check --base REF          enforce governance strategies
baseline                  capture accepted legacy debt
report --output FILE      generate the migration report
pr --base REF             generate a PR summary and enforce the gate
context                   export agent-readable rules
explain CV001             explain a Guard rule
explain CV006             explain a semantic finding
```

## Autofix

Supported findings can be fixed deterministically using the same repository-owned mappings used by the analyzer.

Preview changes:

```bash
npx component-vault fix --dry-run
```

Apply supported changes:

```bash
npx component-vault fix
```

The fixer does not guess when a governed target cannot be resolved; unsupported findings are reported instead.

## AI-assisted development

Component Vault Guard is intentionally **not an AI reviewer**.

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

Agents can use `component-vault context` to read repository rules, while enforcement remains deterministic and controlled by the repository. Autofixes use the same configured rules rather than asking an AI model to invent transformations.

## Brownfield migration

Existing projects do not need to fix every historical violation before adopting governance.

Guard supports three enforcement strategies:

- **`protect`** — accept known baseline debt and block newly introduced violations;
- **`touched`** — require violations to be fixed when a legacy file is changed;
- **`full`** — block all governed violations.

```text
Legacy code
    │
    ▼
Baseline
    │
    ├── existing debt → accepted
    └── touched file  → migrate
                           │
                           ▼
                      enforcement
```

PR reporting also classifies findings as **legacy**, **new**, **resolved** and **blocking**.

## CI / Pull Requests

`component-vault init --ci` can create a GitHub Actions workflow for pull-request validation.

The PR command can generate a Markdown summary for `GITHUB_STEP_SUMMARY`, making governance findings visible directly in the workflow.

## Demo project

`examples/messy-app` is a deliberately inconsistent project used to exercise the brownfield lifecycle:

```text
scan → baseline → change → PR gate → legacy / new / resolved / blocking
```

The project also validates the CLI package by generating the npm artifact, installing the generated `.tgz` in a separate test project and running the packaged command.

## Project structure

```text
packages/component-vault/      Published npm CLI
tools/component-vault-guard/   Guard engine + tests
examples/messy-app/            Brownfield demonstration
src/                           Component Vault application
```

## Component Vault workspace

The main application provides:

- component creation, editing and deletion;
- live previews and responsive states;
- code, usage, accessibility and notes;
- search and command palette;
- favorites and personal collections;
- persistent workspace preferences;
- protected administration;
- Motion Experiences and reusable UI patterns;
- Guard dashboard at `/vault/guard`;
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

Configure the required Convex environment, then run:

```bash
npx convex dev
npm run dev
```

The application runs at `http://localhost:3000`.

## Project status

Current CLI package:

```text
@wess2001/component-vault@0.4.1
```

Version `0.4.1` focuses on semantic governance and deterministic autofix while the project continues evolving around configurable governance, brownfield migration and tooling for AI-assisted development.

## Links

- **Live Demo:** https://component-vault-dun.vercel.app/
- **npm:** https://www.npmjs.com/package/@wess2001/component-vault
- **Portfolio:** https://wessyu-arquivo.vercel.app/
- **Issues:** https://github.com/WessYu/component-vault/issues

## Author

**Wesley Cruz** — Front-end Developer & Designer

[GitHub](https://github.com/WessYu) · [Portfolio](https://wessyu-arquivo.vercel.app/) · [LinkedIn](https://www.linkedin.com/in/wesley-santos-cruz-b57589213/)
