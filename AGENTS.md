<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:component-vault-guard -->
# Component Vault governance

Before creating UI, inspect `component-vault.yaml` and reuse its governed components.

## Typography

- Import `Text` from `@/components/ui/text`.
- Use `Text.H1` for page titles.
- Use `Text.H2` for section headings.
- Use `Text.Paragraph` for body copy.
- Use `Text.Caption` for metadata and supporting copy.
- Do not introduce raw `h1`, `h2`, `p` or `small` elements in files you touch.
- Do not override protected typography props. Create or document a semantic variant instead.

Run `npm run guard:check` before finishing UI changes. Run `npm run guard:context` to generate machine-readable component instructions.
<!-- END:component-vault-guard -->
