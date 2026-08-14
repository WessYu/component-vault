"use client";

import Link from "next/link";
import { Archive, Box, Clock, Grid2X2, Heart, LayoutGrid, List, Plus, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { CliShowcase } from "@/features/components/cli-showcase";
import { categories } from "@/services/demo-data";
import { cn } from "@/lib/utils";
import { useVaultStore } from "@/stores/vault-store";

const libraryNav = [
  { label: "Overview", href: "/vault", icon: LayoutGrid },
  { label: "All Components", href: "/vault/components", icon: Box },
  { label: "Browse", href: "/vault/components", icon: Search },
  { label: "Collections", href: "/vault/collections", icon: Archive },
  { label: "Favorites", href: "/vault/favorites", icon: Heart },
  { label: "Updates", href: "/vault/settings", icon: Clock },
];

export function ComponentLibraryScreen() {
  const components = useVaultStore((state) => state.components);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All Components");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    return components.filter((component) => {
      const haystack = [component.name, component.category, component.description, ...component.tags].join(" ").toLowerCase();
      const matchesQuery = haystack.includes(query.toLowerCase());
      const matchesCategory = category === "All Components" || component.category === category || normalizeCategory(component.category) === category;
      return matchesQuery && matchesCategory;
    });
  }, [category, components, query]);

  return (
    <main className="min-h-dvh bg-[#f7f7f5] text-[#18181b]">
      <div className="grid min-h-dvh lg:grid-cols-[280px_1fr]">
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
            <span className="sr-only">Search components</span>
            <input className="min-w-0 flex-1 bg-transparent outline-none" value={query} placeholder="Search components" onChange={(event) => setQuery(event.target.value)} />
          </label>

          <nav className="mt-6 space-y-1" aria-label="Primary navigation">
            {libraryNav.map((item) => {
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
              {["All Components", "Data Display", "Inputs", "Navigation", "Feedback", "Data Entry", "Surfaces", "Charts", "Utilities"].map((item) => {
                const count =
                  item === "All Components"
                    ? components.length
                    : components.filter((component) => component.category === item || normalizeCategory(component.category) === item).length;
                return (
                  <button
                    key={item}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-[#62626d] hover:bg-[#f4f4f2] hover:text-[#18181b]",
                      category === item && "bg-[#f4f4f2] text-[#18181b]",
                    )}
                    onClick={() => setCategory(item)}
                  >
                    <span>{item}</span>
                    <span className="text-xs text-[#a1a1aa]">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <section className="min-w-0 px-5 py-6 md:px-8">
          <header className="mx-auto flex max-w-7xl flex-col gap-6 border-b border-[#e6e6e3] pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-[#e5e5e2] bg-white px-3 py-1 text-sm text-[#62626d] shadow-sm">
                <Sparkles size={14} aria-hidden />
                Component system
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.02em] md:text-5xl">All Components</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[#62626d]">
                Browse reusable UI building blocks, inspect usage guidance and open focused component documentation.
              </p>
            </div>
            <button className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#18181b] px-4 py-2.5 text-sm font-medium text-white shadow-sm">
              <Plus size={16} aria-hidden />
              New Component
            </button>
          </header>

          <div className="mx-auto mt-8 max-w-7xl">
            <CliShowcase />
          </div>

          <div className="mx-auto mt-7 max-w-7xl">
            <div className="flex flex-col gap-3 rounded-2xl border border-[#e5e5e2] bg-white p-3 shadow-[0_18px_60px_rgba(15,15,15,0.04)] md:flex-row md:items-center">
              <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl bg-[#fafafa] px-3 text-sm text-[#71717a]">
                <Search size={16} aria-hidden />
                <span className="sr-only">Search library</span>
                <input className="min-w-0 flex-1 bg-transparent outline-none" value={query} placeholder="Search by name, category or tag" onChange={(event) => setQuery(event.target.value)} />
              </label>
              <select className="h-11 rounded-xl border border-[#e5e5e2] bg-white px-3 text-sm text-[#3f3f46]" value={category} onChange={(event) => setCategory(event.target.value)}>
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
                <option>Inputs</option>
                <option>Data Entry</option>
              </select>
              <div className="flex rounded-xl bg-[#f4f4f2] p-1">
                <button className={cn("rounded-lg px-3 py-2 text-sm text-[#62626d]", view === "grid" && "bg-white text-[#18181b] shadow-sm")} onClick={() => setView("grid")} aria-label="Grid view">
                  <Grid2X2 size={16} aria-hidden />
                </button>
                <button className={cn("rounded-lg px-3 py-2 text-sm text-[#62626d]", view === "list" && "bg-white text-[#18181b] shadow-sm")} onClick={() => setView("list")} aria-label="List view">
                  <List size={16} aria-hidden />
                </button>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between text-sm text-[#62626d]">
              <span>{filtered.length} components found</span>
              <span>Sorted by recently updated</span>
            </div>

            <div className={cn("mt-4", view === "grid" ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3" : "space-y-3")}>
              {filtered.map((component) => (
                <Link
                  key={component.slug}
                  href={`/vault/components/${component.slug}`}
                  className={cn(
                    "group rounded-2xl border border-[#e5e5e2] bg-white p-4 shadow-[0_18px_60px_rgba(15,15,15,0.035)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_70px_rgba(15,15,15,0.08)]",
                    view === "list" && "grid gap-4 md:grid-cols-[1fr_auto]",
                  )}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-base font-semibold tracking-[-0.01em]">{component.name}</h2>
                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#62626d]">{modernDescription(component.description)}</p>
                      </div>
                      <span className="rounded-full bg-[#f4f4f2] px-2.5 py-1 text-xs font-medium text-[#62626d]">{component.version}</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">{component.category}</span>
                      {component.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="rounded-full border border-[#e5e5e2] px-2.5 py-1 text-xs text-[#62626d]">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-5 rounded-xl border border-[#eeeeeb] bg-[#fafafa] p-4 text-sm text-[#71717a] group-hover:bg-white md:mt-0">
                    <div className="flex items-center justify-between">
                      <span>Updated</span>
                      <span>{new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(component.updatedAt))}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function normalizeCategory(category: string) {
  if (category === "Forms") return "Data Entry";
  if (category === "Buttons") return "Inputs";
  return category;
}

function modernDescription(value: string) {
  return value.replace("retro ", "").replace("pressed-state bevel and ", "");
}
