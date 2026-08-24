import type { VaultComponent } from "@/types/vault";

export const cliWorkflowComponent: VaultComponent = {
  id: "catalog-cli-workflow",
  userId: "demo-user",
  name: "CLI / Governance Workflow",
  slug: "cli-governance-workflow",
  description: "Four-step developer workflow for introducing Component Vault governance into a repository: initialize, analyze, validate and preview deterministic fixes.",
  category: "Utilities",
  framework: "React",
  language: "tsx",
  version: "v1.0.0",
  isFavorite: false,
  isPublic: false,
  tags: ["cli", "developer-tooling", "governance", "workflow", "terminal"],
  collectionIds: ["core-library"],
  updatedAt: "2026-08-24T16:45:00.000Z",
  previewHtml: `<article class="cli-workflow-preview">
    <div class="cli-workflow-head"><span>CLI WORKFLOW</span><strong>4 steps</strong></div>
    <div class="cli-workflow-title">From install to an enforceable rule set.</div>
    <div class="cli-workflow-steps">
      <span><b>01</b> init</span>
      <span><b>02</b> analyze</span>
      <span><b>03</b> check</span>
      <span><b>04</b> fix --dry-run</span>
    </div>
  </article>`,
  code: `export const workflow = [
  { step: "01", command: "npx @wess2001/component-vault@latest init", label: "Initialize" },
  { step: "02", command: "npx component-vault analyze", label: "Analyze" },
  { step: "03", command: "npx component-vault check --base origin/master", label: "Validate" },
  { step: "04", command: "npx component-vault fix --dry-run", label: "Preview fixes" },
];`,
  styles: `.cli-workflow-preview {
  min-height: 210px;
  padding: 22px;
  border-radius: 24px;
  background: #111421;
  color: #dce1f2;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  box-shadow: 0 24px 70px rgba(23, 26, 43, .18);
}
.cli-workflow-head { display:flex; justify-content:space-between; color:#8f96aa; font-size:11px; letter-spacing:.12em; }
.cli-workflow-title { margin-top:22px; max-width:420px; font-family:Inter,system-ui,sans-serif; font-size:24px; font-weight:700; line-height:1.05; letter-spacing:-.04em; color:#fff; }
.cli-workflow-steps { margin-top:24px; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
.cli-workflow-steps span { border:1px solid rgba(255,255,255,.08); border-radius:12px; padding:9px 10px; background:rgba(255,255,255,.025); font-size:11px; }
.cli-workflow-steps b { color:#63d6a6; margin-right:7px; }`,
  usageCode: `import { workflow } from "./cli-governance-workflow";

workflow.forEach(({ command, label }) => {
  console.log(label, command);
});`,
  notes: "Use this component when documenting or presenting the recommended Component Vault CLI adoption flow. Brownfield repositories can run `npx component-vault baseline` before enforcement.",
  tokens: [
    { id: "cli-bg", type: "color", name: "cli.background", value: "#111421" },
    { id: "cli-text", type: "color", name: "cli.text", value: "#DCE1F2" },
    { id: "cli-success", type: "color", name: "cli.success", value: "#63D6A6" },
    { id: "cli-radius", type: "radius", name: "cli.radius", value: "24px" },
  ],
  usage: [
    {
      id: "usage-component-vault-docs",
      projectName: "Component Vault",
      location: "CLI onboarding / governance documentation",
      url: "/vault/cli",
      count: 1,
    },
  ],
  props: {
    variant: "Reference",
    size: "Large",
    state: "Default",
    iconLeft: false,
    iconRight: false,
    fullWidth: true,
    disabled: false,
    loading: false,
  },
};
