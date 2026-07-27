"use client";

import { Grid2X2, List, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { CategoryFilters } from "@/components/library/category-filters";
import { ComponentSearch } from "@/components/library/component-search";
import { ComponentGrid } from "@/components/library/component-grid";
import { ComponentDetailPanel } from "@/components/detail/component-detail-panel";
import { visualCategory } from "@/components/library/category-style";
import { cn } from "@/lib/utils";
import { useVaultStore } from "@/stores/vault-store";
import type { VaultComponent } from "@/types/vault";

export function ComponentLibraryScreen({ favoriteOnly = false }: { favoriteOnly?: boolean }) {
  const router = useRouter();
  const components = useVaultStore((state) => state.components);
  const activeComponentSlug = useVaultStore((state) => state.activeComponentSlug);
  const setActiveComponentSlug = useVaultStore((state) => state.setActiveComponentSlug);
  const toggleFavorite = useVaultStore((state) => state.toggleFavorite);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("Newest");
  const [panelOpen, setPanelOpen] = useState(false);

  const selectedComponent = components.find((component) => component.slug === activeComponentSlug) ?? null;

  const filtered = useMemo(() => {
    const term = query.toLowerCase();
    return components
      .filter((component) => {
        const searchable = [component.name, component.category, visualCategory(component), component.framework, ...component.tags].join(" ").toLowerCase();
        const matchesQuery = searchable.includes(term);
        const matchesFilter = filter === "All" || visualCategory(component) === filter || component.category === filter;
        const matchesFavorite = !favoriteOnly || component.isFavorite;
        return matchesQuery && matchesFilter && matchesFavorite;
      })
      .sort((a, b) => {
        if (sort === "Name") return a.name.localeCompare(b.name);
        if (sort === "Most used") return b.usage.reduce((sum, item) => sum + item.count, 0) - a.usage.reduce((sum, item) => sum + item.count, 0);
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [components, favoriteOnly, filter, query, sort]);

  function selectComponent(component: VaultComponent) {
    setActiveComponentSlug(component.slug);
    setPanelOpen(true);
    window.history.replaceState(null, "", `/vault/components?component=${component.slug}`);
  }

  function openDetail(component: VaultComponent) {
    router.push(`/vault/components/${component.slug}`);
  }

  return (
    <AppShell active={favoriteOnly ? "Favorites" : "Library"}>
      <section className="px-4 py-6 md:px-7">
        <div className="mx-auto max-w-[1460px]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-[-0.035em] text-[#171A2B] md:text-5xl">{favoriteOnly ? "Favorite Components" : "Discover Components"}</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[#6D7285]">Explore, inspect and reuse production-ready interface components.</p>
            </div>
            <button
              className="inline-flex min-h-11 w-fit items-center gap-2 rounded-2xl bg-[#6366F1] px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200"
              onClick={() => {
                const target = components.find((component) => component.slug === "pricing-card") ?? components[0];
                selectComponent(target);
              }}
            >
              <Plus size={17} aria-hidden />
              New Component
            </button>
          </div>

          <div className="mt-7 rounded-[28px] border border-[#E4E7EF] bg-[#F2F4FA]/70 p-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
              <CategoryFilters active={filter} onChange={setFilter} />
              <div className="flex min-w-0 flex-1 flex-col gap-3 md:flex-row md:items-center xl:justify-end">
                <ComponentSearch value={query} onChange={setQuery} />
                <select className="min-h-11 rounded-2xl border border-[#E4E7EF] bg-white px-4 text-sm text-[#6D7285] shadow-sm" value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort components">
                  <option>Newest</option>
                  <option>Name</option>
                  <option>Most used</option>
                </select>
                <div className="flex w-fit rounded-2xl bg-white p-1 shadow-sm ring-1 ring-[#E4E7EF]">
                  <button className={cn("grid size-9 place-items-center rounded-xl text-[#6D7285]", view === "grid" && "bg-[#EEF0FF] text-[#6366F1]")} onClick={() => setView("grid")} aria-label="Grid view">
                    <Grid2X2 size={16} aria-hidden />
                  </button>
                  <button className={cn("grid size-9 place-items-center rounded-xl text-[#6D7285]", view === "list" && "bg-[#EEF0FF] text-[#6366F1]")} onClick={() => setView("list")} aria-label="List view">
                    <List size={16} aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between text-sm text-[#6D7285]">
            <span>{filtered.length} results</span>
            <span className="hidden sm:inline">Select a card to inspect it in the playground panel.</span>
          </div>

          <div className="mt-5">
            <ComponentGrid
              components={filtered}
              selectedSlug={panelOpen ? activeComponentSlug : undefined}
              view={view}
              onSelect={selectComponent}
              onFavorite={(component) => toggleFavorite(component.id)}
            />
          </div>
        </div>
      </section>

      <ComponentDetailPanel
        component={selectedComponent}
        open={panelOpen && Boolean(selectedComponent)}
        onClose={() => {
          setPanelOpen(false);
          window.history.replaceState(null, "", favoriteOnly ? "/vault/favorites" : "/vault/components");
        }}
      />

      {selectedComponent && panelOpen ? (
        <button
          className="fixed bottom-5 right-5 z-[60] hidden rounded-2xl bg-[#171A2B] px-4 py-3 text-sm font-semibold text-white shadow-xl xl:inline-flex"
          onClick={() => openDetail(selectedComponent)}
        >
          Open full detail
        </button>
      ) : null}
    </AppShell>
  );
}
