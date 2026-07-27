# Component Vault

Component Vault is a retro developer workstation for storing, organizing, previewing and reusing interface components. It uses the visual language of old technical desktop software, but the product behavior is practical: component browser, isolated live preview, Monaco editor, inspector, collections, tokens, auth screens and Supabase schema.

## Objective

Give front-end developers a personal component operating system: a place to save React, TypeScript, HTML, CSS and Tailwind snippets with notes, versions, usage references, design tokens, categories, tags and collections.

## Features

- Public landing page with Component Vault boot sequence and product preview
- Login and registration flows with React Hook Form, Zod and Supabase Auth support
- Protected `/vault` workspace with demo fallback when Supabase env vars are not configured
- Desktop workstation with top OS menu, left dock, modular windows and taskbar
- `BROWSER.EXE` component library with search, category filters, favorites and card/list modes
- `PREVIEW.LIVE` isolated sandbox preview using `iframe sandbox`
- `CODE_EDITOR.TSX` Monaco Editor with tabs, syntax highlighting, copy, save status and autosave log
- `INSPECTOR.NOTES` tabs for props, notes, tokens and usage
- Collections, favorites, tokens and settings routes
- 10 real demo components with different previews and documentation
- Supabase migration with RLS policies for user-owned data and public component reads

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS v4 with CSS variable tokens
- Supabase Auth and database schema
- React Hook Form + Zod
- Monaco Editor
- Lucide React
- Zustand
- TanStack Query
- Framer Motion installed for future functional motion

## Installation

```bash
npm install
```

## Environment Variables

Create `.env.local` when connecting a real Supabase project:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

Without these variables, the app runs in local demo mode so the workstation can be evaluated immediately.

## Supabase Setup

1. Create a Supabase project.
2. Add the variables above to `.env.local`.
3. Run the SQL migration in `supabase/migrations/202607270001_component_vault_schema.sql`.
4. Enable email/password auth in Supabase Auth.
5. Start the app and use `/register` to create a user.

The migration creates:

- `profiles`
- `components`
- `categories`
- `collections`
- `collection_components`
- `tags`
- `component_tags`
- `component_versions`
- `component_usage`
- `design_tokens`

RLS is enabled for every table. Users can access their own rows, and public components can be read by others.

## Local Development

```bash
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run lint
npm run build
```

Both commands should pass before deployment.

## Deploy

Deploy normally to Vercel or any platform that supports Next.js. Add the Supabase environment variables in the hosting dashboard before production use.

## Project Structure

```text
src/
  app/                  App Router routes
  components/
    desktop/            Workstation shell, dock, taskbar and windows
    editor/             Monaco editor surface
    inspector/          Props, notes, tokens and usage panel
    preview/            Sandboxed live preview
    ui/                 Reusable low-level UI
    vault/              Browser and landing preview pieces
  features/
    auth/               Auth forms, schemas, settings and route guard
    collections/        Collection screens
    tokens/             Token screens
  hooks/                Query hooks
  lib/                  Supabase and utilities
  services/             Demo data and async services
  stores/               Zustand state
  types/                Product and database types
supabase/
  migrations/           SQL schema and RLS
```

## Screenshots

Use the landing page and `/vault` workspace as live screenshots of the product. The landing renders a real mini-workstation, and the vault renders the full responsive workstation.

## Next Features

- Persist component CRUD to Supabase tables
- Add component version diff viewer
- Add import/export for JSON and ZIP archives
- Add drag-and-drop layout persistence
- Add team sharing and public component gallery
- Add visual regression snapshots for previews
