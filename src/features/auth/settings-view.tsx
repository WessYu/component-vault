"use client";

import { ShieldCheck, SlidersHorizontal } from "lucide-react";
import { ProductPageShell } from "@/components/desktop/product-page-shell";
import { isSupabaseConfigured } from "@/lib/supabase";

export function SettingsView() {
  return (
    <ProductPageShell activeSection="Settings">
      <header className="window-titlebar flex h-8 items-center px-3 font-tech text-xs font-bold uppercase">SETTINGS.SYS</header>
      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_360px]">
        <section className="retro-panel bg-surface p-4">
          <h1 className="flex items-center gap-2 font-tech text-2xl font-bold uppercase">
            <SlidersHorizontal size={24} aria-hidden /> Workspace Settings
          </h1>
          <div className="mt-5 grid gap-3">
            {[
              ["Grid size", "8px"],
              ["Guides", "Enabled"],
              ["Autosave", "900ms debounce"],
              ["Preview isolation", "iframe sandbox"],
              ["Editor", "Monaco"],
            ].map(([label, value]) => (
              <label key={label} className="grid gap-2 border-b border-surface-dark pb-3 sm:grid-cols-[180px_1fr]">
                <span className="font-semibold">{label}</span>
                <input className="retro-panel-inset bg-surface-light px-3 py-2" defaultValue={value} />
              </label>
            ))}
          </div>
        </section>
        <aside className="retro-panel-inset bg-terminal p-4 text-green">
          <ShieldCheck size={28} aria-hidden />
          <h2 className="mt-4 font-tech text-lg font-bold uppercase text-surface-light">Security</h2>
          <p className="mt-2 text-sm leading-6">Supabase Auth is {isSupabaseConfigured ? "configured for this environment." : "waiting for environment variables. Demo session fallback is active locally."}</p>
          <div className="mt-4 border border-green/40 p-3 font-tech text-xs">
            <p>NEXT_PUBLIC_SUPABASE_URL</p>
            <p>NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
          </div>
        </aside>
      </div>
    </ProductPageShell>
  );
}
