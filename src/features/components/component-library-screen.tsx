"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Activity, Boxes, Grid2X2, Layers3, List, Monitor, Plus, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Text } from "@/components/ui/text";
import { CategoryFilters } from "@/components/library/category-filters";
import { ComponentSearch } from "@/components/library/component-search";
import { ComponentGrid } from "@/components/library/component-grid";
import { InteractiveExperiencesSection } from "@/components/library/interactive-experiences-section";
import { ComponentDetailPanel } from "@/components/detail/component-detail-panel";
import { visualCategory } from "@/components/library/category-style";
import { motionEase, Reveal } from "@/components/motion/site-motion";
import { CliShowcase } from "@/features/components/cli-showcase";
import { cliWorkflowComponent } from "@/services/catalog-components";
import { cn } from "@/lib/utils";
import { useVaultStore } from "@/stores/vault-store";
import type { VaultComponent } from "@/types/vault";

export function ComponentLibraryScreen({ favoriteOnly = false }: { favoriteOnly?: boolean }) {
  const router = useRouter();
  const storedComponents = useVaultStore((state) => state.components);
  const components = useMemo(
    () => storedComponents.some((component) => component.id === cliWorkflowComponent.id) ? storedComponents : [cliWorkflowComponent, ...storedComponents],
    [storedComponents],
  );
  const activeComponentSlug = useVaultStore((state) => state.activeComponentSlug);
  const setActiveComponentSlug = useVaultStore((state) => state.setActiveComponentSlug);
  const toggleFavorite = useVaultStore((state) => state.toggleFavorite);
  const createComponent = useVaultStore((state) => state.createComponent);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("Newest");
  const [panelOpen, setPanelOpen] = useState(false);
  const reduceMotion = useReducedMotion();

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

  const motionExperiences = filtered.filter((component) => component.category === "Motion Experiences");
  const standardComponents = filtered.filter((component) => component.category !== "Motion Experiences");
  const libraryStats = [
    { label: "Components", value: filtered.length, icon: Boxes },
    { label: "Motion", value: motionExperiences.length, icon: Activity },
    { label: "Categories", value: new Set(filtered.map((component) => visualCategory(component))).size, icon: Layers3 },
    { label: "Frameworks", value: new Set(filtered.map((component) => component.framework)).size, icon: Monitor },
  ];

  function selectComponent(component: VaultComponent) {
    setActiveComponentSlug(component.slug);
    setPanelOpen(true);
    window.history.replaceState(null, "", `/vault/components?component=${component.slug}`);
  }

  function openDetail(component: VaultComponent) {
    router.push(`/vault/components/${component.slug}`);
  }

  async function handleCreate() {
    const component = await createComponent({
      name: "Untitled Component",
      description: "New backend-backed component ready for code, usage notes and preview configuration.",
      tags: ["draft", "backend"],
    });
    if (component) selectComponent(component);
  }

  return (
    <AppShell active={favoriteOnly ? "Favorites" : "Library"}>
      <section className="relative px-3 py-5 sm:px-5 md:px-7 md:py-8 xl:px-8">
        <div className="mx-auto max-w-[1680px]">
          <motion.div
            className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,520px)] xl:items-end"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: motionEase }}
          >
            <div className="min-w-0">
              <motion.p
                className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#E4E7EF] bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#6366F1] shadow-sm backdrop-blur"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.38, delay: 0.06 }}
              >
                <Sparkles size={13} aria-hidden />
                Visual playground
              </motion.p>
              <Text.H1 className="max-w-4xl">{favoriteOnly ? "Favorite Components" : "Discover Components"}</Text.H1>
              <Text.Paragraph className="mt-3 max-w-3xl">Explore, inspect and reuse production-ready interface components with responsive previews and motion-safe interactions.</Text.Paragraph>
            </div>
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {libraryStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      className="min-w-0 rounded-[18px] border border-white/80 bg-white/78 p-3 shadow-[0_12px_34px_rgba(23,26,43,0.045)] backdrop-blur md:rounded-[22px] md:p-4"
                      initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.985 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.34, delay: 0.08 + index * 0.035, ease: motionEase }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-[#7A8194]">{stat.label}</span>
                        <Icon className="shrink-0 text-[#6366F1]" size={15} aria-hidden />
                      </div>
                      <strong className="mt-2 block text-2xl font-bold tracking-[-0.04em] text-text-primary">{stat.value}</strong>
                    </motion.div>
                  );
                })}
              </div>
              <motion.button
                className="group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#171A2B] px-4 text-sm font-semibold text-white shadow-lg shadow-[#171A2B]/10 sm:w-fit xl:justify-self-end"
                onClick={() => void handleCreate()}
                whileHover={reduceMotion ? undefined : { y: -3, scale: 1.012 }}
                whileTap={reduceMotion ? undefined : { scale: 0.96 }}
              >
                <motion.span whileHover={reduceMotion ? undefined : { rotate: 90 }}><Plus size={17} aria-hidden /></motion.span>
                New Component
              </motion.button>
            </div>
          </motion.div>

          {!favoriteOnly ? <Reveal className="mt-8" amount={0.08}><CliShowcase /></Reveal> : null}

          <motion.div
            id="component-filters"
            className="mt-6 scroll-mt-24 rounded-[22px] border border-white/80 bg-white/72 p-2.5 shadow-[0_18px_70px_rgba(23,26,43,0.045)] backdrop-blur-xl md:rounded-[28px] md:p-3"
            initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.08, ease: motionEase }}
          >
            <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center">
              <CategoryFilters active={filter} onChange={setFilter} />
              <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-center 2xl:justify-end">
                <ComponentSearch value={query} onChange={setQuery} />
                <motion.select className="min-h-11 w-full rounded-2xl border border-[#E4E7EF] bg-white px-4 text-sm text-[#6D7285] shadow-sm lg:w-[152px]" value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort components" whileFocus={reduceMotion ? undefined : { scale: 1.01 }}>
                  <option>Newest</option><option>Name</option><option>Most used</option>
                </motion.select>
                <div className="relative flex w-fit rounded-2xl bg-white p-1 shadow-sm ring-1 ring-[#E4E7EF]">
                  <motion.span className="absolute left-1 top-1 size-9 rounded-xl bg-[#EEF0FF]" initial={false} animate={{ x: view === "grid" ? 0 : 36 }} transition={{ type: "spring", stiffness: 360, damping: 30 }} />
                  <button className={cn("relative z-10 grid size-9 place-items-center rounded-xl text-[#6D7285]", view === "grid" && "text-[#6366F1]")} onClick={() => setView("grid")} aria-label="Grid view"><Grid2X2 size={16} aria-hidden /></button>
                  <button className={cn("relative z-10 grid size-9 place-items-center rounded-xl text-[#6D7285]", view === "list" && "text-[#6366F1]")} onClick={() => setView("list")} aria-label="List view"><List size={16} aria-hidden /></button>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="mt-4 flex flex-col gap-2 text-sm text-[#6D7285] sm:flex-row sm:items-center sm:justify-between">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span className="w-fit rounded-full border border-white/80 bg-white/70 px-3 py-1 font-semibold text-text-primary shadow-sm backdrop-blur" key={`${filtered.length}-${filter}-${query}`} initial={reduceMotion ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -5 }} transition={{ duration: 0.18 }}>{filtered.length} results</motion.span>
            </AnimatePresence>
            <span className="hidden sm:inline">Select a card to inspect it in the playground panel.</span>
          </div>

          {!favoriteOnly && motionExperiences.length ? <Reveal className="mt-5" amount={0.08}><InteractiveExperiencesSection experiences={motionExperiences} /></Reveal> : null}

          <div className="mt-5">
            <ComponentGrid components={favoriteOnly ? filtered : standardComponents} selectedSlug={panelOpen ? activeComponentSlug : undefined} view={view} onSelect={selectComponent} onFavorite={(component) => toggleFavorite(component.id)} />
          </div>
        </div>
      </section>

      <ComponentDetailPanel key={`${selectedComponent?.id ?? "none"}-${panelOpen ? "open" : "closed"}`} component={selectedComponent} open={panelOpen && Boolean(selectedComponent)} onClose={() => { setPanelOpen(false); window.history.replaceState(null, "", favoriteOnly ? "/vault/favorites" : "/vault/components"); }} />

      <AnimatePresence>
        {selectedComponent && panelOpen ? (
          <motion.button className="fixed bottom-5 right-5 z-[60] hidden rounded-2xl bg-[#171A2B] px-4 py-3 text-sm font-semibold text-white shadow-xl xl:inline-flex" onClick={() => openDetail(selectedComponent)} initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduceMotion ? undefined : { opacity: 0, y: 10, scale: 0.97 }} whileHover={reduceMotion ? undefined : { y: -3 }} whileTap={reduceMotion ? undefined : { scale: 0.96 }}>Open full detail</motion.button>
        ) : null}
      </AnimatePresence>
    </AppShell>
  );
}
