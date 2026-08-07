# Messy App Guard demo

This intentionally inconsistent React sample exists to demonstrate Component Vault Guard against a brownfield codebase.

From this directory, after the CLI package is published:

```bash
npx component-vault scan
npx component-vault baseline
npx component-vault pr --base HEAD~1
```

The sample contains raw semantic JSX and a forbidden direct `Text` import. The point is to show the workflow:

```text
initial scan -> baseline legacy -> edit files -> PR gate -> resolved/new/blocking metrics
```

`src/profile.fixed.tsx` shows the governed version using `Text.H1` and `Text.Paragraph`.
