"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight, Copy, Heart, PanelRightOpen, Share2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ComponentPreview } from "@/components/detail/component-preview";
import { ComponentDetailTabs, type DetailTab } from "@/components/detail/component-tabs";
import { PreviewToolbar } from "@/components/detail/component-detail-panel";
import { PropertiesEditor, defaultPricingOptions, defaultTableOptions, type PricingOptions, type TableOptions } from "@/components/detail/properties-editor";
import { categoryStyle, visualCategory } from "@/components/library/category-style";
import { ExperienceChecklist, ExperienceWorkspace } from "@/components/experiences/shared/experience-shell";
import type { ExperienceSlug } from "@/components/experiences/experience-data";
import { useVaultStore } from "@/stores/vault-store";

export function ComponentDetailWorkspace({ slug }: { slug: string }) {
  const components = useVaultStore((state) => state.components);
  const setActiveComponentSlug = useVaultStore((state) => state.setActiveComponentSlug);
  const toggleFavorite = useVaultStore((state) => state.toggleFavorite);
  const component = components.find((item) => item.slug === slug);
  const [viewport, setViewport] = useState<"Desktop" | "Tablet" | "Mobile">("Desktop");
  const [theme, setTheme] = useState<"Light" | "Dark">("Light");
  const [activeTab, setActiveTab] = useState<DetailTab>("Code");
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tableOptions, setTableOptions] = useState<TableOptions>(() => defaultTableOptions());
  const [pricingOptions, setPricingOptions] = useState<PricingOptions>(() => defaultPricingOptions());

  useEffect(() => {
    setActiveComponentSlug(slug);
  }, [setActiveComponentSlug, slug]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setCustomizeOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!component) {
    return (
      <AppShell>
        <div className="grid min-h-[calc(100dvh-64px)] place-items-center px-5 text-center">
          <div>
            <p className="text-sm font-semibold text-[#FF7664]">Component not found</p>
            <h1 className="mt-2 text-3xl font-bold">{slug}</h1>
            <Link className="mt-6 inline-flex min-h-11 items-center rounded-2xl bg-[#6366F1] px-5 text-sm font-semibold text-white" href="/vault/components">
              Back to library
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const style = categoryStyle(component);
  const isMotionExperience = component.category === "Motion Experiences";

  async function copyCode() {
    if (!component) return;
    await navigator.clipboard.writeText(component.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1300);
  }

  return (
    <AppShell active="Library">
      <section className="px-4 py-6 md:px-7">
        <div className="mx-auto max-w-[1460px]">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-[#6D7285]" aria-label="Breadcrumb">
            <Link href="/vault/components" className="hover:text-[#171A2B]">All Components</Link>
            <ChevronRight size={14} aria-hidden />
            <Link href="/vault/components" className="hover:text-[#171A2B]">{visualCategory(component)}</Link>
            <ChevronRight size={14} aria-hidden />
            <span className="font-medium text-[#171A2B]">{component.name}</span>
          </nav>

          <div className="mt-5 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold" style={{ background: style.soft, color: style.text }}>
                {visualCategory(component)}
              </span>
              <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-[#171A2B] md:text-6xl">{component.name}</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#6D7285]">{component.description}</p>
              <div className="mt-5 flex flex-wrap gap-2 text-sm">
                <span className="rounded-full border border-[#E4E7EF] bg-white px-3 py-1 text-[#6D7285]">{component.version}</span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">Production ready</span>
                <span className="rounded-full border border-[#E4E7EF] bg-white px-3 py-1 text-[#6D7285]">Updated {new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(component.updatedAt))}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button className="grid size-11 place-items-center rounded-2xl border border-[#E4E7EF] bg-white text-[#6D7285] shadow-sm" onClick={() => toggleFavorite(component.id)} aria-label="Favorite component">
                <Heart size={18} fill={component.isFavorite ? style.accent : "none"} color={component.isFavorite ? style.accent : "currentColor"} aria-hidden />
              </button>
              <button className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-[#E4E7EF] bg-white px-4 text-sm font-semibold text-[#171A2B] shadow-sm" onClick={() => navigator.clipboard.writeText(window.location.href)}>
                <Share2 size={17} aria-hidden />
                Share
              </button>
              <button className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-[#E4E7EF] bg-white px-4 text-sm font-semibold text-[#171A2B] shadow-sm" onClick={copyCode}>
                {copied ? <Check size={17} aria-hidden /> : <Copy size={17} aria-hidden />}
                {copied ? "Copied" : "Copy code"}
              </button>
              {!isMotionExperience ? (
                <button className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[#6366F1] px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200" onClick={() => setCustomizeOpen(true)}>
                  <PanelRightOpen size={17} aria-hidden />
                  Customize
                </button>
              ) : null}
            </div>
          </div>

          {isMotionExperience ? (
            <div className="mt-8 space-y-5">
              <ExperienceChecklist />
              <ExperienceWorkspace slug={component.slug as ExperienceSlug} />
            </div>
          ) : (
            <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="min-w-0 space-y-6">
                <section className="rounded-[32px] border border-[#E4E7EF] bg-white p-4 shadow-[0_18px_70px_rgba(23,26,43,0.05)]">
                  <div className="mb-4">
                    <PreviewToolbar viewport={viewport} setViewport={setViewport} theme={theme} setTheme={setTheme} />
                  </div>
                  <ComponentPreview component={component} viewport={viewport} theme={theme} tableOptions={tableOptions} pricingOptions={pricingOptions} />
                </section>
                <ComponentDetailTabs component={component} active={activeTab} onChange={setActiveTab} />
              </div>

              <aside className="hidden rounded-[32px] border border-[#E4E7EF] bg-white p-5 shadow-[0_18px_70px_rgba(23,26,43,0.05)] xl:block">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold">Props editor</h2>
                    <p className="text-sm text-[#6D7285]">Changes update the preview.</p>
                  </div>
                  <span className="rounded-full bg-[#EEF0FF] px-3 py-1 text-xs font-semibold text-[#6366F1]">Live</span>
                </div>
                <PropertiesEditor component={component} tableOptions={tableOptions} setTableOptions={setTableOptions} pricingOptions={pricingOptions} setPricingOptions={setPricingOptions} />
              </aside>
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {customizeOpen ? (
          <motion.div className="fixed inset-0 z-50 bg-[#171A2B]/24 backdrop-blur-sm xl:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={() => setCustomizeOpen(false)}>
            <motion.aside
              className="absolute inset-x-0 bottom-0 max-h-[82dvh] overflow-auto rounded-t-[32px] bg-white p-5 shadow-2xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-bold">Customize props</h2>
                <button className="grid size-10 place-items-center rounded-2xl bg-[#F2F4FA]" onClick={() => setCustomizeOpen(false)} aria-label="Close props">
                  <X size={18} aria-hidden />
                </button>
              </div>
              <PropertiesEditor component={component} tableOptions={tableOptions} setTableOptions={setTableOptions} pricingOptions={pricingOptions} setPricingOptions={setPricingOptions} />
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </AppShell>
  );
}
