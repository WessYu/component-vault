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
- deploy contínuo pela Vercel e validação por GitHub Actions.

## Stack

| Camada | Tecnologias |
| --- | --- |
| Front-end | Next.js, React, TypeScript, Tailwind CSS |
| Estado e UI | Zustand, Framer Motion, Lucide React |
| Backend | Convex |
| Auth | sessão própria com cookies `httpOnly` |
| Qualidade | GitHub Actions, TypeScript strict |
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

Este projeto concentra vários pontos que procuro demonstrar como desenvolvedor: arquitetura de produto, autenticação, persistência, permissões, CRUD real, experiência de interface, motion e evolução contínua baseada em uso.

## Autor

**Wesley Cruz** — Front-end Developer & Designer  
[GitHub](https://github.com/WessYu) · [Portfólio](https://wessyu-arquivo.vercel.app/) · [LinkedIn](https://www.linkedin.com/in/wesley-santos-cruz-b57589213/)
