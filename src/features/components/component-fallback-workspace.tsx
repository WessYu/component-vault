"use client";

import Link from "next/link";
import { ArrowLeft, Copy, Heart } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ComponentPreview } from "@/components/detail/component-preview";
import { PreviewToolbar } from "@/components/detail/component-detail-panel";
import { ComponentDetailTabs, type DetailTab } from "@/components/detail/component-tabs";
import { categoryStyle, visualCategory } from "@/components/library/category-style";
import { useVaultStore } from "@/stores/vault-store";
import type { VaultComponent } from "@/types/vault";

export function ComponentFallbackWorkspace({ component }: { component: VaultComponent }) {
  const toggleFavorite = useVaultStore((state) => state.toggleFavorite);
  const [viewport, setViewport] = useState<"Desktop" | "Tablet" | "Mobile">("Desktop");
  const [theme, setTheme] = useState<"Light" | "Dark">("Light");
  const [activeTab, setActiveTab] = useState<DetailTab>("Code");
  const [copied, setCopied] = useState(false);
  const style = categoryStyle(component);

  async function copyCode() {
    await navigator.clipboard.writeText(component.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1300);
  }

  return (
    <AppShell active="Library">
      <section className="px-4 py-6 md:px-7 md:py-8">
        <div className="mx-auto max-w-[1460px]">
          <Link href="/vault/components" className="inline-flex items-center gap-2 text-sm font-semibold text-[#6366F1] hover:underline"><ArrowLeft size={16} aria-hidden /> Back to components</Link>
          <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold" style={{ background: style.soft, color: style.text }}>{visualCategory(component)}</span>
              <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-text-primary md:text-6xl">{component.name}</h1>
              <p className="mt-4 text-base leading-7 text-[#6D7285]">{component.description}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-sm text-[#6D7285]">
                <span className="rounded-full border border-[#E4E7EF] bg-white px-3 py-1">{component.version}</span>
                {component.tags.map((tag) => <span key={tag} className="rounded-full bg-[#F2F4FA] px-3 py-1">{tag}</span>)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="grid size-11 place-items-center rounded-2xl border border-[#E4E7EF] bg-white shadow-sm" onClick={() => void toggleFavorite(component.id)} aria-label="Favorite component"><Heart size={18} fill={component.isFavorite ? style.accent : "none"} color={component.isFavorite ? style.accent : "currentColor"} aria-hidden /></button>
              <button type="button" onClick={copyCode} className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[#171A2B] px-4 text-sm font-semibold text-white shadow-lg"><Copy size={16} aria-hidden /> {copied ? "Copied" : "Copy code"}</button>
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 space-y-6">
              <section className="rounded-[32px] border border-[#E4E7EF] bg-white p-4 shadow-[0_18px_70px_rgba(23,26,43,0.05)]">
                <div className="mb-4"><PreviewToolbar viewport={viewport} setViewport={setViewport} theme={theme} setTheme={setTheme} /></div>
                <ComponentPreview component={component} viewport={viewport} theme={theme} />
              </section>
              <ComponentDetailTabs component={component} active={activeTab} onChange={setActiveTab} />
            </div>
            <aside className="rounded-[32px] border border-[#E4E7EF] bg-white p-6 shadow-[0_18px_70px_rgba(23,26,43,0.05)]">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6366F1]">Standalone motion component</p>
              <h2 className="mt-2 text-xl font-bold">Preview-first workspace</h2>
              <p className="mt-3 text-sm leading-6 text-[#6D7285]">This component is a library component with its own preview. It is not one of the long-form interactive experiences, so the detail page uses the standard component workspace.</p>
              <div className="mt-5 rounded-2xl bg-[#F7F8FC] p-4 font-mono text-xs leading-6 text-[#4B5563]">{component.slug}</div>
            </aside>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
