"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Heart, Link2, Maximize2, Monitor, Share2, Smartphone, Tablet, X, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ComponentPreview } from "@/components/detail/component-preview";
import { CodeViewer } from "@/components/detail/code-viewer";
import { PanelTabs } from "@/components/detail/component-tabs";
import { PropertiesEditor, defaultPricingOptions, defaultTableOptions, type PricingOptions, type TableOptions } from "@/components/detail/properties-editor";
import { categoryStyle, visualCategory } from "@/components/library/category-style";
import { cn } from "@/lib/utils";
import { useVaultStore } from "@/stores/vault-store";
import type { VaultComponent } from "@/types/vault";

export function ComponentDetailPanel({ component, open, onClose }: { component: VaultComponent | null; open: boolean; onClose: () => void }) {
  const router = useRouter();
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

  useEffect(() => {
    if (!open) return;
    setTab("Preview");
    setViewport("Desktop");
    setTheme("Light");
    setCopied(false);
  }, [component?.id, open]);

  if (!component) return null;
  const selectedComponent = component;
  const style = categoryStyle(selectedComponent);

  async function copyCode() {
    await navigator.clipboard.writeText(selectedComponent.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1300);
  }

  function openFullDetail() {
    onClose();
    router.push(`/vault/components/${selectedComponent.slug}`);
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-50 bg-[#171A2B]/24 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.aside
            className="ml-auto flex h-full w-full max-w-[520px] flex-col overflow-hidden border-l border-[#E4E7EF] bg-white shadow-2xl shadow-[#171A2B]/18 sm:rounded-l-[32px]"
            initial={{ x: 520 }} animate={{ x: 0 }} exit={{ x: 520 }} transition={{ type: "spring", stiffness: 280, damping: 30 }}
            onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={`${selectedComponent.name} details`}
          >
            <div className="flex items-center justify-between gap-3 border-b border-[#E4E7EF] px-5 py-3.5">
              <button className="inline-flex min-h-10 items-center gap-2 rounded-2xl bg-[#F2F4FA] px-3 text-sm font-medium text-[#6D7285] hover:bg-[#ECEFF7]" onClick={onClose}>← Back</button>
              <div className="flex items-center gap-1">
                <button className="grid size-10 place-items-center rounded-2xl text-[#6D7285] hover:bg-[#F2F4FA]" onClick={() => toggleFavorite(selectedComponent.id)} aria-label="Favorite">
                  <Heart size={17} fill={selectedComponent.isFavorite ? style.accent : "none"} color={selectedComponent.isFavorite ? style.accent : "currentColor"} aria-hidden />
                </button>
                <button className="grid size-10 place-items-center rounded-2xl text-[#6D7285] hover:bg-[#F2F4FA]" aria-label="Share" onClick={() => navigator.clipboard.writeText(window.location.href)}><Share2 size={17} aria-hidden /></button>
                <button className="grid size-10 place-items-center rounded-2xl text-[#6D7285] hover:bg-[#F2F4FA]" aria-label="Copy link" onClick={() => navigator.clipboard.writeText(window.location.href)}><Link2 size={17} aria-hidden /></button>
                <button className="grid size-10 place-items-center rounded-2xl text-[#6D7285] hover:bg-[#F2F4FA]" onClick={onClose} aria-label="Close panel"><X size={18} aria-hidden /></button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto">
              <div className="px-5 pb-4 pt-5">
                <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: style.soft, color: style.text }}>{visualCategory(selectedComponent)}</span>
                <h2 className="mt-3 text-[28px] font-bold tracking-[-0.03em] text-text-primary">{selectedComponent.name}</h2>
                <p className="mt-2 text-sm leading-6 text-[#6D7285]">{selectedComponent.description}</p>
                <div className="mt-3.5 flex flex-wrap items-center gap-2 text-[11px] text-[#9A9FB1]">
                  <span>{selectedComponent.version}</span><span>•</span><span>{selectedComponent.usage.reduce((sum, item) => sum + item.count, 0)} uses</span><span>•</span><span>{selectedComponent.tags.length} tags</span>
                </div>
              </div>

              <PanelTabs active={tab} onChange={setTab} />

              <div className="px-4 pb-6 pt-4 sm:px-5">
                {tab === "Preview" ? (
                  <div className="space-y-3.5">
                    <PreviewToolbar viewport={viewport} setViewport={setViewport} theme={theme} setTheme={setTheme} />
                    <div className="overflow-hidden rounded-[28px] border border-[#E4E7EF] bg-[#F7F8FC] p-2 shadow-[0_18px_70px_rgba(23,26,43,0.05)]">
                      <div className="overflow-hidden rounded-[24px] border border-white/80 bg-white shadow-[0_14px_48px_rgba(23,26,43,0.06)]">
                        <ComponentPreview component={selectedComponent} viewport={viewport} theme={theme} tableOptions={tableOptions} pricingOptions={pricingOptions} />
                      </div>
                    </div>
                  </div>
                ) : null}
                {tab === "Code" ? <CodeViewer component={selectedComponent} /> : null}
                {tab === "Usage" ? <UsagePanel component={selectedComponent} /> : null}
                {tab === "Props" ? (
                  <PropertiesEditor
                    component={selectedComponent}
                    tableOptions={tableOptions}
                    pricingOptions={pricingOptions}
                    onTableOptionsChange={setTableOptions}
                    onPricingOptionsChange={setPricingOptions}
                  />
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-[#E4E7EF] bg-white/95 px-4 py-3.5 backdrop-blur sm:px-5">
              <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[#E4E7EF] bg-white px-4 py-3 text-sm font-semibold text-[#4B5165] hover:bg-[#F7F8FC]" onClick={copyCode}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy code"}
              </button>
              <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#171A2B] px-4 py-3 text-sm font-semibold text-white hover:bg-[#242941]" onClick={openFullDetail}>
                <ExternalLink size={16} />
                Full detail
              </button>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function PreviewToolbar({ viewport, setViewport, theme, setTheme }: { viewport: "Desktop" | "Tablet" | "Mobile"; setViewport: (value: "Desktop" | "Tablet" | "Mobile") => void; theme: "Light" | "Dark"; setTheme: (value: "Light" | "Dark") => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#E4E7EF] bg-white px-2.5 py-2 shadow-sm">
      <div className="flex items-center gap-1">
        {([
          ["Desktop", Monitor],
          ["Tablet", Tablet],
          ["Mobile", Smartphone],
        ] as const).map(([value, Icon]) => (
          <button key={value} className={cn("inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold", viewport === value ? "bg-[#171A2B] text-white" : "text-[#6D7285] hover:bg-[#F2F4FA]")} onClick={() => setViewport(value)} aria-label={value}>
            <Icon size={14} />
            <span className="hidden sm:inline">{value}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1 rounded-xl bg-[#F2F4FA] p-1">
        {(["Light", "Dark"] as const).map((value) => (
          <button key={value} className={cn("rounded-lg px-2.5 py-1 text-xs font-semibold", theme === value ? "bg-white text-[#171A2B] shadow-sm" : "text-[#8A90A2]")} onClick={() => setTheme(value)}>{value}</button>
        ))}
      </div>
    </div>
  );
}

function UsagePanel({ component }: { component: VaultComponent }) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-[#E4E7EF] bg-white p-4">
        <h3 className="text-sm font-semibold text-[#171A2B]">Usage</h3>
        <div className="mt-3 space-y-2">
          {component.usage.map((item) => (
            <div key={item.file} className="flex items-center justify-between gap-3 rounded-xl bg-[#F7F8FC] px-3 py-2.5">
              <span className="min-w-0 truncate text-xs text-[#6D7285]">{item.file}</span>
              <span className="shrink-0 text-xs font-semibold text-[#171A2B]">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
