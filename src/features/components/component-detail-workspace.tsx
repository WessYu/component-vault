"use client";

import Link from "next/link";
import { ArrowLeft, Copy, MoreHorizontal, Save, Star } from "lucide-react";
import { useEffect } from "react";
import { TopBar } from "@/components/desktop/top-bar";
import { SideDock } from "@/components/desktop/side-dock";
import { FocusedTaskbar } from "@/components/desktop/focused-taskbar";
import { LivePreview } from "@/components/preview/live-preview";
import { InspectorPanel } from "@/components/inspector/inspector-panel";
import { ComponentExplorer } from "@/features/components/component-explorer";
import { EditorDock } from "@/components/editor/editor-dock";
import { MobileDetailTabs } from "@/features/components/mobile-detail-tabs";
import { useVaultStore } from "@/stores/vault-store";

export function ComponentDetailWorkspace({ slug }: { slug: string }) {
  const components = useVaultStore((state) => state.components);
  const setActiveComponentSlug = useVaultStore((state) => state.setActiveComponentSlug);
  const addLog = useVaultStore((state) => state.addLog);
  const toggleFavorite = useVaultStore((state) => state.toggleFavorite);
  const component = components.find((item) => item.slug === slug);

  useEffect(() => {
    setActiveComponentSlug(slug);
  }, [setActiveComponentSlug, slug]);

  async function copyCode() {
    if (!component) return;
    await navigator.clipboard.writeText(component.code);
    addLog("Code copied.");
  }

  if (!component) {
    return (
      <main className="flex min-h-dvh flex-col gap-1 bg-background p-1">
        <TopBar />
        <div className="retro-panel grid flex-1 place-items-center bg-surface-light p-6 text-center">
          <div>
            <p className="font-tech text-xs font-bold uppercase text-danger">Component not found</p>
            <h1 className="mt-2 font-tech text-3xl font-bold">{slug}</h1>
            <Link href="/vault/components" className="pressable mt-6 inline-flex bg-navy px-4 py-2 font-tech text-xs font-bold uppercase text-surface-light">
              Back to Library
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-dvh flex-col gap-1 overflow-hidden bg-background p-1 text-text-primary">
      <TopBar />
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-1 md:grid-cols-[96px_1fr]">
        <SideDock active="Browser" />
        <section className="grid min-h-0 grid-rows-[auto_1fr] overflow-hidden">
          <header className="retro-panel flex flex-wrap items-center justify-between gap-3 bg-surface-light px-4 py-3">
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2 font-tech text-[11px] uppercase text-text-secondary">
                <Link className="inline-flex items-center gap-1 hover:text-navy" href="/vault/components">
                  <ArrowLeft size={13} aria-hidden />
                  Components
                </Link>
                <span>/</span>
                <span>{component.category}</span>
                <span>/</span>
                <span>{component.name}</span>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <h1 className="truncate font-tech text-3xl font-bold uppercase leading-none md:text-4xl">{component.name}</h1>
                <span className="font-tech text-sm font-bold text-navy">{component.version}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button className="pressable inline-flex items-center gap-2 bg-navy px-3 py-2 font-tech text-xs font-bold uppercase text-surface-light" onClick={() => addLog("Component saved.")}>
                <Save size={14} aria-hidden />
                Save
              </button>
              <button className="pressable inline-flex items-center gap-2 bg-surface px-3 py-2 font-tech text-xs font-bold uppercase" onClick={copyCode}>
                <Copy size={14} aria-hidden />
                Copy Code
              </button>
              <button className="pressable grid size-9 place-items-center bg-surface" aria-label="Favorite component" onClick={() => toggleFavorite(component.id)}>
                <Star size={16} fill={component.isFavorite ? "currentColor" : "none"} className="text-warning" aria-hidden />
              </button>
              <button className="pressable grid size-9 place-items-center bg-surface" aria-label="More options">
                <MoreHorizontal size={16} aria-hidden />
              </button>
              <Link className="pressable bg-surface-light px-3 py-2 font-tech text-xs font-bold uppercase" href="/vault/components">
                Back to Library
              </Link>
            </div>
          </header>

          <div className="hidden min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-1 md:grid">
            <div className="grid min-h-0 grid-cols-[220px_minmax(0,1fr)_300px] gap-1">
              <ComponentExplorer activeSlug={slug} />
              <section className="retro-panel min-h-0 overflow-hidden bg-surface-light">
                <div className="window-titlebar flex h-7 items-center px-2 font-tech text-[11px] font-bold uppercase">PREVIEW.LIVE</div>
                <LivePreview focused componentSlug={slug} />
              </section>
              <aside className="retro-panel min-h-0 overflow-hidden">
                <div className="window-titlebar flex h-7 items-center px-2 font-tech text-[11px] font-bold uppercase">INSPECTOR.NOTES</div>
                <InspectorPanel focused componentSlug={slug} />
              </aside>
            </div>
            <EditorDock componentSlug={slug} />
          </div>

          <MobileDetailTabs componentSlug={slug} />
        </section>
      </div>
      <FocusedTaskbar />
    </main>
  );
}
