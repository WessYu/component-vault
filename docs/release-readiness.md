# Release and portfolio readiness

Component Vault is release-ready only when the package, application and public claims describe the same working product.

## Automated gate

Run the complete local gate from the repository root:

```bash
npm run release:check
```

It must prove all of the following:

- backend security contracts pass;
- Guard unit, integration and public API tests pass;
- ESLint and TypeScript pass;
- the packaged CLI installs in a separate React/Vite project;
- `discover → scan → report → fix --dry-run → fix → scan` behaves consistently;
- the safe fix leaves the demo project buildable;
- the Next.js production build completes.

The CI workflow runs the same product proof and uploads `component-vault-product-proof`, containing the before/after source, JSON report and full terminal transcript.

## Release gate

- [ ] `npm run release:check` is green on the release commit.
- [ ] The GitHub Actions CI run is green.
- [ ] Package version, Git tag and release notes use the same version.
- [ ] The npm package was installed from the registry in a clean directory.
- [ ] `component-vault --version` matches the released version.
- [ ] The production health endpoint returns a successful response.
- [ ] The live landing page and README describe only behavior covered by the product proof or another linked test.
- [ ] Screenshots and terminal output were regenerated from the release candidate.
- [ ] Accessibility keyboard flow, focus visibility and reduced motion were checked on the landing page and Guard dashboard.

## Portfolio gate

- [ ] The first screen identifies the product as deterministic design-system governance.
- [ ] A visitor can reach the npm package, source, Guard dashboard and reproducible demo without signing in.
- [ ] The product proof shows the failure, proposed safe change and clean result—not only a polished final state.
- [ ] Numbers shown publicly are produced by a committed fixture or a current CI artifact.
- [ ] The component workspace is presented as the review surface; Guard remains the primary product narrative.
