import type { VaultComponent } from "@/types/vault";

type UIReference = {
  id: string;
  name: string;
  category: VaultComponent["category"];
  description: string;
  tags: string[];
  source: string;
};

const references: UIReference[] = [
  { id: "shadcn-dialog", name: "Dialog / Composable", category: "Surfaces", description: "Composable modal pattern with explicit parts, keyboard behavior and controlled state.", tags: ["shadcn", "dialog", "composition", "a11y"], source: "shadcn-ui/ui" },
  { id: "shadcn-command", name: "Command / Palette", category: "Navigation", description: "Keyboard-first command surface for search, navigation and actions.", tags: ["shadcn", "command", "keyboard", "search"], source: "shadcn-ui/ui" },
  { id: "radix-popover", name: "Popover / Primitive", category: "Surfaces", description: "Anchored overlay primitive with focus management and collision-aware positioning.", tags: ["radix", "popover", "overlay", "a11y"], source: "radix-ui/primitives" },
  { id: "radix-tooltip", name: "Tooltip / Primitive", category: "Feedback", description: "Accessible contextual hint with trigger, delay and keyboard semantics.", tags: ["radix", "tooltip", "a11y", "interaction"], source: "radix-ui/primitives" },
  { id: "storybook-controls", name: "Controls / Component Playground", category: "Utilities", description: "Interactive control surface for changing component props and viewing states.", tags: ["storybook", "controls", "props", "testing"], source: "storybookjs/storybook" },
  { id: "storybook-states", name: "States / Visual Review", category: "Data Display", description: "Structured preview of component states for review and regression checks.", tags: ["storybook", "states", "visual", "testing"], source: "storybookjs/storybook" },
  { id: "vuetify-data-table", name: "Data Table / Dense", category: "Data Display", description: "Data-heavy table pattern with sorting, selection, pagination and density controls.", tags: ["vuetify", "table", "data", "pagination"], source: "vuetifyjs/vuetify" },
  { id: "vuetify-navigation-drawer", name: "Navigation / Drawer", category: "Navigation", description: "Responsive navigation rail that collapses between desktop and mobile layouts.", tags: ["vuetify", "drawer", "navigation", "responsive"], source: "vuetifyjs/vuetify" },
  { id: "semantic-input", name: "Forms / Semantic Input", category: "Forms", description: "Structured form control pattern with labels, validation and clear input affordances.", tags: ["semantic-ui", "forms", "validation", "input"], source: "Semantic-Org/Semantic-UI" },
  { id: "semantic-message", name: "Feedback / Message", category: "Feedback", description: "Contextual message pattern for status, warnings, errors and confirmation.", tags: ["semantic-ui", "message", "feedback", "status"], source: "Semantic-Org/Semantic-UI" },
  { id: "blueprint-datepicker", name: "Date Picker / Dense", category: "Forms", description: "Desktop-oriented date selection pattern for operational interfaces.", tags: ["blueprint", "date", "picker", "forms"], source: "palantir/blueprint" },
  { id: "blueprint-tree", name: "Tree / Hierarchical", category: "Data Display", description: "Hierarchical navigation pattern for large structured datasets.", tags: ["blueprint", "tree", "hierarchy", "navigation"], source: "palantir/blueprint" },
  { id: "recharts-line", name: "Chart / Time Series", category: "Charts", description: "Composable line chart pattern for trends, deltas and time-series data.", tags: ["recharts", "chart", "line", "analytics"], source: "recharts/recharts" },
  { id: "recharts-composed", name: "Chart / Composed", category: "Charts", description: "Mixed visualization pattern combining bars, lines and reference data.", tags: ["recharts", "chart", "composed", "analytics"], source: "recharts/recharts" },
  { id: "coss-field", name: "Field / Compound Form", category: "Forms", description: "Compound form field composition with label, description, control and validation parts.", tags: ["coss", "field", "forms", "a11y"], source: "cosscom/coss" },
  { id: "coss-navigation", name: "Navigation / Sidebar", category: "Navigation", description: "Application navigation pattern optimized for dense product shells.", tags: ["coss", "sidebar", "navigation", "app-shell"], source: "cosscom/coss" },
  { id: "base-ui-combobox", name: "Combobox / Accessible", category: "Forms", description: "Autocomplete and selection pattern with keyboard-first interaction.", tags: ["base-ui", "combobox", "keyboard", "a11y"], source: "mui/base-ui" },
  { id: "base-ui-select", name: "Select / Primitive", category: "Forms", description: "Unstyled select composition with controlled state and accessible interaction.", tags: ["base-ui", "select", "unstyled", "a11y"], source: "mui/base-ui" },
  { id: "base-ui-toolbar", name: "Toolbar / Composable", category: "Utilities", description: "Keyboard-navigable toolbar for grouped actions and formatting controls.", tags: ["base-ui", "toolbar", "keyboard", "composition"], source: "mui/base-ui" },
];

export const uiReferenceComponents: VaultComponent[] = references.map((reference, index) => ({
  id: `reference-${reference.id}`,
  name: reference.name,
  slug: `reference-${reference.id}`,
  description: reference.description,
  category: reference.category,
  framework: "React",
  language: "tsx",
  version: "reference",
  userId: "reference-catalog",
  isPublic: true,
  isFavorite: false,
  updatedAt: "2026-08-14T00:00:00.000Z",
  tags: [...reference.tags, "ui-reference"],
  previewHtml: `<article class="vault-feature-preview"><span>${reference.source}</span><strong>${reference.name}</strong><small>${reference.description}</small></article>`,
  code: `// Original Component Vault reference implementation\n// Source pattern: ${reference.source}\n\nexport function ${reference.id.replace(/(^|-)([a-z])/g, (_, __, letter: string) => letter.toUpperCase())}() {\n  return null;\n}`,
  styles: ".vault-reference { border-radius: 16px; border: 1px solid #e4e7ef; background: #fff; }",
  usageCode: `<${reference.id.replace(/(^|-)([a-z])/g, (_, __, letter: string) => letter.toUpperCase())} />`,
  notes: `Reference pattern inspired by ${reference.source}. This catalog stores an original Component Vault implementation concept, not copied source code.`,
  tokens: [],
  usage: [],
  props: { variant: "Primary", size: "Medium", state: "Default", iconLeft: false, iconRight: false, fullWidth: false, disabled: false, loading: false },
  collectionIds: ["ui-references"],
}));
