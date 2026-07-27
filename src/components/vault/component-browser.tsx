"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Filter, Grid2X2, List, MoreHorizontal, Search, Star } from "lucide-react";
import { categories, demoCollections, filterGroups } from "@/services/demo-data";
import { cn } from "@/lib/utils";
import { useVaultStore } from "@/stores/vault-store";

export function ComponentBrowser({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const components = useVaultStore((state) => state.components);
  const selectedComponentId = useVaultStore((state) => state.selectedComponentId);
  const search = useVaultStore((state) => state.search);
  const category = useVaultStore((state) => state.category);
  const viewMode = useVaultStore((state) => state.viewMode);
  const setSearch = useVaultStore((state) => state.setSearch);
  const setCategory = useVaultStore((state) => state.setCategory);
  const setViewMode = useVaultStore((state) => state.setViewMode);
  const toggleFavorite = useVaultStore((state) => state.toggleFavorite);
  const setSelectedComponent = useVaultStore((state) => state.setSelectedComponent);

  const filtered = useMemo(() => {
    return components.filter((component) => {
      const matchesSearch = [component.name, component.description, component.category, ...component.tags].join(" ").toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "All Components" || component.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [components, search, category]);

  function selectComponent(id: string) {
    setSelectedComponent(id);
    router.push(`/vault/components/${id}`);
  }

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_1fr] bg-surface-light">
      <div className="border-b border-surface-dark p-2">
        <div className="flex items-center gap-2">
          <label className="retro-panel-inset flex min-w-0 flex-1 items-center gap-2 bg-surface-light px-2 py-1">
            <Search size={15} aria-hidden />
            <span className="sr-only">Search components</span>
            <input
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              value={search}
              placeholder="Search components..."
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <button className="pressable grid size-8 place-items-center bg-surface" aria-label="Open filters">
            <Filter size={15} aria-hidden />
          </button>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div className="flex overflow-x-auto">
            {filterGroups.map((filter) => (
              <button
                key={filter}
                className={cn("border border-border-dark px-2 py-1 font-tech text-[10px] uppercase hover:bg-surface", filter === "All Components" && "bg-olive text-surface-light")}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1">
            <select className="retro-panel-inset bg-surface-light px-2 py-1 text-xs" aria-label="Sort components">
              <option>Sort: Recently Added</option>
              <option>Sort: Name</option>
              <option>Sort: Version</option>
            </select>
            <button className="pressable grid size-8 place-items-center bg-surface" data-active={viewMode === "grid"} aria-label="Grid view" onClick={() => setViewMode("grid")}>
              <Grid2X2 size={14} aria-hidden />
            </button>
            <button className="pressable grid size-8 place-items-center bg-surface" data-active={viewMode === "list"} aria-label="List view" onClick={() => setViewMode("list")}>
              <List size={14} aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <div className={cn("grid min-h-0", compact ? "grid-cols-1" : "md:grid-cols-[190px_1fr]")}>
        {!compact ? (
          <aside className="hidden min-h-0 overflow-y-auto border-r border-surface-dark p-3 md:block">
            <h3 className="font-tech text-xs font-bold uppercase">Categories</h3>
            <div className="mt-2 space-y-1">
              {categories.map((item) => {
                const count = item === "All Components" ? components.length : components.filter((component) => component.category === item).length;
                return (
                  <button
                    key={item}
                    data-active={category === item}
                    className="flex w-full items-center justify-between px-2 py-1 text-left text-xs hover:bg-surface data-[active=true]:bg-olive data-[active=true]:text-surface-light"
                    onClick={() => setCategory(item)}
                  >
                    <span>{item}</span>
                    <span>{count}</span>
                  </button>
                );
              })}
            </div>
            <h3 className="mt-5 font-tech text-xs font-bold uppercase">Collections</h3>
            <div className="mt-2 space-y-1">
              {demoCollections.map((collection) => (
                <button key={collection.id} className="flex w-full items-center justify-between px-2 py-1 text-left text-xs hover:bg-surface">
                  <span>{collection.name}</span>
                  <span>{collection.componentIds.length}</span>
                </button>
              ))}
            </div>
            <button className="mt-3 text-xs text-navy hover:underline">Create new collection...</button>
          </aside>
        ) : null}

        <section className="min-h-0 overflow-y-auto p-3 thin-scrollbar">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-tech text-xs font-bold uppercase">{filtered.length} Components</h2>
            <span className="font-tech text-[10px] text-text-secondary">Grid: 8px / Guides: ON</span>
          </div>

          <div className={viewMode === "grid" ? "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3" : "space-y-2"}>
            {filtered.map((component) => (
              <article
                key={component.id}
                data-active={selectedComponentId === component.id}
                className={cn(
                  "retro-panel cursor-pointer bg-surface-light p-2 transition duration-150 hover:-translate-y-0.5",
                  viewMode === "list" && "grid grid-cols-[160px_1fr] gap-3",
                  "data-[active=true]:outline data-[active=true]:outline-2 data-[active=true]:outline-orange",
                )}
                onClick={() => selectComponent(component.id)}
              >
                <div className="dot-grid grid min-h-24 place-items-center overflow-hidden border border-surface-dark bg-background p-3" dangerouslySetInnerHTML={{ __html: component.previewHtml }} />
                <div className="mt-2 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-tech text-xs font-bold">{component.name}</h3>
                    <p className="mt-1 text-[11px] text-text-secondary">{component.version} · {component.category}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {component.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="border border-surface-dark px-1.5 py-0.5 text-[10px]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      className="grid size-6 place-items-center text-warning"
                      aria-label={component.isFavorite ? "Remove favorite" : "Add favorite"}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleFavorite(component.id);
                      }}
                    >
                      <Star size={15} fill={component.isFavorite ? "currentColor" : "none"} aria-hidden />
                    </button>
                    <button className="grid size-6 place-items-center" aria-label="Component actions" onClick={(event) => event.stopPropagation()}>
                      <MoreHorizontal size={15} aria-hidden />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
