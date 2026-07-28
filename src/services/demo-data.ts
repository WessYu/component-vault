import { interactiveExperiences } from "@/components/experiences/experience-data";
import type { Collection, DesignToken, VaultComponent } from "@/types/vault";

const sharedTokens: DesignToken[] = [
  { id: "token-primary", type: "color", name: "accent.primary", value: "#6366F1" },
  { id: "token-blue", type: "color", name: "category.dataDisplay", value: "#4C8DFF" },
  { id: "token-radius", type: "radius", name: "radius.card", value: "16px" },
  { id: "token-shadow", type: "shadow", name: "shadow.panel", value: "0 20px 70px rgba(23, 26, 43, .08)" },
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

type FeatureBlueprint = {
  id: string;
  name: string;
  category: VaultComponent["category"];
  description: string;
  tags: string[];
  previewLabel: string;
  accent: string;
  secondary: string;
};

const featureBlueprints: FeatureBlueprint[] = [
  { id: "animated-save-button", name: "Button / Animated Save", category: "Buttons", description: "Save action with loading, success feedback and press animation.", tags: ["button", "motion", "save"], previewLabel: "Save", accent: "#6366F1", secondary: "#51C89B" },
  { id: "destructive-confirm-button", name: "Button / Destructive Confirm", category: "Buttons", description: "Two-step destructive action with clear danger state.", tags: ["button", "danger", "confirm"], previewLabel: "Delete", accent: "#FF7664", secondary: "#F1BE48" },
  { id: "floating-action-button", name: "Button / Floating Action", category: "Buttons", description: "Compact floating action for creation-heavy workspaces.", tags: ["button", "floating", "create"], previewLabel: "+", accent: "#171A2B", secondary: "#6366F1" },
  { id: "segmented-toolbar", name: "Toolbar / Segmented", category: "Navigation", description: "Segmented toolbar for switching editing modes without layout shift.", tags: ["toolbar", "segmented", "mode"], previewLabel: "Design Code Preview", accent: "#6366F1", secondary: "#9A78FF" },
  { id: "command-palette-trigger", name: "Search / Command Trigger", category: "Navigation", description: "Keyboard-friendly command entry with shortcut affordance.", tags: ["search", "command", "keyboard"], previewLabel: "Search...", accent: "#4C8DFF", secondary: "#6366F1" },
  { id: "breadcrumb-trail", name: "Navigation / Breadcrumb Trail", category: "Navigation", description: "Compact breadcrumb for nested vault routes and detail pages.", tags: ["breadcrumb", "nav", "routing"], previewLabel: "Vault / Components / Button", accent: "#51C89B", secondary: "#4C8DFF" },
  { id: "admin-side-rail", name: "Navigation / Admin Side Rail", category: "Navigation", description: "Role-aware rail for owner workflows, settings and publishing.", tags: ["admin", "nav", "role"], previewLabel: "Admin", accent: "#171A2B", secondary: "#6366F1" },
  { id: "kanban-review-lane", name: "Board / Review Lane", category: "Data Display", description: "Review lane for draft, approved and shipped component states.", tags: ["kanban", "review", "admin"], previewLabel: "Review Lane", accent: "#F1BE48", secondary: "#51C89B" },
  { id: "audit-log-row", name: "Log / Audit Row", category: "Data Display", description: "Timeline row for admin changes, actor, target and timestamp.", tags: ["audit", "log", "admin"], previewLabel: "Saved by Owner", accent: "#171A2B", secondary: "#51C89B" },
  { id: "usage-meter-card", name: "Card / Usage Meter", category: "Cards", description: "Meter card for component adoption, usage and health signals.", tags: ["metric", "usage", "health"], previewLabel: "82% adopted", accent: "#51C89B", secondary: "#6366F1" },
  { id: "token-drift-alert", name: "Alert / Token Drift", category: "Feedback", description: "Warning banner for token drift and design-system inconsistencies.", tags: ["alert", "tokens", "drift"], previewLabel: "Token drift", accent: "#F1BE48", secondary: "#FF7664" },
  { id: "success-toast-stack", name: "Toast / Success Stack", category: "Feedback", description: "Stacked toast pattern with reduced-motion safe entry.", tags: ["toast", "success", "motion"], previewLabel: "Saved", accent: "#51C89B", secondary: "#4C8DFF" },
  { id: "error-inline-callout", name: "Callout / Inline Error", category: "Feedback", description: "Inline validation callout with action recovery.", tags: ["error", "validation", "form"], previewLabel: "Fix required", accent: "#FF7664", secondary: "#171A2B" },
  { id: "empty-state-panel", name: "Panel / Empty State", category: "Surfaces", description: "Useful empty state with primary action and supporting context.", tags: ["empty", "panel", "onboarding"], previewLabel: "Create first item", accent: "#6366F1", secondary: "#E978D4" },
  { id: "inspector-drawer", name: "Drawer / Inspector", category: "Surfaces", description: "Right-side inspector drawer for props, tokens and notes.", tags: ["drawer", "inspector", "props"], previewLabel: "Inspector", accent: "#171A2B", secondary: "#9A78FF" },
  { id: "release-modal", name: "Modal / Release Checklist", category: "Surfaces", description: "Checklist modal for release readiness and approvals.", tags: ["modal", "release", "checklist"], previewLabel: "Ready to ship", accent: "#51C89B", secondary: "#F1BE48" },
  { id: "property-editor-field", name: "Input / Property Editor", category: "Forms", description: "Dense property editor field for component variants.", tags: ["input", "props", "editor"], previewLabel: "Variant", accent: "#6366F1", secondary: "#4C8DFF" },
  { id: "token-picker-field", name: "Input / Token Picker", category: "Forms", description: "Searchable token picker for color, radius and spacing values.", tags: ["input", "tokens", "picker"], previewLabel: "accent.primary", accent: "#9A78FF", secondary: "#E978D4" },
  { id: "inline-edit-title", name: "Input / Inline Edit Title", category: "Forms", description: "Inline title editing with save, cancel and focus states.", tags: ["input", "inline", "edit"], previewLabel: "Component name", accent: "#4C8DFF", secondary: "#51C89B" },
  { id: "toggle-preferences", name: "Control / Preferences Toggle", category: "Forms", description: "Accessible toggle row for workspace preferences.", tags: ["toggle", "settings", "a11y"], previewLabel: "Autosave", accent: "#51C89B", secondary: "#171A2B" },
  { id: "theme-swatch-grid", name: "Swatches / Theme Grid", category: "Utilities", description: "Color swatch grid with selected, hover and copied states.", tags: ["swatch", "theme", "tokens"], previewLabel: "Theme", accent: "#6366F1", secondary: "#F1BE48" },
  { id: "avatar-group", name: "Avatar / Team Group", category: "Utilities", description: "Compact collaborator avatars for review and ownership surfaces.", tags: ["avatar", "team", "review"], previewLabel: "WC +3", accent: "#FF7664", secondary: "#6366F1" },
  { id: "keyboard-hint-chip", name: "Chip / Keyboard Hint", category: "Utilities", description: "Shortcut chip for power-user actions and command menus.", tags: ["shortcut", "keyboard", "chip"], previewLabel: "Ctrl K", accent: "#171A2B", secondary: "#4C8DFF" },
  { id: "copy-code-block", name: "Code / Copy Block", category: "Utilities", description: "Code block shell with copy state and filename tab.", tags: ["code", "copy", "developer"], previewLabel: "Component.tsx", accent: "#171A2B", secondary: "#51C89B" },
  { id: "line-chart-card", name: "Chart / Line Card", category: "Charts", description: "Compact trend chart for adoption and usage deltas.", tags: ["chart", "line", "usage"], previewLabel: "Trend", accent: "#4C8DFF", secondary: "#51C89B" },
  { id: "donut-health-chart", name: "Chart / Health Donut", category: "Charts", description: "Donut status chart for component quality checks.", tags: ["chart", "health", "quality"], previewLabel: "96%", accent: "#51C89B", secondary: "#F1BE48" },
  { id: "bar-compare-chart", name: "Chart / Compare Bars", category: "Charts", description: "Bar comparison pattern for category counts and usage.", tags: ["chart", "bar", "compare"], previewLabel: "Bars", accent: "#6366F1", secondary: "#E978D4" },
  { id: "scroll-reveal-section", name: "Motion / Scroll Reveal Section", category: "Motion Experiences", description: "Section reveal with staggered children and reduced-motion fallback.", tags: ["motion", "scroll", "reveal"], previewLabel: "Reveal", accent: "#6366F1", secondary: "#9A78FF" },
  { id: "magnetic-card-hover", name: "Motion / Magnetic Card Hover", category: "Motion Experiences", description: "Pointer-aware card motion for desktop interactions.", tags: ["motion", "hover", "magnetic"], previewLabel: "Magnetic", accent: "#4C8DFF", secondary: "#51C89B" },
  { id: "shared-layout-tabs", name: "Motion / Shared Layout Tabs", category: "Motion Experiences", description: "Tabs with animated active indicator and stable sizing.", tags: ["motion", "tabs", "layout"], previewLabel: "Tabs", accent: "#9A78FF", secondary: "#E978D4" },
  { id: "route-progress-bar", name: "Motion / Route Progress Bar", category: "Motion Experiences", description: "Top progress animation for route transitions.", tags: ["motion", "route", "progress"], previewLabel: "Progress", accent: "#6366F1", secondary: "#E978D4" },
  { id: "spring-drawer", name: "Motion / Spring Drawer", category: "Motion Experiences", description: "Drawer entrance with spring timing and focus return.", tags: ["motion", "drawer", "spring"], previewLabel: "Drawer", accent: "#171A2B", secondary: "#6366F1" },
  { id: "count-up-stat", name: "Motion / Count Up Stat", category: "Motion Experiences", description: "Animated number change for dashboard metrics.", tags: ["motion", "metric", "count"], previewLabel: "1,248", accent: "#51C89B", secondary: "#4C8DFF" },
  { id: "hover-preview-lift", name: "Motion / Preview Lift", category: "Motion Experiences", description: "Preview card lift with shadow and scale restraint.", tags: ["motion", "preview", "hover"], previewLabel: "Lift", accent: "#F1BE48", secondary: "#6366F1" },
  { id: "focus-ring-pulse", name: "Motion / Focus Ring Pulse", category: "Motion Experiences", description: "Accessible focus pulse for keyboard navigation.", tags: ["motion", "focus", "a11y"], previewLabel: "Focus", accent: "#4C8DFF", secondary: "#171A2B" },
  { id: "staggered-list", name: "Motion / Staggered List", category: "Motion Experiences", description: "List reveal pattern for search results and rows.", tags: ["motion", "list", "stagger"], previewLabel: "List", accent: "#6366F1", secondary: "#51C89B" },
  { id: "loading-skeleton", name: "Motion / Loading Skeleton", category: "Motion Experiences", description: "Skeleton shimmer with low-contrast motion.", tags: ["motion", "loading", "skeleton"], previewLabel: "Loading", accent: "#E4E7EF", secondary: "#9A9FB1" },
  { id: "reorder-handle-row", name: "Motion / Reorder Handle Row", category: "Motion Experiences", description: "Drag-friendly row with handle, lift and drop states.", tags: ["motion", "reorder", "drag"], previewLabel: "Drag", accent: "#171A2B", secondary: "#F1BE48" },
  { id: "spotlight-card", name: "Motion / Spotlight Card", category: "Motion Experiences", description: "Pointer spotlight card for premium component showcases.", tags: ["motion", "spotlight", "card"], previewLabel: "Spotlight", accent: "#9A78FF", secondary: "#6366F1" },
  { id: "admin-sync-badge", name: "Badge / Admin Sync", category: "Feedback", description: "Live sync badge for backend state and save activity.", tags: ["badge", "sync", "admin"], previewLabel: "Synced", accent: "#51C89B", secondary: "#171A2B" },
];

const featureComponents = featureBlueprints.map((feature, index) =>
  makeComponent({
    id: `feature-${feature.id}`,
    name: feature.name,
    slug: `feature-${feature.id}`,
    description: feature.description,
    category: feature.category,
    framework: "React",
    language: "tsx",
    version: `v1.${index % 4}.0`,
    isFavorite: index % 11 === 0,
    updatedAt: `2026-07-28T${String(8 + Math.floor(index / 4)).padStart(2, "0")}:${String((index % 4) * 12).padStart(2, "0")}:00.000Z`,
    tags: feature.tags,
    previewHtml: `<article class="vault-feature-preview" style="--accent:${feature.accent};--secondary:${feature.secondary}"><span>${feature.category}</span><strong>${feature.previewLabel}</strong><small>${feature.tags.slice(0, 2).join(" / ")}</small></article>`,
    code: `export function ${feature.id.replace(/(^|-)([a-z])/g, (_, __, letter: string) => letter.toUpperCase())}() {
  return (
    <article className="vault-feature-preview">
      <span>${feature.category}</span>
      <strong>${feature.previewLabel}</strong>
      <small>${feature.description}</small>
    </article>
  );
}`,
    styles: `.vault-feature-preview {
  display: grid;
  gap: 8px;
  width: 220px;
  min-height: 132px;
  padding: 18px;
  border: 1px solid #e4e7ef;
  border-radius: 22px;
  background: linear-gradient(135deg, var(--accent, #6366f1), var(--secondary, #51c89b));
  color: #ffffff;
  box-shadow: 0 20px 54px rgba(23, 26, 43, .12);
}`,
    usageCode: `<${feature.id.replace(/(^|-)([a-z])/g, (_, __, letter: string) => letter.toUpperCase())} />`,
    notes: `${feature.description} Includes hover, focus, responsive sizing and reduced-motion guidance.`,
  }),
);

export const demoComponents: VaultComponent[] = [
  makeComponent({
    id: "button-primary",
    name: "Button / Primary",
    slug: "button-primary",
    description: "Primary action button with clear hierarchy, responsive sizing and accessible focus states.",
    category: "Buttons",
    framework: "React",
    language: "tsx",
    version: "v1.3.2",
    isFavorite: true,
    updatedAt: "2026-07-24T14:25:00.000Z",
    tags: ["action", "form", "a11y"],
    previewHtml: '<button class="vault-button">Button</button>',
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
    <button className={["vault-button", variant, size].join(" ")} disabled={isLoading}>
      {isLoading ? "Loading..." : children}
    </button>
  );
}`,
    styles: `.vault-button {
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid transparent;
  border-radius: 14px;
  background: #6366f1;
  color: #ffffff;
  box-shadow: 0 14px 34px rgba(99, 102, 241, .28);
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
    previewHtml: '<article class="vault-stat"><span>Monthly Revenue</span><strong>$24,780</strong><small>+12.5%</small><svg viewBox="0 0 120 34"><path d="M1 27 L14 23 L27 26 L40 18 L54 23 L67 13 L80 16 L94 8 L109 13 L119 5" /></svg></article>',
    code: `export function StatCard() {
  return (
    <article className="vault-stat" aria-label="Monthly revenue up 12.5 percent">
      <span>Monthly Revenue</span>
      <strong>$24,780</strong>
      <small>+12.5%</small>
    </article>
  );
}`,
    styles: `.vault-stat {
  width: 220px;
  padding: 18px;
  border: 1px solid #e4e7ef;
  border-radius: 22px;
  background: #ffffff;
  box-shadow: 0 18px 60px rgba(23, 26, 43, .08);
}`,
    usageCode: `<StatCard label="Monthly Revenue" value="$24,780" change="+12.5%" />`,
    notes: "Designed for financial or operational deltas. Do not use more than four in a dense row on tablet.",
  }),
  makeComponent({
    id: "input-text-field",
    name: "Input / Text Field",
    slug: "input-text-field",
    description: "Text input with visible label, helper copy and polished validation states.",
    category: "Forms",
    framework: "React",
    language: "tsx",
    version: "v1.2.1",
    isFavorite: false,
    updatedAt: "2026-07-19T16:02:00.000Z",
    tags: ["form", "input"],
    previewHtml: '<label class="vault-field"><span>Name</span><input placeholder="Placeholder text" /></label>',
    code: `export function TextField() {
  return (
    <label className="vault-field">
      <span>Name</span>
      <input placeholder="Placeholder text" />
    </label>
  );
}`,
    styles: `.vault-field { display: grid; gap: 6px; width: 220px; }
.vault-field input {
  min-height: 42px;
  border: 1px solid #e4e7ef;
  border-radius: 14px;
  background: #f7f8fc;
  padding: 0 12px;
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
    previewHtml: '<table class="vault-table"><thead><tr><th>Customer</th><th>Status</th><th>Value</th></tr></thead><tbody><tr><td>Acme Corp.</td><td>Active</td><td>$12,430</td></tr><tr><td>Globex Inc.</td><td>Pending</td><td>$8,210</td></tr></tbody></table>',
    code: `export function DataGrid({ rows }: { rows: Array<{ customer: string; status: string; value: string }> }) {
  return (
    <table className="vault-table">
      <thead><tr><th>Customer</th><th>Status</th><th>Value</th></tr></thead>
      <tbody>{rows.map((row) => <tr key={row.customer}><td>{row.customer}</td><td>{row.status}</td><td>{row.value}</td></tr>)}</tbody>
    </table>
  );
}`,
    styles: `.vault-table { min-width: 420px; overflow: hidden; border-collapse: collapse; border-radius: 18px; background: #ffffff; }
.vault-table th, .vault-table td { border-bottom: 1px solid #e4e7ef; padding: 12px 14px; text-align: left; }`,
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
    previewHtml: '<div class="vault-alert">This is a warning message with details.</div>',
    code: `export function WarningAlert() {
  return <div role="status" className="vault-alert">This is a warning message with details.</div>;
}`,
    styles: `.vault-alert {
  border: 1px solid #fed7aa;
  border-radius: 16px;
  background: #fff7ed;
  color: #9a3412;
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
    previewHtml: '<section class="vault-modal"><button aria-label="Close">x</button><h3>Modal Title</h3><p>Confirm this vault action?</p><footer>Continue</footer></section>',
    code: `export function CenteredModal() {
  return (
    <section role="dialog" aria-modal="true" aria-labelledby="modal-title" className="vault-modal">
      <button aria-label="Close">x</button>
      <h3 id="modal-title">Modal Title</h3>
      <p>Confirm this vault action?</p>
    </section>
  );
}`,
    styles: `.vault-modal {
  width: 260px;
  padding: 18px;
  border: 1px solid #e4e7ef;
  border-radius: 22px;
  background: #ffffff;
  box-shadow: 0 24px 80px rgba(23, 26, 43, .12);
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
    previewHtml: '<nav class="vault-nav"><b>CV</b><a>Docs</a><a>Vault</a><a>Tokens</a></nav>',
    code: `export function FloatingNavbar() {
  return <nav className="vault-nav" aria-label="Primary"><b>CV</b><a>Docs</a><a>Vault</a><a>Tokens</a></nav>;
}`,
    styles: `.vault-nav { display: flex; gap: 18px; align-items: center; padding: 10px 14px; border: 1px solid #e4e7ef; border-radius: 999px; background: #ffffff; box-shadow: 0 16px 50px rgba(23, 26, 43, .08); }`,
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
    previewHtml: '<div class="vault-tabs"><button data-active="true">Props</button><button>Notes</button><button>Tokens</button></div>',
    code: `export function Tabs() {
  return <div role="tablist" className="vault-tabs"><button role="tab" aria-selected>Props</button><button role="tab">Notes</button><button role="tab">Tokens</button></div>;
}`,
    styles: `.vault-tabs { display: inline-flex; gap: 4px; padding: 4px; border: 1px solid #e4e7ef; border-radius: 16px; background: #f7f8fc; }
.vault-tabs button { border: 0; border-radius: 12px; background: transparent; padding: 8px 12px; }`,
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
    previewHtml: '<div class="vault-profile"><span>WC</span><strong>Wesley Cruz</strong><small>Owner</small></div>',
    code: `export function CompactProfile() {
  return <div className="vault-profile"><span>WC</span><strong>Wesley Cruz</strong><small>Owner</small></div>;
}`,
    styles: `.vault-profile { display: grid; grid-template-columns: 38px 1fr; gap: 2px 10px; align-items: center; }
.vault-profile span { grid-row: span 2; display: grid; place-items: center; width: 38px; height: 38px; border-radius: 14px; background: #6366f1; color: #ffffff; }`,
    usageCode: `<CompactProfile user={session.user} />`,
    notes: "Initials need accessible full names. Use real avatars only when they add recognition.",
  }),
  makeComponent({
    id: "pricing-card",
    name: "Pricing Card",
    slug: "pricing-card",
    description: "Interactive pricing card for subscription tiers, benefits, billing period and highlighted CTAs.",
    category: "Cards",
    framework: "React",
    language: "tsx",
    version: "v1.0.0",
    isFavorite: true,
    updatedAt: "2026-07-15T11:15:00.000Z",
    tags: ["pricing", "marketing"],
    previewHtml: '<article class="vault-pricing"><p>Pro</p><strong>$19</strong><ul><li>Unlimited components</li><li>Private collections</li></ul></article>',
    code: `export function ProPricing() {
  return <article className="vault-pricing"><p>Pro</p><strong>$19</strong><ul><li>Unlimited components</li><li>Private collections</li></ul></article>;
}`,
    styles: `.vault-pricing { width: 240px; padding: 20px; border: 1px solid #e4e7ef; border-radius: 24px; background: #ffffff; box-shadow: 0 24px 80px rgba(23, 26, 43, .12); }
.vault-pricing strong { display: block; font-size: 38px; margin: 6px 0; }`,
    usageCode: `<PricingCard tier="Pro" price={19} highlighted />`,
    notes: "Keep the plan name literal. Do not hide billing cadence near the price.",
  }),
  ...featureComponents,
  ...interactiveExperiences.map((experience) =>
    makeComponent({
      id: experience.slug,
      name: experience.name,
      slug: experience.slug,
      description: experience.description,
      category: "Motion Experiences",
      framework: "React",
      language: "tsx",
      version: experience.version,
      isFavorite: experience.slug === "project-chapter-scroll" || experience.slug === "card-stack-navigator",
      updatedAt: "2026-07-27T12:00:00.000Z",
      tags: ["motion", "scroll", "navigation", "interaction"],
      previewHtml: `<div class="vault-motion-preview">${experience.shortName}</div>`,
      code: experience.code,
      styles: `.vault-motion-preview { border: 1px solid #e4e7ef; border-radius: 24px; background: linear-gradient(135deg, ${experience.accent}, ${experience.secondary}); color: #ffffff; padding: 28px; font-weight: 700; }`,
      usageCode: `<${experience.name.replace(/[^A-Za-z]/g, "")} items={items} />`,
      notes: experience.docs.join(" "),
    }),
  ),
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
    componentIds: ["navbar-floating", "pricing-card", "card-stats"],
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
  {
    id: "motion-experiences",
    name: "Motion Experiences",
    description: "Complete navigation, scroll and shared-transition patterns for interactive product storytelling.",
    componentIds: interactiveExperiences.map((experience) => experience.slug),
    updatedAt: "2026-07-27T12:00:00.000Z",
  },
  {
    id: "ui-motion-expansion",
    name: "UI + Motion Expansion",
    description: "Forty additional admin, UI, animation, chart, form and feedback patterns for the component vault.",
    componentIds: featureComponents.map((component) => component.id),
    updatedAt: "2026-07-28T14:30:00.000Z",
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
  "Motion Experiences",
] as const;

export const filterGroups = ["All Components", "Layout", "Input", "Data", "Feedback", "Navigation"] as const;



