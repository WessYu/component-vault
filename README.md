# Component Vault

<p align="center">
  <a href="https://component-vault-dun.vercel.app/">
    <img src="https://raw.githubusercontent.com/WessYu/WESSYU-ARQUIVO/main/public/projects/component-vault/landing.svg" alt="Landing atual do Component Vault" width="100%" />
  </a>
</p>

<p align="center"><strong>Workspace full stack para criar, organizar, testar, editar e reutilizar componentes de interface.</strong></p>

<p align="center">
  <a href="https://component-vault-dun.vercel.app/"><strong>Live Demo</strong></a> ·
  <a href="https://www.npmjs.com/package/@wess2001/component-vault">npm CLI</a> ·
  <a href="https://wessyu-arquivo.vercel.app/">Portfólio</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-111111?style=flat-square&logo=nextdotjs" />
  <img src="https://img.shields.io/badge/TypeScript-111111?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/Convex-111111?style=flat-square" />
  <img src="https://img.shields.io/badge/Component%20Vault-0.3.0-111111?style=flat-square" />
  <img src="https://img.shields.io/badge/Node-%3E%3D20-111111?style=flat-square&logo=node.js" />
</p>

## Interface

<p align="center"><img src="https://raw.githubusercontent.com/WessYu/WESSYU-ARQUIVO/main/public/projects/component-vault/overview.svg" alt="Workspace do Component Vault" width="100%" /></p>

## Sobre

O **Component Vault** começou como uma biblioteca pessoal de componentes e evoluiu para um workspace de desenvolvimento. A aplicação reúne catálogo, busca, filtros, favoritos por conta, coleções, edição de código, configurações persistentes, administração e experiências de motion em um único produto.

O backend usa **Convex** para persistir contas, sessões, componentes, favoritos, coleções e preferências do workspace.

### Principais recursos

- cadastro, login e sessão persistente com cookie `httpOnly`;
- favoritos separados por usuário;
- criação, edição e exclusão de componentes;
- editor para código, estilos e exemplos de uso;
- coleções personalizadas;
- busca global e command palette;
- painel administrativo protegido por papel de usuário;
- biblioteca de Motion Experiences;
- preview responsivo;
- deploy pela Vercel e validação por GitHub Actions;
- governança incremental com o **Component Vault Guard**.

## Component Vault Guard

O **Component Vault Guard** é a camada de governança do design system. Ele usa a **TypeScript Compiler API** para analisar a AST de TypeScript/TSX e trabalhar com imports, JSX e propriedades reais, em vez de depender apenas de buscas textuais.

```text
Source Code
    │
    ▼
TypeScript / TSX AST
    │
    ├── Component rules
    ├── Import rules
    ├── Property rules
    └── Semantic rules
    │
    ▼
Guard Engine
    │
    ├── Baseline
    ├── Migration strategy
    └── Finding classification
    │
    ▼
Report / CLI / CI
```

### Migração brownfield

O Guard foi pensado para adoção incremental:

- `protect`: mantém a dívida existente na baseline, mas bloqueia novas violações;
- `touched`: arquivos legados precisam ser corrigidos quando forem modificados;
- `full`: qualquer violação restante bloqueia o pipeline.

Isso evita uma migração de big bang e permite reduzir a dívida do design system junto com o desenvolvimento normal.

### Regras

- `CV001`: import direto de componente governado;
- `CV002`: sobrescrita de propriedade visual protegida;
- `CV003`: elemento HTML cru onde existe uma variante semântica;
- `CV004`: combinação estática de classes repetida;
- `CV005`: padrão explicitamente proibido pela configuração.

A política inicial governa tipografia através de `Text.H1`, `Text.H2`, `Text.Paragraph` e `Text.Caption`.

### Findings

Os relatórios classificam as ocorrências como:

- **legacy** — já existentes na baseline;
- **new** — introduzidas pela alteração atual;
- **resolved** — corrigidas desde a baseline;
- **blocking** — incompatíveis com a política atual.

`examples/messy-app` demonstra o ciclo completo:

```text
scan → baseline → mudança → PR gate → legacy/new/resolved/blocking
```

## CLI publicado no npm

O Guard é distribuído como pacote independente:

**`@wess2001/component-vault@0.3.0`**

Requer **Node.js >= 20**.

### Instalação

```bash
npm install -g @wess2001/component-vault
```

Ou use diretamente com `npx`:

```bash
npx @wess2001/component-vault@latest init
```

O pacote se chama `@wess2001/component-vault`; o executável é `component-vault`.

Verifique a versão:

```bash
component-vault --version
```

### Inicialização

```bash
component-vault init
```

Para criar também a integração de CI:

```bash
component-vault init --ci
```

O `init` cria `component-vault.yaml`, `component-vault.baseline.json` e `.component-vault/README.md`. Com `--ci`, também cria `.github/workflows/component-vault-guard.yml`.

### Comandos

```bash
component-vault scan
component-vault check --base origin/master
component-vault baseline
component-vault report
component-vault context
component-vault doctor
component-vault pr --base origin/master
component-vault explain CV001
```

`doctor` valida configuração, baseline, Git e o motor AST. `report` gera o relatório JSON. `pr` gera `.component-vault/pr-summary.md` e, em GitHub Actions, também escreve no `GITHUB_STEP_SUMMARY`.

### Configuração

```yaml
version: 1

scan:
  include: [src]
  exclude: [node_modules, .next, dist, build, coverage, .git]
  extensions: [.ts, .tsx, .js, .jsx]

duplicates:
  enabled: true
  minOccurrences: 5
  minTokens: 5

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

Também é possível definir `rules.forbiddenPatterns` e `rules.fixes` para políticas adicionais e correções automáticas.

## Uso no próprio Component Vault

O próprio repositório usa o pacote publicado nos fluxos principais de governança. Assim, o projeto valida o mesmo artefato que consumidores externos instalam pelo npm.

```bash
npm run guard
npm run guard:check
npm run guard:baseline
npm run guard:report
npm run guard:context
npm run guard:doctor
npm run guard:pr
npm run guard:test
```

Os comandos `guard:v2:*` e `guard:fix*` permanecem disponíveis para desenvolvimento do engine e autofix local.

A página `/vault/guard` exibe progresso de migração, baseline, dívida legada, violações resolvidas, novas violações, bloqueios e findings com arquivo, linha, coluna e sugestão.

## CI/CD

O Guard pode atuar como gate de Pull Request:

```text
Developer / AI agent
        │
        ▼
component-vault check
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

O CI do projeto também executa testes do Guard e um smoke test que empacota a CLI, instala o tarball em um projeto temporário e executa `init` e `doctor`. Isso valida o artefato distribuível fora da árvore interna do engine.

## Estrutura do pacote

```text
packages/component-vault/
├── bin/component-vault.mjs
├── lib/
│   ├── cli.mjs
│   └── cli-v2.mjs
├── scripts/
│   ├── prepack.mjs
│   └── postpack.mjs
├── README.md
└── package.json
```

Durante `npm pack` e `npm publish`, o `prepack` inclui o núcleo do Guard em `lib/`, permitindo que o pacote publicado seja executado de forma independente do monorepo.

## Desenvolvimento do Guard

O engine fica em `tools/component-vault-guard/`:

```text
cli.mjs        → CLI de governança e integração
cli-v2.mjs     → engine AST e comandos de desenvolvimento
fix.mjs        → autofix local
guard.test.mjs  → testes do engine
```

Para testar alterações no engine sem publicar uma nova versão:

```bash
npm run guard:test
npm run guard:v2
npm run guard:v2:check
```

Para gerar e publicar uma versão do pacote:

```bash
cd packages/component-vault
npm pack --dry-run
npm publish
```

Depois valide o artefato publicado:

```bash
npx @wess2001/component-vault@latest --version
```

## Stack

| Camada | Tecnologias |
| --- | --- |
| Front-end | Next.js, React, TypeScript, Tailwind CSS |
| Estado e UI | Zustand, Framer Motion, Lucide React |
| Backend | Convex |
| Auth | sessão própria com cookies `httpOnly` |
| Qualidade | Component Vault Guard, GitHub Actions, TypeScript strict |
| Deploy | Vercel |
| CLI | Node.js, TypeScript Compiler API, YAML |
| Distribuição | npm |

## Executando localmente

```bash
git clone https://github.com/WessYu/component-vault.git
cd component-vault
npm install
```

Configure `.env.local` com o deployment do Convex e execute:

```bash
npx convex dev
npm run dev
```

A aplicação fica disponível em `http://localhost:3000`.

## Por que este projeto importa

O Component Vault trata componentes como uma camada governável do produto. O Guard transforma regras que normalmente ficam espalhadas entre lint, documentação, code review e conhecimento tácito do time em uma política executável e verificável.

Isso é especialmente relevante em fluxos modernos de desenvolvimento assistido por IA: gerar código é fácil, mas manter uma API visual coerente em centenas de arquivos continua sendo um problema de engenharia.

## Autor

**Wesley Cruz** — Front-end Developer & Designer  
[GitHub](https://github.com/WessYu) · [Portfólio](https://wessyu-arquivo.vercel.app/) · [LinkedIn](https://www.linkedin.com/in/wesley-santos-cruz-b57589213/)
