"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Heart, Link2, Maximize2, Monitor, Share2, Smartphone, Tablet, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ComponentPreview } from "@/components/detail/component-preview";
import { CodeViewer } from "@/components/detail/code-viewer";
import { PanelTabs } from "@/components/detail/component-tabs";
import { PropertiesEditor, defaultPricingOptions, defaultTableOptions, type PricingOptions, type TableOptions } from "@/components/detail/properties-editor";
import { categoryStyle, visualCategory } from "@/components/library/category-style";
import { cn } from "@/lib/utils";
import { useVaultStore } from "@/stores/vault-store";
import type { VaultComponent } from "@/types/vault";

export function ComponentDetailPanel({ component, open, onClose }: { component: VaultComponent | null; open: boolean; onClose: () => void }) {
  const toggleFavorite = useVaultStore((state) => state.toggleFavorite);
  const [tab, setTab] = useState<"Preview" | "Code" | "Usage" | "Props">("Preview");
  const [viewport, setViewport] = useState<"Desktop" | "Tablet" | "Mobile">("Desktop");
  const [theme, setTheme] = useState<"Light" | "Dark">("Light");
  const [copied, setCopied] = useState(false);
  const [tableOptions, setTableOptions] = useState<TableOptions>(() => defaultTableOptions());
  const [pricingOptions, setPricingOptions] = useState<PricingOptions>(() => defaultPricingOptions());

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    if (open) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!component) return null;

  const style = categoryStyle(component);

  async function copyCode() {
    if (!component) return;
    await navigator.clipboard.writeText(component.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1300);
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-50 bg-[#171A2B]/24 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.aside
            className="ml-auto flex h-full w-full max-w-[520px] flex-col overflow-hidden border-l border-[#E4E7EF] bg-white shadow-2xl shadow-[#171A2B]/18 sm:rounded-l-[32px]"
            initial={{ x: 520 }}
            animate={{ x: 0 }}
            exit={{ x: 520 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`${component.name} details`}
          >
            <div className="flex items-center justify-between gap-3 border-b border-[#E4E7EF] px-5 py-4">
              <button className="inline-flex min-h-10 items-center gap-2 rounded-2xl bg-[#F2F4FA] px-3 text-sm font-medium text-[#6D7285]" onClick={onClose}>
                ← Back
              </button>
              <div className="flex items-center gap-1">
                <button className="grid size-10 place-items-center rounded-2xl text-[#6D7285] hover:bg-[#F2F4FA]" onClick={() => toggleFavorite(component.id)} aria-label="Favorite">
                  <Heart size={17} fill={component.isFavorite ? style.accent : "none"} color={component.isFavorite ? style.accent : "currentColor"} aria-hidden />
                </button>
                <button className="grid size-10 place-items-center rounded-2xl text-[#6D7285] hover:bg-[#F2F4FA]" aria-label="Share" onClick={() => navigator.clipboard.writeText(window.location.href)}>
                  <Share2 size={17} aria-hidden />
                </button>
                <button className="grid size-10 place-items-center rounded-2xl text-[#6D7285] hover:bg-[#F2F4FA]" aria-label="Copy link" onClick={() => navigator.clipboard.writeText(window.location.href)}>
                  <Link2 size={17} aria-hidden />
                </button>
                <button className="grid size-10 place-items-center rounded-2xl text-[#6D7285] hover:bg-[#F2F4FA]" onClick={onClose} aria-label="Close panel">
                  <X size={18} aria-hidden />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto">
              <div className="px-5 py-5">
                <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: style.soft, color: style.text }}>
                  {visualCategory(component)}
                </span>
                <h2 className="mt-3 text-2xl font-bold tracking-[-0.02em] text-[#171A2B]">{component.name}</h2>
                <p className="mt-2 text-sm leading-6 text-[#6D7285]">{component.description}</p>
                <div className="mt-4 flex items-center gap-3 text-xs text-[#9A9FB1]">
                  <span>{component.version}</span>
                  <span>•</span>
                  <span>{component.usage.reduce((sum, item) => sum + item.count, 0)} uses</span>
                  <span>•</span>
                  <span>{component.isFavorite ? "Favorited" : "124 favorites"}</span>
                </div>
              </div>

              <PanelTabs active={tab} onChange={setTab} />

              <div className="p-5">
                {tab === "Preview" ? (
                  <div className="space-y-4">
                    <PreviewToolbar viewport={viewport} setViewport={setViewport} theme={theme} setTheme={setTheme} />
                    <ComponentPreview component={component} viewport={viewport} theme={theme} tableOptions={tableOptions} pricingOptions={pricingOptions} />
                  </div>
                ) : null}
                {tab === "Code" ? <CodeViewer component={component} /> : null}
                {tab === "Usage" ? (
                  <div className="space-y-4 text-sm text-[#6D7285]">
                    <p>Import the component from your shared library, then pass typed props for state and variants.</p>
                    <pre className="overflow-auto rounded-3xl bg-[#F7F8FC] p-4 text-[#6366F1]"><code>{component.usageCode}</code></pre>
                    <p>Dependencies: React, design tokens, and local accessibility helpers.</p>
                  </div>
                ) : null}
                {tab === "Props" ? (
                  <PropertiesEditor component={component} tableOptions={tableOptions} setTableOptions={setTableOptions} pricingOptions={pricingOptions} setPricingOptions={setPricingOptions} />
                ) : null}
              </div>
            </div>

            <div className="border-t border-[#E4E7EF] p-4">
              <button className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#6366F1] text-sm font-semibold text-white shadow-lg shadow-indigo-200" onClick={copyCode}>
                {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
                {copied ? "Copied" : "Copy code"}
              </button>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function PreviewToolbar({
  viewport,
  setViewport,
  theme,
  setTheme,
}: {
  viewport: "Desktop" | "Tablet" | "Mobile";
  setViewport: (value: "Desktop" | "Tablet" | "Mobile") => void;
  theme: "Light" | "Dark";
  setTheme: (value: "Light" | "Dark") => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex rounded-2xl bg-[#F2F4FA] p-1">
        {([
          ["Desktop", Monitor],
          ["Tablet", Tablet],
          ["Mobile", Smartphone],
        ] as const).map(([label, Icon]) => (
          <button key={label} className={cn("grid min-h-9 min-w-10 place-items-center rounded-xl px-2 text-[#6D7285]", viewport === label && "bg-white text-[#6366F1] shadow-sm")} onClick={() => setViewport(label)} aria-label={`${label} preview`}>
            <Icon size={16} aria-hidden />
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <select className="h-9 rounded-2xl border border-[#E4E7EF] bg-white px-3 text-sm text-[#6D7285]" value={theme} onChange={(event) => setTheme(event.target.value as "Light" | "Dark")} aria-label="Preview theme">
          <option>Light</option>
          <option>Dark</option>
        </select>
        <button className="grid size-9 place-items-center rounded-2xl border border-[#E4E7EF] bg-white text-[#6D7285]" aria-label="Open fullscreen preview" onClick={() => document.documentElement.requestFullscreen?.()}>
          <Maximize2 size={16} aria-hidden />
        </button>
      </div>
    </div>
  );
}
