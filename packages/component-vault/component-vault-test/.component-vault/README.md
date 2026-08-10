# Component Vault Guard setup

The project is initialized for AST-based design-system governance.

Recommended next steps:

1. Run `npx component-vault scan` to inspect current findings.
2. On an existing codebase, run `npx component-vault baseline` once to capture accepted legacy debt.
3. Run `npx component-vault pr --base HEAD~1` to generate a concise PR gate summary.
4. Run `npx component-vault context` to export agent-readable rules.
5. Promote a component from `touched` to `full` after its legacy debt reaches zero.

Edit `component-vault.yaml` to add governed components, forbidden imports, protected props and semantic variants.
