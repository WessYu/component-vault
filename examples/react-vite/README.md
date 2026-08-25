# React + Vite example

This example is intentionally committed with three native semantic elements in `src/App.tsx`. It demonstrates the complete Component Vault workflow against a small, real React application.

```bash
npm install
npm run vault:doctor
npm run vault:discover
npm run vault:scan        # expected to fail with three CV006 findings
npm run vault:scan:json   # the same findings as structured JSON
npm run vault:fix:dry     # previews imports and tag replacements; writes nothing
npm run vault:fix
npm run vault:scan        # now passes
npm run dev
```

The configured imports use the `@/*` alias from `tsconfig.json` and `vite.config.ts`. The fixer verifies the `Text` and `Button` exports before modifying `App.tsx`.

To test discovery from an empty policy, replace the `components` block with `components: {}` and run:

```bash
npm run vault:discover
npm run vault:discover -- --write
```

Existing component definitions are preserved; only new proven candidates are merged.
