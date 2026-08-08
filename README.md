# Component Vault

<p align="center">
  <a href="https://component-vault-dun.vercel.app/">
    <img src="https://raw.githubusercontent.com/WessYu/WESSYU-ARQUIVO/main/public/projects/component-vault/landing.svg" alt="Landing atual do Component Vault" width="100%" />
  </a>
</p>

<p align="center">
  <strong>Workspace full stack para criar, organizar, testar, editar e reutilizar componentes de interface.</strong>
</p>

<p align="center">
  <a href="https://component-vault-dun.vercel.app/"><strong>Live Demo</strong></a> ·
  <a href="https://wessyu-arquivo.vercel.app/">Portfólio</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-111111?style=flat-square&logo=nextdotjs" />
  <img src="https://img.shields.io/badge/TypeScript-111111?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/Convex-111111?style=flat-square" />
  <img src="https://img.shields.io/badge/Framer_Motion-111111?style=flat-square&logo=framer" />
  <img src="https://img.shields.io/badge/Vercel-111111?style=flat-square&logo=vercel" />
</p>

## Interface

<p align="center">
  <img src="https://raw.githubusercontent.com/WessYu/WESSYU-ARQUIVO/main/public/projects/component-vault/overview.svg" alt="Workspace do Component Vault" width="100%" />
</p>

## Sobre

O **Component Vault** nasceu como uma biblioteca pessoal de componentes e evoluiu para um workspace de desenvolvimento. A aplicação reúne catálogo, busca, filtros, favoritos por conta, coleções, edição de código, configurações persistentes, administração e experiências de motion em um único produto.

O backend atual usa **Convex** para persistir contas, sessões, componentes, favoritos, coleções e preferências do workspace.

## Principais recursos

- cadastro, login e sessão persistente com cookie `httpOnly`;
- favoritos separados por usuário;
- criação, edição e exclusão de componentes;
- editor para código, estilos e exemplo de uso;
- coleções personalizadas;
- busca global e command palette;
- painel administrativo protegido por papel de usuário;
- preferências do workspace salvas no backend;
- biblioteca de Motion Experiences e padrões emergentes de UI;
- preview responsivo e interface otimizada para desktop e mobile;
- deploy contínuo pela Vercel e validação por GitHub Actions;
- governança incremental de componentes com o **Component Vault Guard**.

## Component Vault Guard

O **Component Vault Guard** é a camada de governança do projeto. A ideia é impedir que um design system perca consistência conforme o código cresce, inclusive quando parte dele é produzida ou modificada por agentes de IA.

O Guard usa a **TypeScript Compiler API para analisar a AST de TypeScript/TSX**. Isso permite trabalhar com nós reais de import, JSX e propriedades em vez de depender somente de buscas textuais ou regex. Como consequência, o scanner consegue separar código executável de strings, comentários, snippets de documentação e HTML usado apenas em exemplos.

### Arquitetura

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
    │
    ├── legacy
    ├── new
    ├── resolved
    └── blocking
```

A regra não precisa apenas dizer que algo está errado. Ela pode definir **qual componente é permitido, quais imports são proibidos, qual API semântica deve ser usada e em que momento uma violação deve bloquear o desenvolvimento**.

### Brownfield migration

Um dos objetivos do Guard é permitir a adoção em projetos existentes sem exigir uma refatoração completa no primeiro dia.

A configuração suporta três estratégias:

- `protect`: mantém violações conhecidas na baseline, mas bloqueia novas ocorrências;
- `touched`: quando um arquivo legado é modificado, as violações governadas naquele arquivo precisam ser corrigidas;
- `full`: qualquer violação restante bloqueia o pipeline.

O fluxo fica assim:

```text
Legacy code
    │
    ▼
Baseline
    │
    ├── existing debt → tolerated
    │
    └── touched file → must migrate
                         │
                         ▼
                    full enforcement
```

Isso permite que um projeto brownfield reduza a dívida de forma incremental, sem transformar a adoção do Guard em uma migração de big bang.

### Classificação dos findings

O Guard acompanha mais do que apenas o número bruto de erros:

- **legacy** — violações já registradas na baseline;
- **new** — violações introduzidas pela alteração atual;
- **resolved** — violações que existiam e foram corrigidas;
- **blocking** — findings que, de acordo com a política, impedem o pipeline de passar.

Isso torna o resultado útil tanto para desenvolvimento local quanto para revisão de Pull Requests.

### Regras iniciais

- `CV001`: import direto de componente governado;
- `CV002`: sobrescrita de propriedade visual protegida;
- `CV003`: elemento HTML cru no lugar de uma variante semântica;
- `CV004`: combinação estática de classes repetida em vários pontos.

A primeira política ativa governa tipografia através de `Text.H1`, `Text.H2`, `Text.Paragraph` e `Text.Caption`. Ela começa em `touched`, permitindo que a migração aconteça gradualmente conforme os arquivos existentes forem alterados.

### Demo brownfield

`examples/messy-app` contém um pequeno projeto propositalmente inconsistente para demonstrar o ciclo completo:

```text
scan → baseline → mudança → PR gate → legacy/new/resolved/blocking
```

O pipeline principal também empacota a CLI, instala o tarball em um projeto temporário e executa `init` e `doctor` fora do próprio repositório. Isso valida o artefato publicado em vez de testar somente os arquivos-fonte.

## CLI

O Guard também é distribuído como pacote npm independente:

```bash
npm install -g @wess2001/component-vault
```

Ou sem instalação global:

```bash
npx @wess2001/component-vault init
```

O pacote é `@wess2001/component-vault`, enquanto o executável exposto no terminal continua sendo `component-vault`.

### Inicializar um projeto

```bash
component-vault init
```

Para configurar também a integração de CI:

```bash
component-vault init --ci
```

### Comandos

```bash
component-vault scan
component-vault check
component-vault baseline
component-vault report
component-vault context
component-vault doctor
component-vault pr
```

Exemplo de Pull Request:

```bash
component-vault pr --base origin/master
```

O comando `doctor` valida configuração, baseline, Git e o motor AST. O comando `pr` gera `.component-vault/pr-summary.md`, adiciona o mesmo conteúdo ao `GITHUB_STEP_SUMMARY` quando executado no GitHub Actions e retorna código de erro quando a política bloqueia o PR.

### Uso no próprio Component Vault

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

A página `/vault/guard` mostra progresso de migração, baseline, dívida legada, violações resolvidas, novas violações, bloqueios e findings com arquivo, linha, coluna e sugestão de correção.

## CI/CD

O Guard pode funcionar como gate de Pull Request. Uma configuração gerada pelo `init --ci` executa a política no GitHub Actions e pode bloquear a alteração quando novos findings incompatíveis com a regra são introduzidos.

O fluxo recomendado é:

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

Para publicação da CLI, o pacote fica em `packages/component-vault` e possui o nome `@wess2001/component-vault`. O workflow de publicação pode ser disparado por tags `component-vault-cli-v*` ou manualmente.

## Stack

| Camada | Tecnologias |
| --- | --- |
| Front-end | Next.js, React, TypeScript, Tailwind CSS |
| Estado e UI | Zustand, Framer Motion, Lucide React |
| Backend | Convex |
| Auth | sessão própria com cookies `httpOnly` |
| Qualidade | Component Vault Guard, GitHub Actions, TypeScript strict |
| Deploy | Vercel |

## Executando localmente

```bash
git clone https://github.com/WessYu/component-vault.git
cd component-vault
npm install
```

Crie `.env.local` com o deployment do Convex e execute:

```bash
npx convex dev
npm run dev
```

A aplicação fica disponível em `http://localhost:3000`.

## Por que este projeto importa

O Component Vault começou como uma biblioteca pessoal e evoluiu para uma ferramenta que trata componentes como uma camada governável do produto. O Guard adiciona uma preocupação que normalmente fica espalhada entre lint, documentação, code review e conhecimento tácito do time: **garantir que o código continue usando o design system de forma consistente ao longo do tempo**.

Isso fica especialmente relevante em fluxos modernos de desenvolvimento assistido por IA, nos quais gerar código é fácil, mas manter uma API visual coerente em centenas de arquivos continua sendo um problema de engenharia.

## Autor

**Wesley Cruz** — Front-end Developer & Designer  
[GitHub](https://github.com/WessYu) · [Portfólio](https://wessyu-arquivo.vercel.app/) · [LinkedIn](https://www.linkedin.com/in/wesley-santos-cruz-b57589213/)
