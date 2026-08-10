"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  Archive,
  BadgeCheck,
  Bolt,
  Box,
  Brush,
  Check,
  ChevronDown,
  Code2,
  Copy,
  Database,
  Eye,
  FileCode2,
  Gauge,
  Grid2X2,
  Heart,
  Layers3,
  ListChecks,
  Loader2,
  Lock,
  PanelRight,
  PenLine,
  Plus,
  RefreshCw,
  Rocket,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { fastMotion, motionEase, Reveal, StaggerGroup, StaggerItem } from "@/components/motion/site-motion";
import { cn } from "@/lib/utils";
import { useVaultStore } from "@/stores/vault-store";
import type { Collection, ComponentCategory, ComponentState, ComponentVariant, VaultComponent } from "@/types/vault";

type ComponentForm = {
  name: string;
  description: string;
  category: ComponentCategory;
  framework: VaultComponent["framework"];
  language: VaultComponent["language"];
  version: string;
  tags: string;
  previewHtml: string;
  code: string;
  styles: string;
  usageCode: string;
  notes: string;
  isPublic: boolean;
  variant: ComponentVariant;
  state: ComponentState;
};

type Template = {
  name: string;
  category: ComponentCategory;
  description: string;
  tags: string;
  previewHtml: string;
  code: string;
  styles: string;
  usageCode: string;
  notes: string;
};

type MotionFeature = {
  label: string;
  group: "Motion" | "UI" | "Editor" | "Admin";
  icon: typeof Sparkles;
};

const categories: ComponentCategory[] = [
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
];

const states: ComponentState[] = ["Default", "Hover", "Focus", "Active", "Disabled", "Loading", "Error"];
const variants: ComponentVariant[] = ["Primary", "Secondary", "Ghost", "Danger", "Success"];

const defaultForm: ComponentForm = {
  name: "Command Bar / Floating",
  description: "Compact command bar with search, contextual actions and account-aware controls.",
  category: "Navigation",
  framework: "React",
  language: "tsx",
  version: "v1.0.0",
  tags: "command, navigation, admin",
  previewHtml: '<div class="vault-nav"><b>CV</b><a>Search</a><a>Actions</a><a>Account</a></div>',
  code: `export function FloatingCommandBar() {
  return (
    <nav className="vault-nav" aria-label="Command bar">
      <b>CV</b>
      <a>Search</a>
      <a>Actions</a>
      <a>Account</a>
    </nav>
  );
}`,
  styles: `.vault-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #e4e7ef;
  border-radius: 999px;
  background: #ffffff;
  padding: 8px 10px;
}`,
  usageCode: "<FloatingCommandBar />",
  notes: "Use for dense app shells where search and fast actions need the same surface.",
  isPublic: false,
  variant: "Primary",
  state: "Default",
};

const templates: Template[] = [
  {
    name: "Button / Split Action",
    category: "Buttons",
    description: "Primary action with an attached secondary menu trigger.",
    tags: "button, action, menu",
    previewHtml: '<div class="vault-tabs"><button data-active="true">Publish</button><button>More</button></div>',
    code: `export function SplitAction() {
  return <div className="vault-tabs"><button>Publish</button><button>More</button></div>;
}`,
    styles: ".vault-tabs { display: inline-flex; gap: 4px; padding: 4px; border-radius: 16px; background: #f7f8fc; }",
    usageCode: '<SplitAction label="Publish" />',
    notes: "Keep the secondary action predictable and short.",
  },
  {
    name: "Card / Release Signal",
    category: "Cards",
    description: "Status card for release health, adoption and completion signals.",
    tags: "release, status, dashboard",
    previewHtml: '<article class="vault-stat"><span>Readiness</span><strong>96%</strong><small>+8 checks</small></article>',
    code: `export function ReleaseSignal() {
  return <article className="vault-stat"><span>Readiness</span><strong>96%</strong><small>+8 checks</small></article>;
}`,
    styles: ".vault-stat { border: 1px solid #e4e7ef; border-radius: 22px; background: #fff; padding: 16px; }",
    usageCode: '<ReleaseSignal value={96} />',
    notes: "Use near publish or review workflows.",
  },
  {
    name: "Input / Token Picker",
    category: "Forms",
    description: "Searchable field for choosing design tokens and semantic values.",
    tags: "input, tokens, picker",
    previewHtml: '<label class="vault-field"><span>Token</span><input placeholder="accent.primary" /></label>',
    code: `export function TokenPicker() {
  return <label className="vault-field"><span>Token</span><input placeholder="accent.primary" /></label>;
}`,
    styles: ".vault-field { display: grid; gap: 8px; } .vault-field input { min-height: 42px; border-radius: 14px; }",
    usageCode: '<TokenPicker value={token} />',
    notes: "Match token names to the shared design system vocabulary.",
  },
  {
    name: "Table / Review Queue",
    category: "Data Display",
    description: "Dense approval queue with owners, severity and last update columns.",
    tags: "table, review, admin",
    previewHtml: '<table class="vault-table"><tbody><tr><td>Button</td><td>Ready</td><td>Now</td></tr></tbody></table>',
    code: `export function ReviewQueue() {
  return <table className="vault-table"><tbody><tr><td>Button</td><td>Ready</td><td>Now</td></tr></tbody></table>;
}`,
    styles: ".vault-table { width: 100%; border-collapse: collapse; background: #fff; } .vault-table td { padding: 8px; }",
    usageCode: "<ReviewQueue items={items} />",
    notes: "Keep row height stable for fast scanning.",
  },
  {
    name: "Motion / Reveal Rail",
    category: "Motion Experiences",
    description: "Horizontal rail with staggered reveal, active state and keyboard-safe controls.",
    tags: "motion, rail, reveal",
    previewHtml: '<div class="vault-motion-preview">Reveal Rail</div>',
    code: `export function RevealRail() {
  return <section aria-label="Reveal rail">Reveal Rail</section>;
}`,
    styles: ".vault-motion-preview { padding: 28px; border-radius: 24px; color: #fff; background: linear-gradient(135deg,#6366f1,#51c89b); }",
    usageCode: "<RevealRail items={items} />",
    notes: "Respect prefers-reduced-motion and keep focus visible.",
  },
];

const motionFeatures: MotionFeature[] = [
  { label: "Stagger reveal", group: "Motion", icon: Sparkles },
  { label: "Hover lift", group: "Motion", icon: Rocket },
  { label: "Tap compression", group: "Motion", icon: Bolt },
  { label: "Route progress", group: "Motion", icon: Activity },
  { label: "Panel spring", group: "Motion", icon: PanelRight },
  { label: "Preview shimmer", group: "Motion", icon: Wand2 },
  { label: "Command fade", group: "Motion", icon: Search },
  { label: "Drawer slide", group: "Motion", icon: ChevronDown },
  { label: "Count pop", group: "Motion", icon: Gauge },
  { label: "Focus pulse", group: "Motion", icon: Eye },
  { label: "Reduced motion guard", group: "Motion", icon: ShieldCheck },
  { label: "Sync heartbeat", group: "Motion", icon: RefreshCw },
  { label: "Density switch", group: "UI", icon: Grid2X2 },
  { label: "Inline actions", group: "UI", icon: ListChecks },
  { label: "Favorite flag", group: "UI", icon: Heart },
  { label: "Public badge", group: "UI", icon: BadgeCheck },
  { label: "Template cards", group: "UI", icon: Layers3 },
  { label: "Token chips", group: "UI", icon: Brush },
  { label: "Status lanes", group: "UI", icon: Archive },
  { label: "Metric tiles", group: "UI", icon: Gauge },
  { label: "Preview frame", group: "UI", icon: Eye },
  { label: "Collection pills", group: "UI", icon: Archive },
  { label: "Search facets", group: "UI", icon: Search },
  { label: "Sticky toolbar", group: "UI", icon: Lock },
  { label: "Code editor panel", group: "Editor", icon: Code2 },
  { label: "Usage snippet", group: "Editor", icon: FileCode2 },
  { label: "Notes composer", group: "Editor", icon: PenLine },
  { label: "Version field", group: "Editor", icon: Star },
  { label: "Tag parser", group: "Editor", icon: Wand2 },
  { label: "HTML preview", group: "Editor", icon: Eye },
  { label: "CSS composer", group: "Editor", icon: Brush },
  { label: "Variant selector", group: "Editor", icon: Bolt },
  { label: "State selector", group: "Editor", icon: Activity },
  { label: "Save feedback", group: "Admin", icon: Save },
  { label: "Duplicate flow", group: "Admin", icon: Copy },
  { label: "Delete guard", group: "Admin", icon: Trash2 },
  { label: "Review queue", group: "Admin", icon: ListChecks },
  { label: "Audit stream", group: "Admin", icon: Database },
  { label: "Collection builder", group: "Admin", icon: Archive },
  { label: "Backend sync", group: "Admin", icon: RefreshCw },
];

function formFromComponent(component: VaultComponent): ComponentForm {
  return {
    name: component.name,
    description: component.description,
    category: component.category,
    framework: component.framework,
    language: component.language,
    version: component.version,
    tags: component.tags.join(", "),
    previewHtml: component.previewHtml,
    code: component.code,
    styles: component.styles,
    usageCode: component.usageCode,
    notes: component.notes,
    isPublic: component.isPublic,
    variant: component.props.variant,
    state: component.props.state,
  };
}

function formFromTemplate(template: Template): ComponentForm {
  return {
    ...defaultForm,
    ...template,
    framework: "React",
    language: "tsx",
    version: "v1.0.0",
    isPublic: false,
    variant: "Primary",
    state: "Default",
  };
}

function tagsFromInput(tags: string) {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function cardMotion(index = 0) {
  return {
    initial: { opacity: 0, y: 16, scale: 0.985 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.32, delay: index * 0.035, ease: motionEase },
  };
}

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#6D7285]">
      <span>{label}</span>
      {children}
    </label>
  );
}

function AdminInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "min-h-11 rounded-2xl border border-[#E4E7EF] bg-white px-4 text-sm text-text-primary shadow-sm transition-colors placeholder:text-[#A5ABBA] focus:border-[#6366F1]",
        props.className,
      )}
    />
  );
}

function AdminTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-28 resize-y rounded-2xl border border-[#E4E7EF] bg-white px-4 py-3 font-mono text-xs leading-5 text-text-primary shadow-sm transition-colors placeholder:text-[#A5ABBA] focus:border-[#6366F1]",
        props.className,
      )}
    />
  );
}

function AdminSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "min-h-11 rounded-2xl border border-[#E4E7EF] bg-white px-4 text-sm text-text-primary shadow-sm transition-colors focus:border-[#6366F1]",
        props.className,
      )}
    />
  );
}

export function AdminPanelScreen() {
  const components = useVaultStore((state) => state.components);
  const collections = useVaultStore((state) => state.collections);
  const isSyncing = useVaultStore((state) => state.isSyncing);
  const backendError = useVaultStore((state) => state.backendError);
  const loadVault = useVaultStore((state) => state.loadVault);
  const createComponent = useVaultStore((state) => state.createComponent);
  const updateComponentDetails = useVaultStore((state) => state.updateComponentDetails);
  const deleteComponent = useVaultStore((state) => state.deleteComponent);
  const toggleFavorite = useVaultStore((state) => state.toggleFavorite);
  const createCollection = useVaultStore((state) => state.createCollection);
  const updateCollection = useVaultStore((state) => state.updateCollection);
  const toggleCollectionComponent = useVaultStore((state) => state.toggleCollectionComponent);
  const [form, setForm] = useState<ComponentForm>(defaultForm);
  const [collectionName, setCollectionName] = useState("Admin Launch Kit");
  const [collectionDescription, setCollectionDescription] = useState("Components staged for the next owner review.");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ComponentCategory | "All">("All");
  const [sort, setSort] = useState<"Updated" | "Name" | "Usage">("Updated");
  const [dense, setDense] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const [lastAction, setLastAction] = useState("Admin studio ready.");
  const reduceMotion = useReducedMotion();

  const activeComponent = useMemo(() => components.find((component) => component.id === activeId) ?? components[0] ?? null, [activeId, components]);
  const effectiveCollectionId = selectedCollectionId || collections[0]?.id || "";

  const filteredComponents = useMemo(() => {
    const term = query.trim().toLowerCase();
    return components
      .filter((component) => {
        const searchable = [component.name, component.description, component.category, component.framework, ...component.tags].join(" ").toLowerCase();
        const matchesSearch = !term || searchable.includes(term);
        const matchesCategory = category === "All" || component.category === category;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sort === "Name") return a.name.localeCompare(b.name);
        if (sort === "Usage") return b.usage.reduce((sum, item) => sum + item.count, 0) - a.usage.reduce((sum, item) => sum + item.count, 0);
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [category, components, query, sort]);

  const metrics = useMemo(() => {
    const publicCount = components.filter((component) => component.isPublic).length;
    const favoriteCount = components.filter((component) => component.isFavorite).length;
    const motionCount = components.filter((component) => component.category === "Motion Experiences").length;
    const totalUsage = components.reduce((sum, component) => sum + component.usage.reduce((usageSum, usage) => usageSum + usage.count, 0), 0);
    return [
      { label: "Components", value: components.length, detail: `${publicCount} public`, icon: Box, tone: "bg-[#EEF0FF] text-[#6366F1]" },
      { label: "Collections", value: collections.length, detail: "Curated groups", icon: Archive, tone: "bg-emerald-50 text-emerald-700" },
      { label: "Motion", value: motionCount, detail: "Interactive patterns", icon: Sparkles, tone: "bg-pink-50 text-pink-700" },
      { label: "Usage", value: totalUsage, detail: `${favoriteCount} favorites`, icon: Activity, tone: "bg-amber-50 text-amber-700" },
    ];
  }, [collections.length, components]);

  const selectedCollection = collections.find((collection) => collection.id === effectiveCollectionId) ?? collections[0] ?? null;
  const selectedCollectionSet = new Set(selectedCollection?.componentIds ?? []);
  const pipeline = [
    { label: "Draft", items: filteredComponents.filter((component) => component.tags.includes("draft") || component.version === "v1.0.0").slice(0, 4), tone: "bg-amber-50 text-amber-700" },
    { label: "Review", items: filteredComponents.filter((component) => component.tags.includes("admin") || component.category === "Data Display").slice(0, 4), tone: "bg-[#EEF0FF] text-[#6366F1]" },
    { label: "Live", items: filteredComponents.filter((component) => component.isPublic || component.isFavorite).slice(0, 4), tone: "bg-emerald-50 text-emerald-700" },
  ];

  function updateForm<Key extends keyof ComponentForm>(key: Key, value: ComponentForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleCreate() {
    const component = await createComponent({
      name: form.name,
      description: form.description,
      category: form.category,
      framework: form.framework,
      language: form.language,
      version: form.version,
      tags: tagsFromInput(form.tags),
      previewHtml: form.previewHtml,
      code: form.code,
      styles: form.styles,
      usageCode: form.usageCode,
      notes: form.notes,
      isPublic: form.isPublic,
      props: {
        variant: form.variant,
        size: "Medium",
        state: form.state,
        iconLeft: false,
        iconRight: false,
        fullWidth: false,
        disabled: form.state === "Disabled",
        loading: form.state === "Loading",
      },
    });

    if (!component) return;
    setActiveId(component.id);
    if (selectedCollection) {
      await toggleCollectionComponent(selectedCollection.id, component.id);
    }
    setLastAction(`${component.name} created and staged.`);
  }

  async function handleSave() {
    if (!activeComponent) return;
    const component = await updateComponentDetails(activeComponent.id, {
      name: form.name,
      description: form.description,
      category: form.category,
      framework: form.framework,
      language: form.language,
      version: form.version,
      tags: tagsFromInput(form.tags),
      previewHtml: form.previewHtml,
      code: form.code,
      styles: form.styles,
      usageCode: form.usageCode,
      notes: form.notes,
      isPublic: form.isPublic,
      props: {
        ...activeComponent.props,
        variant: form.variant,
        state: form.state,
        disabled: form.state === "Disabled",
        loading: form.state === "Loading",
      },
    });
    if (component) {
      setActiveId(component.id);
      setLastAction(`${component.name} saved.`);
    }
  }

  async function handleDuplicate(component: VaultComponent) {
    const copy = await createComponent({
      name: `${component.name} Copy`,
      description: component.description,
      category: component.category,
      framework: component.framework,
      language: component.language,
      version: component.version,
      tags: [...component.tags, "draft"],
      previewHtml: component.previewHtml,
      code: component.code,
      styles: component.styles,
      usageCode: component.usageCode,
      notes: component.notes,
      isPublic: false,
      props: component.props,
    });
    if (copy) {
      setActiveId(copy.id);
      setForm(formFromComponent(copy));
      setLastAction(`${copy.name} duplicated.`);
    }
  }

  async function handleDelete(component: VaultComponent) {
    const removed = await deleteComponent(component.id);
    if (removed) {
      setActiveId(null);
      setLastAction(`${component.name} deleted.`);
    }
  }

  async function handleCreateCollection() {
    const collection = await createCollection({
      name: collectionName,
      description: collectionDescription,
      componentIds: activeComponent ? [activeComponent.id] : [],
    });
    if (collection) {
      setSelectedCollectionId(collection.id);
      setLastAction(`${collection.name} collection created.`);
    }
  }

  async function handleCollectionDescription(collection: Collection, description: string) {
    const saved = await updateCollection(collection.id, { description });
    if (saved) setLastAction(`${saved.name} collection saved.`);
  }

  function loadComponent(component: VaultComponent) {
    setActiveId(component.id);
    setForm(formFromComponent(component));
    setLastAction(`${component.name} loaded into editor.`);
  }

  return (
    <AppShell active="Admin">
      <section className="relative px-4 py-7 md:px-7 md:py-9">
        <div className="mx-auto max-w-[1540px]">
          <motion.div
            className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, ease: motionEase }}
          >
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#E4E7EF] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#6366F1] shadow-sm backdrop-blur">
                <ShieldCheck size={13} aria-hidden />
                Owner admin
              </p>
              <h1 className="text-4xl font-bold tracking-[-0.045em] text-text-primary md:text-5xl">Admin Studio</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[#6D7285]">Create, stage, review and publish components from one backend-backed workspace.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <motion.button
                className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-[#E4E7EF] bg-white px-4 text-sm font-semibold text-text-primary shadow-sm"
                onClick={() => void loadVault(true)}
                whileHover={reduceMotion ? undefined : { y: -2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                transition={fastMotion}
              >
                <RefreshCw size={17} className={cn(isSyncing && "animate-spin")} aria-hidden />
                Sync
              </motion.button>
              <motion.button
                className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[#6366F1] px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200"
                onClick={() => void handleCreate()}
                whileHover={reduceMotion ? undefined : { y: -2, scale: 1.01 }}
                whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                transition={fastMotion}
              >
                {isSyncing ? <Loader2 size={17} className="animate-spin" aria-hidden /> : <Plus size={17} aria-hidden />}
                Add Component
              </motion.button>
            </div>
          </motion.div>

          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <motion.article
                  key={metric.label}
                  className="overflow-hidden rounded-[28px] border border-white/80 bg-white/72 p-5 shadow-[0_18px_70px_rgba(23,26,43,0.045)] backdrop-blur-xl"
                  {...(reduceMotion ? {} : cardMotion(index))}
                  whileHover={reduceMotion ? undefined : { y: -4, scale: 1.008 }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className={cn("grid size-11 place-items-center rounded-2xl", metric.tone)}>
                      <Icon size={19} aria-hidden />
                    </span>
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.strong
                        key={`${metric.label}-${metric.value}`}
                        className="text-3xl font-bold tracking-[-0.04em] text-text-primary"
                        initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={reduceMotion ? undefined : { opacity: 0, y: -8, scale: 0.96 }}
                        transition={fastMotion}
                      >
                        {metric.value}
                      </motion.strong>
                    </AnimatePresence>
                  </div>
                  <p className="mt-5 text-sm font-semibold text-text-primary">{metric.label}</p>
                  <p className="mt-1 text-xs text-[#6D7285]">{metric.detail}</p>
                </motion.article>
              );
            })}
          </div>

          <div className="mt-7 grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(380px,0.92fr)]">
            <div className="space-y-5">
              <Reveal>
                <section className="rounded-[30px] border border-white/80 bg-white/70 p-4 shadow-[0_18px_70px_rgba(23,26,43,0.045)] backdrop-blur-xl">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="text-lg font-bold tracking-[-0.02em] text-text-primary">Templates</h2>
                      <p className="mt-1 text-sm text-[#6D7285]">Start from a component pattern and ship it into the vault.</p>
                    </div>
                    <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#EEF0FF] px-3 py-1 text-xs font-semibold text-[#6366F1]">
                      <Wand2 size={13} aria-hidden />
                      {templates.length} starters
                    </span>
                  </div>
                  <StaggerGroup className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                    {templates.map((template) => (
                      <StaggerItem key={template.name}>
                        <motion.button
                          className={cn(
                            "group h-full w-full rounded-3xl border p-4 text-left shadow-sm transition-colors",
                            form.name === template.name ? "border-[#6366F1] bg-[#EEF0FF]" : "border-[#E4E7EF] bg-white hover:border-[#C9CDDA]",
                          )}
                          onClick={() => {
                            setForm(formFromTemplate(template));
                            setLastAction(`${template.name} template loaded.`);
                          }}
                          whileHover={reduceMotion ? undefined : { y: -3 }}
                          whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                          transition={fastMotion}
                        >
                          <span className="grid size-9 place-items-center rounded-2xl bg-[#F7F8FC] text-[#6366F1] transition-colors group-hover:bg-white">
                            <Sparkles size={16} aria-hidden />
                          </span>
                          <span className="mt-4 block text-sm font-bold text-text-primary">{template.name}</span>
                          <span className="mt-2 block text-xs leading-5 text-[#6D7285]">{template.category}</span>
                        </motion.button>
                      </StaggerItem>
                    ))}
                  </StaggerGroup>
                </section>
              </Reveal>

              <Reveal>
                <section className="rounded-[30px] border border-white/80 bg-white/70 p-4 shadow-[0_18px_70px_rgba(23,26,43,0.045)] backdrop-blur-xl">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="text-lg font-bold tracking-[-0.02em] text-text-primary">Component Editor</h2>
                      <p className="mt-1 text-sm text-[#6D7285]">{activeComponent ? `Editing ${activeComponent.name}` : "Ready for a new component."}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <motion.button
                        className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-[#E4E7EF] bg-white px-3 text-sm font-semibold text-text-primary shadow-sm"
                        onClick={() => {
                          setForm(defaultForm);
                          setActiveId(null);
                          setLastAction("New component draft opened.");
                        }}
                        whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                      >
                        <Plus size={16} aria-hidden />
                        New
                      </motion.button>
                      <motion.button
                        className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-[#E4E7EF] bg-white px-3 text-sm font-semibold text-text-primary shadow-sm"
                        onClick={() => void handleSave()}
                        disabled={!activeComponent}
                        whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                      >
                        <Save size={16} aria-hidden />
                        Save
                      </motion.button>
                      <motion.button
                        className="inline-flex min-h-10 items-center gap-2 rounded-2xl bg-[#171A2B] px-3 text-sm font-semibold text-white shadow-md"
                        onClick={() => void handleCreate()}
                        whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                      >
                        <Rocket size={16} aria-hidden />
                        Create
                      </motion.button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <FieldLabel label="Name">
                      <AdminInput value={form.name} onChange={(event) => updateForm("name", event.target.value)} />
                    </FieldLabel>
                    <FieldLabel label="Version">
                      <AdminInput value={form.version} onChange={(event) => updateForm("version", event.target.value)} />
                    </FieldLabel>
                    <FieldLabel label="Category">
                      <AdminSelect value={form.category} onChange={(event) => updateForm("category", event.target.value as ComponentCategory)}>
                        {categories.map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </AdminSelect>
                    </FieldLabel>
                    <FieldLabel label="Framework">
                      <AdminSelect value={form.framework} onChange={(event) => updateForm("framework", event.target.value as VaultComponent["framework"])}>
                        <option>React</option>
                        <option>HTML</option>
                      </AdminSelect>
                    </FieldLabel>
                    <FieldLabel label="Language">
                      <AdminSelect value={form.language} onChange={(event) => updateForm("language", event.target.value as VaultComponent["language"])}>
                        <option>tsx</option>
                        <option>jsx</option>
                        <option>html</option>
                      </AdminSelect>
                    </FieldLabel>
                    <FieldLabel label="Tags">
                      <AdminInput value={form.tags} onChange={(event) => updateForm("tags", event.target.value)} />
                    </FieldLabel>
                    <FieldLabel label="Variant">
                      <AdminSelect value={form.variant} onChange={(event) => updateForm("variant", event.target.value as ComponentVariant)}>
                        {variants.map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </AdminSelect>
                    </FieldLabel>
                    <FieldLabel label="State">
                      <AdminSelect value={form.state} onChange={(event) => updateForm("state", event.target.value as ComponentState)}>
                        {states.map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </AdminSelect>
                    </FieldLabel>
                  </div>

                  <div className="mt-4">
                    <FieldLabel label="Description">
                      <AdminTextarea className="min-h-24 font-sans text-sm" value={form.description} onChange={(event) => updateForm("description", event.target.value)} />
                    </FieldLabel>
                  </div>

                  <div className="mt-4 grid gap-4 xl:grid-cols-2">
                    <FieldLabel label="Component code">
                      <AdminTextarea value={form.code} onChange={(event) => updateForm("code", event.target.value)} />
                    </FieldLabel>
                    <FieldLabel label="Styles">
                      <AdminTextarea value={form.styles} onChange={(event) => updateForm("styles", event.target.value)} />
                    </FieldLabel>
                    <FieldLabel label="Usage">
                      <AdminTextarea className="min-h-20" value={form.usageCode} onChange={(event) => updateForm("usageCode", event.target.value)} />
                    </FieldLabel>
                    <FieldLabel label="Notes">
                      <AdminTextarea className="min-h-20 font-sans text-sm" value={form.notes} onChange={(event) => updateForm("notes", event.target.value)} />
                    </FieldLabel>
                  </div>

                  <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_280px]">
                    <FieldLabel label="Preview HTML">
                      <AdminTextarea className="min-h-24" value={form.previewHtml} onChange={(event) => updateForm("previewHtml", event.target.value)} />
                    </FieldLabel>
                    <div className="rounded-3xl border border-[#E4E7EF] bg-[#F7F8FC] p-3">
                      <div className="mb-3 flex items-center justify-between text-xs font-semibold text-[#6D7285]">
                        <span>Live preview</span>
                        <span className="rounded-full bg-white px-2 py-1 text-[#6366F1]">{form.state}</span>
                      </div>
                      <motion.div
                        className="grid min-h-36 place-items-center overflow-hidden rounded-2xl bg-white p-5 shadow-inner"
                        key={`${form.previewHtml}-${form.state}`}
                        initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, ease: motionEase }}
                        dangerouslySetInnerHTML={{ __html: form.previewHtml }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <label className="inline-flex min-h-11 items-center gap-3 rounded-2xl border border-[#E4E7EF] bg-white px-4 text-sm font-semibold text-text-primary shadow-sm">
                      <input type="checkbox" checked={form.isPublic} onChange={(event) => updateForm("isPublic", event.target.checked)} />
                      Public component
                    </label>
                    <span className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[#F7F8FC] px-4 text-sm font-semibold text-[#6D7285]">
                      <Database size={16} aria-hidden />
                      {lastAction}
                    </span>
                  </div>
                </section>
              </Reveal>

              <Reveal>
                <section className="rounded-[30px] border border-white/80 bg-white/70 p-4 shadow-[0_18px_70px_rgba(23,26,43,0.045)] backdrop-blur-xl">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="text-lg font-bold tracking-[-0.02em] text-text-primary">Library Control</h2>
                      <p className="mt-1 text-sm text-[#6D7285]">{filteredComponents.length} components in view.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9FB1]" size={16} aria-hidden />
                        <AdminInput className="w-64 pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search library" />
                      </div>
                      <AdminSelect value={category} onChange={(event) => setCategory(event.target.value as ComponentCategory | "All")}>
                        <option>All</option>
                        {categories.map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </AdminSelect>
                      <AdminSelect value={sort} onChange={(event) => setSort(event.target.value as "Updated" | "Name" | "Usage")}>
                        <option>Updated</option>
                        <option>Name</option>
                        <option>Usage</option>
                      </AdminSelect>
                      <button
                        className={cn(
                          "inline-flex min-h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-semibold shadow-sm",
                          dense ? "border-[#6366F1] bg-[#EEF0FF] text-[#6366F1]" : "border-[#E4E7EF] bg-white text-text-primary",
                        )}
                        onClick={() => setDense((value) => !value)}
                      >
                        <Grid2X2 size={16} aria-hidden />
                        Dense
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-3xl border border-[#E4E7EF] bg-white">
                    <div className="grid grid-cols-[minmax(240px,1.3fr)_150px_120px_170px] border-b border-[#E4E7EF] bg-[#F7F8FC] px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#6D7285] max-lg:hidden">
                      <span>Name</span>
                      <span>Category</span>
                      <span>Status</span>
                      <span className="text-right">Actions</span>
                    </div>
                    <div className="max-h-[520px] overflow-auto thin-scrollbar">
                      <AnimatePresence initial={false}>
                        {filteredComponents.map((component) => (
                          <motion.div
                            key={component.id}
                            className={cn(
                              "grid gap-3 border-b border-[#E4E7EF] px-4 last:border-0 lg:grid-cols-[minmax(240px,1.3fr)_150px_120px_170px] lg:items-center",
                              dense ? "py-2" : "py-4",
                              activeComponent?.id === component.id && "bg-[#EEF0FF]/55",
                            )}
                            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={reduceMotion ? undefined : { opacity: 0, x: -8 }}
                            layout
                          >
                            <button className="min-w-0 text-left" onClick={() => loadComponent(component)}>
                              <span className="block truncate text-sm font-bold text-text-primary">{component.name}</span>
                              <span className="mt-1 flex flex-wrap gap-1">
                                {component.tags.slice(0, 3).map((tag) => (
                                  <span key={tag} className="rounded-full bg-[#F7F8FC] px-2 py-0.5 text-[11px] font-semibold text-[#6D7285]">
                                    {tag}
                                  </span>
                                ))}
                              </span>
                            </button>
                            <span className="text-sm text-[#6D7285]">{component.category}</span>
                            <span className="flex flex-wrap gap-1">
                              {component.isPublic ? <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">Public</span> : null}
                              {component.isFavorite ? <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">Fav</span> : null}
                              {!component.isPublic && !component.isFavorite ? <span className="rounded-full bg-[#F7F8FC] px-2 py-1 text-xs font-semibold text-[#6D7285]">Draft</span> : null}
                            </span>
                            <div className="flex items-center justify-start gap-1 lg:justify-end">
                              <button className="grid size-9 place-items-center rounded-xl text-[#6D7285] transition-colors hover:bg-[#F7F8FC] hover:text-[#6366F1]" onClick={() => void toggleFavorite(component.id)} aria-label={`Favorite ${component.name}`}>
                                <Heart size={16} aria-hidden />
                              </button>
                              <Link className="grid size-9 place-items-center rounded-xl text-[#6D7285] transition-colors hover:bg-[#F7F8FC] hover:text-[#6366F1]" href={`/vault/components/${component.slug}`} aria-label={`Open ${component.name}`}>
                                <Eye size={16} aria-hidden />
                              </Link>
                              <button className="grid size-9 place-items-center rounded-xl text-[#6D7285] transition-colors hover:bg-[#F7F8FC] hover:text-[#6366F1]" onClick={() => void handleDuplicate(component)} aria-label={`Duplicate ${component.name}`}>
                                <Copy size={16} aria-hidden />
                              </button>
                              <button className="grid size-9 place-items-center rounded-xl text-red-500 transition-colors hover:bg-red-50" onClick={() => void handleDelete(component)} aria-label={`Delete ${component.name}`}>
                                <Trash2 size={16} aria-hidden />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </section>
              </Reveal>
            </div>

            <aside className="space-y-5">
              <Reveal>
                <section className="rounded-[30px] border border-white/80 bg-white/70 p-4 shadow-[0_18px_70px_rgba(23,26,43,0.045)] backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold tracking-[-0.02em] text-text-primary">Collections</h2>
                      <p className="mt-1 text-sm text-[#6D7285]">{selectedCollection?.name ?? "No collection selected"}</p>
                    </div>
                    <span className="grid size-10 place-items-center rounded-2xl bg-[#EEF0FF] text-[#6366F1]">
                      <Archive size={18} aria-hidden />
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3">
                    <AdminSelect value={effectiveCollectionId} onChange={(event) => setSelectedCollectionId(event.target.value)}>
                      {collections.map((collection) => (
                        <option key={collection.id} value={collection.id}>
                          {collection.name}
                        </option>
                      ))}
                    </AdminSelect>
                    {selectedCollection ? (
                      <AdminTextarea
                        className="min-h-20 font-sans text-sm"
                        value={selectedCollection.description}
                        onChange={(event) => void handleCollectionDescription(selectedCollection, event.target.value)}
                      />
                    ) : null}
                    <div className="grid gap-2">
                      {components.slice(0, 8).map((component) => (
                        <label key={component.id} className="flex items-center gap-3 rounded-2xl border border-[#E4E7EF] bg-white px-3 py-2 text-sm text-text-primary shadow-sm">
                          <input
                            type="checkbox"
                            checked={selectedCollectionSet.has(component.id)}
                            onChange={() => selectedCollection && void toggleCollectionComponent(selectedCollection.id, component.id)}
                          />
                          <span className="min-w-0 flex-1 truncate">{component.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 rounded-3xl bg-[#F7F8FC] p-3">
                    <AdminInput value={collectionName} onChange={(event) => setCollectionName(event.target.value)} />
                    <AdminTextarea className="min-h-20 font-sans text-sm" value={collectionDescription} onChange={(event) => setCollectionDescription(event.target.value)} />
                    <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#171A2B] px-4 text-sm font-semibold text-white" onClick={() => void handleCreateCollection()}>
                      <Plus size={16} aria-hidden />
                      Create Collection
                    </button>
                  </div>
                </section>
              </Reveal>

              <Reveal>
                <section className="rounded-[30px] border border-white/80 bg-white/70 p-4 shadow-[0_18px_70px_rgba(23,26,43,0.045)] backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold tracking-[-0.02em] text-text-primary">Review Lanes</h2>
                      <p className="mt-1 text-sm text-[#6D7285]">Draft, review and live inventory.</p>
                    </div>
                    <ListChecks className="text-[#6366F1]" size={20} aria-hidden />
                  </div>
                  <div className="mt-4 grid gap-3">
                    {pipeline.map((lane) => (
                      <div key={lane.label} className="rounded-3xl border border-[#E4E7EF] bg-white p-3">
                        <div className="mb-3 flex items-center justify-between">
                          <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", lane.tone)}>{lane.label}</span>
                          <span className="text-xs font-semibold text-[#9A9FB1]">{lane.items.length}</span>
                        </div>
                        <div className="space-y-2">
                          {lane.items.map((component) => (
                            <button key={`${lane.label}-${component.id}`} className="flex w-full items-center gap-2 rounded-2xl bg-[#F7F8FC] px-3 py-2 text-left text-sm text-text-primary" onClick={() => loadComponent(component)}>
                              <Check size={15} className="text-[#51C89B]" aria-hidden />
                              <span className="min-w-0 flex-1 truncate">{component.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </Reveal>

              <Reveal>
                <section className="rounded-[30px] border border-white/80 bg-white/70 p-4 shadow-[0_18px_70px_rgba(23,26,43,0.045)] backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold tracking-[-0.02em] text-text-primary">Motion Stack</h2>
                      <p className="mt-1 text-sm text-[#6D7285]">{motionFeatures.length} active refinements.</p>
                    </div>
                    <Sparkles className="text-[#E978D4]" size={20} aria-hidden />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {motionFeatures.map((feature, index) => {
                      const Icon = feature.icon;
                      return (
                        <motion.button
                          key={feature.label}
                          className="group flex min-h-12 items-center gap-2 rounded-2xl border border-[#E4E7EF] bg-white px-3 text-left text-xs font-semibold text-text-primary shadow-sm"
                          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.2 }}
                          transition={{ duration: 0.18, delay: Math.min(index * 0.006, 0.12), ease: motionEase }}
                          whileHover={reduceMotion ? undefined : { y: -2, backgroundColor: "#F7F8FC" }}
                          whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                        >
                          <span className="grid size-7 shrink-0 place-items-center rounded-xl bg-[#EEF0FF] text-[#6366F1]">
                            <Icon size={14} aria-hidden />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate">{feature.label}</span>
                            <span className="text-[10px] uppercase tracking-[0.1em] text-[#9A9FB1]">{feature.group}</span>
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </section>
              </Reveal>

              <Reveal>
                <section className="rounded-[30px] border border-[#171A2B] bg-[#171A2B] p-4 text-white shadow-[0_18px_70px_rgba(23,26,43,0.12)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold tracking-[-0.02em]">Audit Stream</h2>
                      <p className="mt-1 text-sm text-white/62">Live admin events</p>
                    </div>
                    <span className="grid size-10 place-items-center rounded-2xl bg-white/10 text-[#51C89B]">
                      <Database size={18} aria-hidden />
                    </span>
                  </div>
                  <div className="mt-4 space-y-2 font-mono text-xs text-white/72">
                    {[lastAction, backendError ? `Backend error: ${backendError}` : "Backend healthy.", isSyncing ? "Sync in progress." : "Sync idle.", `${components.length} components indexed.`].map((line) => (
                      <motion.p
                        key={line}
                        className="rounded-2xl bg-white/[0.06] px-3 py-2"
                        initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={fastMotion}
                      >
                        <span className="text-[#51C89B]">&gt;</span> {line}
                      </motion.p>
                    ))}
                  </div>
                </section>
              </Reveal>
            </aside>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
