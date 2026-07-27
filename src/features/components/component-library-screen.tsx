"use client";

import { Plus } from "lucide-react";
import { ProductPageShell } from "@/components/desktop/product-page-shell";
import { ComponentBrowser } from "@/components/vault/component-browser";

export function ComponentLibraryScreen() {
  return (
    <ProductPageShell activeSection="Browser">
      <div className="grid h-[calc(100dvh-112px)] min-h-[640px] grid-rows-[auto_1fr] bg-surface-light">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-dark bg-surface-light px-4 py-3">
          <div>
            <p className="font-tech text-[11px] font-bold uppercase text-text-secondary">VAULT / COMPONENTS</p>
            <h1 className="font-tech text-3xl font-bold uppercase">Component Library</h1>
          </div>
          <button className="pressable inline-flex items-center gap-2 bg-orange px-4 py-2 font-tech text-xs font-bold uppercase text-surface-light">
            <Plus size={16} aria-hidden />
            New Component
          </button>
        </header>
        <ComponentBrowser />
      </div>
    </ProductPageShell>
  );
}
