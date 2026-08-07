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

O Guard é a camada de governança do projeto. Ele usa a AST do TypeScript para identificar drift real no design system sem confundir strings, snippets de documentação e HTML de demonstração com JSX executável.

A configuração fica em `component-vault.yaml` e suporta três estratégias:

- `protect`: aceita violações registradas na baseline, mas bloqueia novas ocorrências;
- `touched`: ao modificar um arquivo, exige a correção das violações governadas naquele arquivo;
- `full`: qualquer violação bloqueia o pipeline.

### CLI instalável

O pacote publicável fica em `packages/component-vault` e expõe o binário `component-vault`. Depois da publicação no npm, o fluxo de instalação será:

```bash
npx component-vault init
npx component-vault scan
npx component-vault baseline
npx component-vault pr --base origin/master
```

`init --ci` também gera um workflow do GitHub Actions:

```bash
npx component-vault init --ci
```

O comando `doctor` valida configuração, baseline, Git e o motor AST. O comando `pr` gera `.component-vault/pr-summary.md`, adiciona o mesmo conteúdo ao `GITHUB_STEP_SUMMARY` quando executado no Actions e retorna código de erro quando a política bloqueia o PR.

Comandos usados pelo próprio Component Vault:

```bash
npm run guard             # escaneia e exibe todos os achados
npm run guard:check       # aplica as estratégias e retorna erro quando necessário
npm run guard:baseline    # registra o legado atual
npm run guard:report      # gera public/component-vault-report.json
npm run guard:context     # gera instruções estruturadas para agentes
npm run guard:doctor      # valida a instalação local
npm run guard:pr          # gera o resumo de governança do PR
npm run guard:test        # executa os testes do Guard
```

A página `/vault/guard` mostra progresso de migração, baseline, dívida legada, violações resolvidas, novas violações, bloqueios e findings com arquivo, linha, coluna e sugestão de correção.

### Regras iniciais

- `CV001`: import direto de componente governado;
- `CV002`: sobrescrita de propriedade visual protegida;
- `CV003`: elemento HTML cru no lugar de uma variante semântica;
- `CV004`: combinação estática de classes repetida em vários pontos.

A primeira política ativa governa tipografia através de `Text.H1`, `Text.H2`, `Text.Paragraph` e `Text.Caption`. Ela começa em `touched`, permitindo que a migração aconteça gradualmente conforme os arquivos existentes forem alterados.

### Demo brownfield

`examples/messy-app` contém um pequeno projeto propositalmente inconsistente para demonstrar o ciclo completo:

```text
scan -> baseline -> mudança -> PR gate -> legacy/new/resolved/blocking
```

O pipeline principal também empacota a CLI e instala o tarball em um projeto temporário para provar que `init` e `doctor` funcionam fora do repositório do Component Vault.

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

## Publicação da CLI

O workflow `Publish Component Vault CLI` publica `packages/component-vault` quando uma tag `component-vault-cli-v*` é enviada ou quando o workflow é disparado manualmente. A publicação exige o secret `NPM_TOKEN` no repositório.

## Por que este projeto importa

Este projeto concentra vários pontos que procuro demonstrar como desenvolvedor: arquitetura de produto, autenticação, persistência, permissões, CRUD real, experiência de interface, motion, governança de design system e evolução contínua baseada em uso.

## Autor

**Wesley Cruz** — Front-end Developer & Designer  
[GitHub](https://github.com/WessYu) · [Portfólio](https://wessyu-arquivo.vercel.app/) · [LinkedIn](https://www.linkedin.com/in/wesley-santos-cruz-b57589213/)
