import type { Collection, DesignToken, VaultComponent } from "@/types/vault";

const sharedTokens: DesignToken[] = [
  { id: "token-orange", type: "color", name: "accent.orange", value: "#DE572F" },
  { id: "token-navy", type: "color", name: "ink.navy", value: "#243F5E" },
  { id: "token-radius", type: "radius", name: "radius.control", value: "6px" },
  { id: "token-shadow", type: "shadow", name: "shadow.press", value: "2px 2px 0 #3E3B34" },
];

const usage = [
  {
    id: "usage-dashboard",
    projectName: "Admin Console",
    location: "src/app/dashboard/overview.tsx",
    url: "/projects/admin-console",
    count: 8,
  },
  {
    id: "usage-market",
    projectName: "Marketing Site",
    location: "src/sections/pricing.tsx",
    url: "/projects/marketing-site",
    count: 3,
  },
];

function makeComponent(input: Omit<VaultComponent, "userId" | "tokens" | "usage" | "props" | "collectionIds" | "isPublic">): VaultComponent {
  return {
    ...input,
    userId: "demo-user",
    isPublic: false,
    collectionIds: input.category === "Buttons" ? ["core-library", "dashboard-ui"] : ["core-library"],
    tokens: sharedTokens,
    usage,
    props: {
      variant: input.name.includes("Danger") ? "Danger" : "Primary",
      size: "Medium",
      state: "Default",
      iconLeft: false,
      iconRight: false,
      fullWidth: false,
      disabled: false,
      loading: false,
    },
  };
}

export const demoComponents: VaultComponent[] = [
  makeComponent({
    id: "button-primary",
    name: "Button / Primary",
    slug: "button-primary",
    description: "Primary action button with pressed-state bevel and accessible focus ring.",
    category: "Buttons",
    framework: "React",
    language: "tsx",
    version: "v1.3.2",
    isFavorite: true,
    updatedAt: "2026-07-24T14:25:00.000Z",
    tags: ["action", "form", "a11y"],
    previewHtml: '<button class="cv-button">Button</button>',
    code: `type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
}: ButtonProps) {
  return (
    <button className={["cv-button", variant, size].join(" ")} disabled={isLoading}>
      {isLoading ? "Loading..." : children}
    </button>
  );
}`,
    styles: `.cv-button {
  min-height: 38px;
  padding: 0 18px;
  border: 2px solid;
  border-color: #f4f0e5 #3e3b34 #3e3b34 #f4f0e5;
  background: #243f5e;
  color: #ece8dc;
  box-shadow: 2px 2px 0 rgba(62, 59, 52, .38);
  font-weight: 700;
}`,
    usageCode: `<Button variant="primary">Save component</Button>`,
    notes: "Use for one primary action per surface. Keep label short and pair destructive actions with confirmation.",
  }),
  makeComponent({
    id: "card-stats",
    name: "Card / Stats",
    slug: "card-stats",
    description: "Compact analytics card for dashboard metrics.",
    category: "Cards",
    framework: "React",
    language: "tsx",
    version: "v1.1.0",
    isFavorite: false,
    updatedAt: "2026-07-22T09:15:00.000Z",
    tags: ["metric", "dashboard"],
    previewHtml: '<article class="cv-stat"><span>Monthly Revenue</span><strong>$24,780</strong><small>+12.5%</small><svg viewBox="0 0 120 34"><path d="M1 27 L14 23 L27 26 L40 18 L54 23 L67 13 L80 16 L94 8 L109 13 L119 5" /></svg></article>',
    code: `export function StatCard() {
  return (
    <article className="cv-stat" aria-label="Monthly revenue up 12.5 percent">
      <span>Monthly Revenue</span>
      <strong>$24,780</strong>
      <small>+12.5%</small>
    </article>
  );
}`,
    styles: `.cv-stat {
  width: 220px;
  padding: 16px;
  background: #ece8dc;
  border: 1px solid #918b7b;
  box-shadow: 2px 2px 0 rgba(62, 59, 52, .22);
}`,
    usageCode: `<StatCard label="Monthly Revenue" value="$24,780" change="+12.5%" />`,
    notes: "Designed for financial or operational deltas. Do not use more than four in a dense row on tablet.",
  }),
  makeComponent({
    id: "input-text-field",
    name: "Input / Text Field",
    slug: "input-text-field",
    description: "Text input with label, helper copy and retro inset treatment.",
    category: "Forms",
    framework: "React",
    language: "tsx",
    version: "v1.2.1",
    isFavorite: false,
    updatedAt: "2026-07-19T16:02:00.000Z",
    tags: ["form", "input"],
    previewHtml: '<label class="cv-field"><span>Name</span><input placeholder="Placeholder text" /></label>',
    code: `export function TextField() {
  return (
    <label className="cv-field">
      <span>Name</span>
      <input placeholder="Placeholder text" />
    </label>
  );
}`,
    styles: `.cv-field { display: grid; gap: 6px; width: 220px; }
.cv-field input {
  border: 2px solid;
  border-color: #3e3b34 #f4f0e5 #f4f0e5 #3e3b34;
  background: #f7f2e7;
  padding: 9px 10px;
}`,
    usageCode: `<TextField label="Name" placeholder="Placeholder text" />`,
    notes: "Always render visible labels. Reserve placeholder text for examples, never as the only label.",
  }),
  makeComponent({
    id: "table-data-grid",
    name: "Table / Data Grid",
    slug: "table-data-grid",
    description: "Dense table with status badges and right-aligned numeric values.",
    category: "Data Display",
    framework: "React",
    language: "tsx",
    version: "v2.0.0",
    isFavorite: true,
    updatedAt: "2026-07-23T12:33:00.000Z",
    tags: ["table", "data", "admin"],
    previewHtml: '<table class="cv-table"><thead><tr><th>Customer</th><th>Status</th><th>Value</th></tr></thead><tbody><tr><td>Acme Corp.</td><td>Active</td><td>$12,430</td></tr><tr><td>Globex Inc.</td><td>Pending</td><td>$8,210</td></tr></tbody></table>',
    code: `export function DataGrid({ rows }: { rows: Array<{ customer: string; status: string; value: string }> }) {
  return (
    <table className="cv-table">
      <thead><tr><th>Customer</th><th>Status</th><th>Value</th></tr></thead>
      <tbody>{rows.map((row) => <tr key={row.customer}><td>{row.customer}</td><td>{row.status}</td><td>{row.value}</td></tr>)}</tbody>
    </table>
  );
}`,
    styles: `.cv-table { border-collapse: collapse; min-width: 360px; background: #ece8dc; }
.cv-table th, .cv-table td { border-bottom: 1px solid #b8b0a0; padding: 9px 12px; text-align: left; }`,
    usageCode: `<DataGrid rows={customers} />`,
    notes: "Use when scanning and comparing records matters more than illustration. Keep row height predictable.",
  }),
  makeComponent({
    id: "alert-warning",
    name: "Alert / Warning",
    slug: "alert-warning",
    description: "Attention message for recoverable system states.",
    category: "Feedback",
    framework: "React",
    language: "tsx",
    version: "v1.0.3",
    isFavorite: false,
    updatedAt: "2026-07-20T10:46:00.000Z",
    tags: ["warning", "system"],
    previewHtml: '<div class="cv-alert">This is a warning message with details.</div>',
    code: `export function WarningAlert() {
  return <div role="status" className="cv-alert">This is a warning message with details.</div>;
}`,
    styles: `.cv-alert {
  border: 1px solid #d68b31;
  background: #fff4da;
  color: #3e2a10;
  padding: 12px 14px;
}`,
    usageCode: `<WarningAlert>Autosave paused. Check connection.</WarningAlert>`,
    notes: "Use `role=status` for passive warning updates. Use dialogs for blocking confirmations.",
  }),
  makeComponent({
    id: "modal-centered",
    name: "Modal / Centered",
    slug: "modal-centered",
    description: "Compact modal for confirmations and short focused tasks.",
    category: "Surfaces",
    framework: "React",
    language: "tsx",
    version: "v1.1.4",
    isFavorite: false,
    updatedAt: "2026-07-18T13:11:00.000Z",
    tags: ["dialog", "surface"],
    previewHtml: '<section class="cv-modal"><button aria-label="Close">×</button><h3>Modal Title</h3><p>Confirm this vault action?</p><footer>Continue</footer></section>',
    code: `export function CenteredModal() {
  return (
    <section role="dialog" aria-modal="true" aria-labelledby="modal-title" className="cv-modal">
      <button aria-label="Close">×</button>
      <h3 id="modal-title">Modal Title</h3>
      <p>Confirm this vault action?</p>
    </section>
  );
}`,
    styles: `.cv-modal {
  width: 260px;
  padding: 14px;
  background: #ece8dc;
  border: 2px solid;
  border-color: #f4f0e5 #3e3b34 #3e3b34 #f4f0e5;
}`,
    usageCode: `<CenteredModal open onClose={handleClose} />`,
    notes: "Trap focus and return focus to the trigger. Keep confirmation language specific.",
  }),
  makeComponent({
    id: "navbar-floating",
    name: "Navbar / Floating",
    slug: "navbar-floating",
    description: "Floating navigation strip for product pages.",
    category: "Navigation",
    framework: "React",
    language: "tsx",
    version: "v1.4.0",
    isFavorite: true,
    updatedAt: "2026-07-21T08:45:00.000Z",
    tags: ["nav", "marketing"],
    previewHtml: '<nav class="cv-nav"><b>CV</b><a>Docs</a><a>Vault</a><a>Tokens</a></nav>',
    code: `export function FloatingNavbar() {
  return <nav className="cv-nav" aria-label="Primary"><b>CV</b><a>Docs</a><a>Vault</a><a>Tokens</a></nav>;
}`,
    styles: `.cv-nav { display: flex; gap: 18px; align-items: center; padding: 10px 14px; background: #ded9cb; border: 1px solid #918b7b; }`,
    usageCode: `<FloatingNavbar />`,
    notes: "Use on marketing and documentation pages. Keep active location visibly marked.",
  }),
  makeComponent({
    id: "tabs-horizontal",
    name: "Tabs / Horizontal",
    slug: "tabs-horizontal",
    description: "Segmented tabs for dense panels and inspector sections.",
    category: "Navigation",
    framework: "React",
    language: "tsx",
    version: "v1.0.8",
    isFavorite: false,
    updatedAt: "2026-07-17T09:23:00.000Z",
    tags: ["tabs", "panel"],
    previewHtml: '<div class="cv-tabs"><button data-active="true">Props</button><button>Notes</button><button>Tokens</button></div>',
    code: `export function Tabs() {
  return <div role="tablist" className="cv-tabs"><button role="tab" aria-selected>Props</button><button role="tab">Notes</button><button role="tab">Tokens</button></div>;
}`,
    styles: `.cv-tabs { display: flex; background: #c9c4b5; border-bottom: 1px solid #918b7b; }
.cv-tabs button { padding: 8px 12px; border-right: 1px solid #918b7b; }`,
    usageCode: `<Tabs items={["Props", "Notes", "Tokens"]} />`,
    notes: "Use arrow-key navigation in production implementations. Avoid wrapping tab labels.",
  }),
  makeComponent({
    id: "profile-compact",
    name: "Profile / Compact",
    slug: "profile-compact",
    description: "Small user identity block for toolbars and account menus.",
    category: "Utilities",
    framework: "React",
    language: "tsx",
    version: "v1.2.0",
    isFavorite: false,
    updatedAt: "2026-07-16T18:20:00.000Z",
    tags: ["profile", "account"],
    previewHtml: '<div class="cv-profile"><span>WC</span><strong>Wesley Cruz</strong><small>Owner</small></div>',
    code: `export function CompactProfile() {
  return <div className="cv-profile"><span>WC</span><strong>Wesley Cruz</strong><small>Owner</small></div>;
}`,
    styles: `.cv-profile { display: grid; grid-template-columns: 38px 1fr; gap: 2px 10px; align-items: center; }
.cv-profile span { grid-row: span 2; display: grid; place-items: center; background: #243f5e; color: #ece8dc; width: 38px; height: 38px; }`,
    usageCode: `<CompactProfile user={session.user} />`,
    notes: "Initials need accessible full names. Use real avatars only when they add recognition.",
  }),
  makeComponent({
    id: "pricing-pro",
    name: "Pricing / Pro",
    slug: "pricing-pro",
    description: "Pricing block for plans with technical feature lists.",
    category: "Cards",
    framework: "React",
    language: "tsx",
    version: "v1.0.0",
    isFavorite: true,
    updatedAt: "2026-07-15T11:15:00.000Z",
    tags: ["pricing", "marketing"],
    previewHtml: '<article class="cv-pricing"><p>PRO VAULT</p><strong>$19</strong><ul><li>Unlimited components</li><li>Private collections</li></ul></article>',
    code: `export function ProPricing() {
  return <article className="cv-pricing"><p>PRO VAULT</p><strong>$19</strong><ul><li>Unlimited components</li><li>Private collections</li></ul></article>;
}`,
    styles: `.cv-pricing { width: 230px; padding: 16px; background: #ece8dc; border: 2px solid #3e3b34; }
.cv-pricing strong { display: block; font-size: 38px; margin: 6px 0; }`,
    usageCode: `<ProPricing cta="Upgrade Vault" />`,
    notes: "Keep the plan name literal. Do not hide billing cadence near the price.",
  }),
];

export const demoCollections: Collection[] = [
  {
    id: "core-library",
    name: "Core Library",
    description: "Reusable primitives approved for all product surfaces.",
    componentIds: demoComponents.slice(0, 8).map((component) => component.id),
    updatedAt: "2026-07-24T15:30:00.000Z",
  },
  {
    id: "marketing-site",
    name: "Marketing Site",
    description: "Conversion-focused sections used by public pages.",
    componentIds: ["navbar-floating", "pricing-pro", "card-stats"],
    updatedAt: "2026-07-21T10:00:00.000Z",
  },
  {
    id: "dashboard-ui",
    name: "Dashboard UI",
    description: "Operational controls, tables and metrics for internal tools.",
    componentIds: ["button-primary", "card-stats", "table-data-grid", "tabs-horizontal"],
    updatedAt: "2026-07-23T09:30:00.000Z",
  },
  {
    id: "mobile-kit",
    name: "Mobile Kit",
    description: "Touch-friendly variants for compact screens.",
    componentIds: ["button-primary", "input-text-field", "profile-compact"],
    updatedAt: "2026-07-19T12:00:00.000Z",
  },
  {
    id: "admin-console",
    name: "Admin Console",
    description: "Tables, alerts and inspector panels for admin workflows.",
    componentIds: ["table-data-grid", "alert-warning", "modal-centered"],
    updatedAt: "2026-07-20T14:42:00.000Z",
  },
];

export const categories = [
  "All Components",
  "Buttons",
  "Cards",
  "Forms",
  "Navigation",
  "Data Display",
  "Feedback",
  "Surfaces",
  "Charts",
  "Utilities",
] as const;

export const filterGroups = ["All Components", "Layout", "Input", "Data", "Feedback", "Navigation"] as const;
