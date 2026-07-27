"use client";

import Link from "next/link";
import {
  Archive,
  Box,
  Check,
  ChevronRight,
  Command,
  Copy,
  ExternalLink,
  Eye,
  FileCode2,
  GitBranch,
  Grid2X2,
  Heart,
  History,
  Layers3,
  Monitor,
  Moon,
  MoreHorizontal,
  PanelLeftClose,
  Search,
  Share2,
  Smartphone,
  Sparkles,
  Tablet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { categories } from "@/services/demo-data";
import { cn } from "@/lib/utils";
import { useVaultStore } from "@/stores/vault-store";
import type { VaultComponent } from "@/types/vault";

type DetailTab = "Code" | "Usage" | "Accessibility" | "Notes" | "Changelog";
type Viewport = "Desktop" | "Tablet" | "Mobile";

const navItems = [
  { label: "Overview", icon: Grid2X2, href: "/vault" },
  { label: "All Components", icon: Box, href: "/vault/components" },
  { label: "Browse", icon: Search, href: "/vault/components" },
  { label: "Collections", icon: Archive, href: "/vault/collections" },
  { label: "Favorites", icon: Heart, href: "/vault/favorites" },
  { label: "Updates", icon: History, href: "/vault/settings" },
];

const tableRows = [
  { customer: "Acme Corporation", status: "Active", plan: "Enterprise", spend: "$24,800", renewal: "Aug 14, 2026", owner: "Marina Costa" },
  { customer: "Northstar Labs", status: "Trial", plan: "Team", spend: "$4,200", renewal: "Sep 02, 2026", owner: "Jonas Lee" },
  { customer: "Luma Systems", status: "Active", plan: "Scale", spend: "$18,450", renewal: "Oct 19, 2026", owner: "Priya Shah" },
  { customer: "Orbit Design Co.", status: "Paused", plan: "Pro", spend: "$7,920", renewal: "Nov 03, 2026", owner: "Theo Martin" },
  { customer: "Vertex Health", status: "Active", plan: "Enterprise", spend: "$31,100", renewal: "Dec 11, 2026", owner: "Ana Ribeiro" },
];

export function ComponentDetailWorkspace({ slug }: { slug: string }) {
  const components = useVaultStore((state) => state.components);
  const tableSettings = useVaultStore((state) => state.tableSettings);
  const updateTableSettings = useVaultStore((state) => state.updateTableSettings);
  const setActiveComponentSlug = useVaultStore((state) => state.setActiveComponentSlug);
  const addLog = useVaultStore((state) => state.addLog);
  const component = components.find((item) => item.slug === slug);
  const [viewport, setViewport] = useState<Viewport>("Desktop");
  const [activeTab, setActiveTab] = useState<DetailTab>("Code");
  const [propertiesTab, setPropertiesTab] = useState<"Properties" | "Tokens">("Properties");
  const [loadingState, setLoadingState] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setActiveComponentSlug(slug);
  }, [setActiveComponentSlug, slug]);

  async function copyCode() {
    if (!component) return;
    await navigator.clipboard.writeText(component.code);
    setCopied(true);
    addLog("Code copied.");
    window.setTimeout(() => setCopied(false), 1400);
  }

  if (!component) {
    return (
      <main className="min-h-dvh bg-[#f7f7f5] p-6 text-[#18181b]">
        <div className="mx-auto grid min-h-[calc(100dvh-48px)] max-w-3xl place-items-center text-center">
          <div>
            <p className="text-sm font-medium text-red-600">Component not found</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{slug}</h1>
            <Link href="/vault/components" className="mt-6 inline-flex rounded-lg bg-[#18181b] px-4 py-2 text-sm font-medium text-white">
              Back to library
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[#f7f7f5] text-[#18181b]">
      <div className="grid min-h-dvh lg:grid-cols-[280px_1fr]">
        <ModernSidebar activeComponent={component} />

        <section className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-[#e6e6e3]/90 bg-[#f7f7f5]/85 px-5 py-4 backdrop-blur-xl md:px-8">
            <div className="flex items-center justify-between gap-4">
              <button className="inline-flex items-center gap-2 rounded-lg border border-[#e5e5e2] bg-white px-3 py-2 text-sm text-[#55555f] shadow-sm lg:hidden">
                <PanelLeftClose size={16} aria-hidden />
                Menu
              </button>
              <div className="hidden items-center gap-2 text-sm text-[#71717a] md:flex">
                <Command size={15} aria-hidden />
                <span>Component Vault</span>
                <span className="text-[#c4c4c0]">/</span>
                <span>Design System</span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button className="inline-flex size-9 items-center justify-center rounded-lg border border-[#e5e5e2] bg-white text-[#52525b] shadow-sm" aria-label="Switch theme">
                  <Moon size={16} aria-hidden />
                </button>
                <button className="inline-flex items-center gap-2 rounded-lg border border-[#e5e5e2] bg-white px-3 py-2 text-sm font-medium text-[#3f3f46] shadow-sm">
                  <Share2 size={16} aria-hidden />
                  <span className="hidden sm:inline">Share</span>
                </button>
                <button className="inline-flex items-center gap-2 rounded-lg bg-[#18181b] px-3 py-2 text-sm font-medium text-white shadow-sm" onClick={copyCode}>
                  {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1440px] px-5 py-8 md:px-8">
            <div className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <Breadcrumb component={component} />
                <h1 className="mt-4 text-4xl font-semibold tracking-[-0.02em] text-[#111113] md:text-5xl">{component.name}</h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-[#62626d]">{modernDescription(component)}</p>
                <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-[#62626d]">
                  <MetaPill label={component.version} />
                  <MetaPill label="Production ready" tone="success" />
                  <MetaPill label={`Updated ${formatDate(component.updatedAt)}`} />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button className="inline-flex items-center gap-2 rounded-lg border border-[#e5e5e2] bg-white px-3 py-2 text-sm font-medium text-[#3f3f46] shadow-sm">
                  <Eye size={16} aria-hidden />
                  Preview
                </button>
                <button className="inline-flex items-center gap-2 rounded-lg border border-[#e5e5e2] bg-white px-3 py-2 text-sm font-medium text-[#3f3f46] shadow-sm">
                  <GitBranch size={16} aria-hidden />
                  Compare
                </button>
                <button className="inline-flex size-10 items-center justify-center rounded-lg border border-[#e5e5e2] bg-white text-[#52525b] shadow-sm" aria-label="More options">
                  <MoreHorizontal size={17} aria-hidden />
                </button>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="min-w-0 space-y-6">
                <PreviewPanel
                  component={component}
                  viewport={viewport}
                  setViewport={setViewport}
                  loadingState={loadingState}
                  bordered={tableSettings.borders}
                  striped={tableSettings.stripedRows}
                  stickyHeader={tableSettings.stickyHeader}
                  density={tableSettings.density}
                />
                <ContentTabs component={component} activeTab={activeTab} setActiveTab={setActiveTab} copyCode={copyCode} />
              </div>

              <PropertiesPanel
                component={component}
                propertiesTab={propertiesTab}
                setPropertiesTab={setPropertiesTab}
                loadingState={loadingState}
                setLoadingState={setLoadingState}
                updateTableSettings={updateTableSettings}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function ModernSidebar({ activeComponent }: { activeComponent: VaultComponent }) {
  const components = useVaultStore((state) => state.components);

  return (
    <aside className="hidden border-r border-[#e6e6e3] bg-white/80 px-4 py-5 backdrop-blur-xl lg:block">
      <Link href="/vault/components" className="flex items-center gap-3 rounded-xl px-2 py-2">
        <span className="grid size-9 place-items-center rounded-xl bg-[#18181b] text-sm font-semibold text-white">CV</span>
        <div>
          <div className="text-sm font-semibold">Component Vault</div>
          <div className="text-xs text-[#71717a]">Design system library</div>
        </div>
      </Link>

      <label className="mt-6 flex h-10 items-center gap-2 rounded-xl border border-[#e5e5e2] bg-[#fafafa] px-3 text-sm text-[#71717a]">
        <Search size={16} aria-hidden />
        <span className="sr-only">Search</span>
        <input className="min-w-0 flex-1 bg-transparent outline-none" placeholder="Search components" />
      </label>

      <nav className="mt-6 space-y-1" aria-label="Primary navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#62626d] hover:bg-[#f4f4f2] hover:text-[#18181b]",
                item.label === "All Components" && "bg-[#f4f4f2] text-[#18181b]",
              )}
            >
              <Icon size={16} aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8">
        <div className="px-3 text-xs font-medium uppercase tracking-wide text-[#a1a1aa]">Categories</div>
        <div className="mt-3 space-y-1">
          {categories.map((category) => {
            const count = category === "All Components" ? components.length : components.filter((item) => item.category === category).length;
            const active = category === activeComponent.category || (category === "All Components" && activeComponent.category === "Buttons");
            return (
              <Link
                key={category}
                href="/vault/components"
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-sm text-[#62626d] hover:bg-[#f4f4f2] hover:text-[#18181b]",
                  active && category === activeComponent.category && "bg-[#f4f4f2] text-[#18181b]",
                )}
              >
                <span>{normalizeCategory(category)}</span>
                <span className="text-xs text-[#a1a1aa]">{count}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

function Breadcrumb({ component }: { component: VaultComponent }) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm text-[#71717a]" aria-label="Breadcrumb">
      <Link href="/vault/components" className="hover:text-[#18181b]">All Components</Link>
      <ChevronRight size={14} aria-hidden />
      <Link href="/vault/components" className="hover:text-[#18181b]">{component.category}</Link>
      <ChevronRight size={14} aria-hidden />
      <span className="font-medium text-[#3f3f46]">{component.name}</span>
    </nav>
  );
}

function PreviewPanel({
  component,
  viewport,
  setViewport,
  loadingState,
  bordered,
  striped,
  stickyHeader,
  density,
}: {
  component: VaultComponent;
  viewport: Viewport;
  setViewport: (value: Viewport) => void;
  loadingState: boolean;
  bordered: boolean;
  striped: boolean;
  stickyHeader: boolean;
  density: "Compact" | "Comfortable";
}) {
  const widthClass = {
    Desktop: "max-w-5xl",
    Tablet: "max-w-2xl",
    Mobile: "max-w-sm",
  }[viewport];

  return (
    <section className="overflow-hidden rounded-2xl border border-[#e5e5e2] bg-white shadow-[0_18px_60px_rgba(15,15,15,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eeeeeb] px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-[#18181b]">Preview</h2>
          <p className="text-xs text-[#71717a]">Interactive component canvas</p>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-[#e5e5e2] bg-[#fafafa] p-1">
          {([
            ["Desktop", Monitor],
            ["Tablet", Tablet],
            ["Mobile", Smartphone],
          ] as const).map(([label, Icon]) => (
            <button
              key={label}
              className={cn(
                "inline-flex h-8 items-center gap-2 rounded-lg px-3 text-sm text-[#62626d] hover:text-[#18181b]",
                viewport === label && "bg-white text-[#18181b] shadow-sm",
              )}
              onClick={() => setViewport(label)}
            >
              <Icon size={15} aria-hidden />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border border-[#e5e5e2] bg-white px-3 py-2 text-sm font-medium text-[#3f3f46]">
          <ExternalLink size={15} aria-hidden />
          Expand
        </button>
      </div>

      <div className="bg-[radial-gradient(circle_at_1px_1px,#e6e6e3_1px,transparent_0)] bg-[length:24px_24px] p-5 md:p-8">
        <div className={cn("mx-auto transition-all duration-200", widthClass)}>
          {component.slug === "table-data-grid" ? (
            <ModernDataTable loading={loadingState} bordered={bordered} striped={striped} stickyHeader={stickyHeader} density={density} />
          ) : (
            <div className="grid min-h-[420px] place-items-center rounded-2xl border border-[#e5e5e2] bg-white p-8">
              <div className="rounded-xl border border-[#e5e5e2] bg-[#fafafa] p-8" dangerouslySetInnerHTML={{ __html: component.previewHtml }} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ModernDataTable({
  loading,
  bordered,
  striped,
  stickyHeader,
  density,
}: {
  loading: boolean;
  bordered: boolean;
  striped: boolean;
  stickyHeader: boolean;
  density: "Compact" | "Comfortable";
}) {
  const rowPadding = density === "Compact" ? "py-2" : "py-4";

  return (
    <div className={cn("overflow-hidden rounded-2xl bg-white shadow-sm", bordered && "border border-[#e2e2df]")}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eeeeeb] bg-white px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold">Customers</h3>
          <p className="text-xs text-[#71717a]">Revenue, renewal and ownership overview</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">Live data</span>
          <button className="rounded-lg border border-[#e5e5e2] px-3 py-1.5 text-xs font-medium text-[#52525b]">Sort by spend</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead className={cn("bg-[#fafafa] text-left text-xs uppercase tracking-wide text-[#71717a]", stickyHeader && "sticky top-0")}>
            <tr>
              {["Customer", "Status", "Plan", "Spend", "Renewal Date", "Owner"].map((heading) => (
                <th key={heading} className="border-b border-[#eeeeeb] px-5 py-3 font-medium">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index} className="border-b border-[#f0f0ee]">
                    {Array.from({ length: 6 }).map((__, cellIndex) => (
                      <td key={cellIndex} className="px-5 py-4">
                        <span className="block h-3 animate-pulse rounded-full bg-[#eeeeeb]" />
                      </td>
                    ))}
                  </tr>
                ))
              : tableRows.map((row, index) => (
                  <tr key={row.customer} className={cn("border-b border-[#f0f0ee] last:border-0", striped && index % 2 === 1 && "bg-[#fbfbfa]")}>
                    <td className={cn("px-5 font-medium text-[#18181b]", rowPadding)}>{row.customer}</td>
                    <td className={cn("px-5", rowPadding)}><StatusBadge status={row.status} /></td>
                    <td className={cn("px-5 text-[#52525b]", rowPadding)}>{row.plan}</td>
                    <td className={cn("px-5 font-medium", rowPadding)}>{row.spend}</td>
                    <td className={cn("px-5 text-[#52525b]", rowPadding)}>{row.renewal}</td>
                    <td className={cn("px-5 text-[#52525b]", rowPadding)}>{row.owner}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-[#eeeeeb] bg-[#fafafa] px-5 py-3 text-sm text-[#71717a]">
        <span>1-5 of 42 customers</span>
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-[#e5e5e2] bg-white px-3 py-1.5 text-xs font-medium text-[#52525b]">Previous</button>
          <button className="rounded-lg bg-[#18181b] px-3 py-1.5 text-xs font-medium text-white">Next</button>
        </div>
      </div>
    </div>
  );
}

function PropertiesPanel({
  component,
  propertiesTab,
  setPropertiesTab,
  loadingState,
  setLoadingState,
  updateTableSettings,
}: {
  component: VaultComponent;
  propertiesTab: "Properties" | "Tokens";
  setPropertiesTab: (value: "Properties" | "Tokens") => void;
  loadingState: boolean;
  setLoadingState: (value: boolean) => void;
  updateTableSettings: ReturnType<typeof useVaultStore.getState>["updateTableSettings"];
}) {
  const tableSettings = useVaultStore((state) => state.tableSettings);

  return (
    <aside className="rounded-2xl border border-[#e5e5e2] bg-white p-4 shadow-[0_18px_60px_rgba(15,15,15,0.04)] xl:sticky xl:top-24 xl:max-h-[calc(100dvh-120px)] xl:overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Properties</h2>
          <p className="text-xs text-[#71717a]">{component.framework} component</p>
        </div>
        <Sparkles size={17} className="text-[#71717a]" aria-hidden />
      </div>

      <div className="mt-4 grid grid-cols-2 rounded-xl bg-[#f4f4f2] p-1 text-sm">
        {(["Properties", "Tokens"] as const).map((tab) => (
          <button key={tab} className={cn("rounded-lg px-3 py-2 text-[#62626d]", propertiesTab === tab && "bg-white text-[#18181b] shadow-sm")} onClick={() => setPropertiesTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {propertiesTab === "Properties" ? (
        <div className="mt-5 space-y-5">
          <PropertySelect label="Variant" value="Default" values={["Default", "Compact", "Selectable"]} />
          <PropertySelect label="Density" value={tableSettings.density} values={["Compact", "Comfortable"]} onChange={(value) => updateTableSettings({ density: value as "Compact" | "Comfortable" })} />
          <PropertySelect label="Selection" value="Multi row" values={["None", "Single row", "Multi row"]} />
          <PropertySelect label="Pagination" value={tableSettings.pagination ? "Enabled" : "Disabled"} values={["Enabled", "Disabled"]} onChange={(value) => updateTableSettings({ pagination: value === "Enabled" })} />
          <div className="space-y-3 border-t border-[#eeeeeb] pt-5">
            <PropertyToggle label="Striped rows" checked={tableSettings.stripedRows} onChange={(checked) => updateTableSettings({ stripedRows: checked })} />
            <PropertyToggle label="Bordered" checked={tableSettings.borders} onChange={(checked) => updateTableSettings({ borders: checked })} />
            <PropertyToggle label="Sticky header" checked={tableSettings.stickyHeader} onChange={(checked) => updateTableSettings({ stickyHeader: checked })} />
            <PropertyToggle label="Loading state" checked={loadingState} onChange={setLoadingState} />
          </div>
          <div className="rounded-xl border border-[#eeeeeb] bg-[#fafafa] p-3">
            <div className="text-xs font-medium uppercase tracking-wide text-[#a1a1aa]">Component Type</div>
            <div className="mt-2 flex items-center gap-2 text-sm font-medium">
              <Layers3 size={16} aria-hidden />
              Data Display
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {component.tokens.map((token) => (
            <div key={token.id} className="rounded-xl border border-[#eeeeeb] bg-[#fafafa] p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">{token.name}</span>
                {token.type === "color" ? <span className="size-5 rounded-full border border-[#ddddda]" style={{ background: token.value }} /> : null}
              </div>
              <p className="mt-1 text-xs text-[#71717a]">{token.value}</p>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}

function ContentTabs({ component, activeTab, setActiveTab, copyCode }: { component: VaultComponent; activeTab: DetailTab; setActiveTab: (tab: DetailTab) => void; copyCode: () => void }) {
  const tabs: DetailTab[] = ["Code", "Usage", "Accessibility", "Notes", "Changelog"];

  return (
    <section className="overflow-hidden rounded-2xl border border-[#e5e5e2] bg-white shadow-[0_18px_60px_rgba(15,15,15,0.04)]">
      <div className="flex overflow-x-auto border-b border-[#eeeeeb] px-2">
        {tabs.map((tab) => (
          <button key={tab} className={cn("border-b-2 border-transparent px-4 py-3 text-sm font-medium text-[#71717a]", activeTab === tab && "border-[#18181b] text-[#18181b]")} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>
      <div className="p-4 md:p-5">
        {activeTab === "Code" ? (
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileCode2 size={17} aria-hidden />
                <span className="text-sm font-semibold">Component.tsx</span>
                <select className="rounded-lg border border-[#e5e5e2] bg-white px-2 py-1 text-xs text-[#52525b]" defaultValue={component.framework}>
                  <option>React</option>
                  <option>HTML</option>
                  <option>TypeScript</option>
                </select>
              </div>
              <button className="inline-flex items-center gap-2 rounded-lg border border-[#e5e5e2] bg-white px-3 py-2 text-sm font-medium text-[#3f3f46]" onClick={copyCode}>
                <Copy size={15} aria-hidden />
                Copy snippet
              </button>
            </div>
            <pre className="max-h-[360px] overflow-auto rounded-xl bg-[#111113] p-5 text-sm leading-6 text-[#f4f4f5]"><code>{component.code}</code></pre>
          </div>
        ) : activeTab === "Usage" ? (
          <div className="grid gap-3 md:grid-cols-2">
            {component.usage.map((item) => (
              <a key={item.id} href={item.url} className="rounded-xl border border-[#eeeeeb] bg-[#fafafa] p-4 hover:bg-white">
                <div className="flex items-center justify-between gap-3">
                  <strong className="text-sm">{item.projectName}</strong>
                  <span className="text-xs text-[#71717a]">{item.count} uses</span>
                </div>
                <p className="mt-2 text-sm text-[#62626d]">{item.location}</p>
              </a>
            ))}
          </div>
        ) : activeTab === "Accessibility" ? (
          <div className="space-y-3 text-sm leading-7 text-[#52525b]">
            <p>Keyboard focus is visible, headers use semantic table structure, and interactive controls expose descriptive names.</p>
            <p>For selectable rows, pair checkbox states with row labels and preserve table navigation for screen readers.</p>
          </div>
        ) : activeTab === "Notes" ? (
          <p className="text-sm leading-7 text-[#52525b]">{component.notes}</p>
        ) : (
          <div className="space-y-3">
            {[
              ["v2.0.0", "Added pagination, sticky header support and improved density controls."],
              ["v1.8.0", "Improved empty and loading states for admin surfaces."],
              ["v1.4.0", "Added status badge composition and sortable columns."],
            ].map(([version, note]) => (
              <div key={version} className="rounded-xl border border-[#eeeeeb] bg-[#fafafa] p-4">
                <div className="text-sm font-semibold">{version}</div>
                <p className="mt-1 text-sm text-[#62626d]">{note}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Trial: "bg-blue-50 text-blue-700 ring-blue-200",
    Paused: "bg-amber-50 text-amber-700 ring-amber-200",
  }[status] ?? "bg-zinc-50 text-zinc-700 ring-zinc-200";

  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium ring-1", styles)}>{status}</span>;
}

function PropertySelect({ label, value, values, onChange }: { label: string; value: string; values: string[]; onChange?: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wide text-[#a1a1aa]">{label}</span>
      <select className="mt-2 h-10 w-full rounded-lg border border-[#e5e5e2] bg-white px-3 text-sm text-[#3f3f46]" value={value} onChange={(event) => onChange?.(event.target.value)}>
        {values.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </label>
  );
}

function PropertyToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      <span className="text-[#3f3f46]">{label}</span>
      <input className="size-4 accent-[#18181b]" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

function MetaPill({ label, tone }: { label: string; tone?: "success" }) {
  return <span className={cn("rounded-full border border-[#e5e5e2] bg-white px-3 py-1 text-sm", tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-700")}>{label}</span>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function modernDescription(component: VaultComponent) {
  if (component.slug === "table-data-grid") {
    return "A production-ready data grid for customer, revenue and workflow-heavy surfaces. Designed for fast scanning, reliable status visibility and flexible density controls.";
  }

  return component.description.replace("retro", "modern").replace("pressed-state bevel and ", "");
}

function normalizeCategory(category: string) {
  if (category === "Forms") return "Data Entry";
  if (category === "Buttons") return "Inputs";
  return category;
}
