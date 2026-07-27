"use client";

import Link from "next/link";
import { Search, Square } from "lucide-react";
import { useMemo, useState } from "react";
import { useSelectedComponent, useVaultStore } from "@/stores/vault-store";
import { cn } from "@/lib/utils";

export function ComponentExplorer({ activeSlug }: { activeSlug?: string }) {
  const [query, setQuery] = useState("");
  const selected = useSelectedComponent();
  const components = useVaultStore((state) => state.components);
  const setActiveComponentSlug = useVaultStore((state) => state.setActiveComponentSlug);
  const active = components.find((component) => component.slug === activeSlug) ?? selected;

  const siblings = useMemo(() => {
    return components.filter((component) => component.category === active.category && component.name.toLowerCase().includes(query.toLowerCase()));
  }, [active.category, components, query]);

  return (
    <aside className="retro-panel min-h-0 overflow-hidden bg-surface-light">
      <div className="border-b border-surface-dark p-2">
        <label className="retro-panel-inset flex items-center gap-2 bg-surface-light px-2 py-1">
          <Search size={13} aria-hidden />
          <span className="sr-only">Search current category</span>
          <input className="min-w-0 flex-1 bg-transparent text-xs outline-none" value={query} placeholder="Find in category..." onChange={(event) => setQuery(event.target.value)} />
        </label>
      </div>
      <div className="p-2">
        <h2 className="mb-2 font-tech text-[11px] font-bold uppercase text-text-secondary">{active.category}</h2>
        <div className="space-y-1">
          {siblings.map((component) => (
            <Link
              key={component.slug}
              href={`/vault/components/${component.slug}`}
              onClick={() => setActiveComponentSlug(component.slug)}
              className={cn(
                "grid grid-cols-[18px_1fr_auto] items-center gap-2 px-2 py-2 text-xs hover:bg-surface",
                component.slug === active.slug && "bg-navy text-surface-light",
              )}
            >
              <Square size={11} fill={component.slug === active.slug ? "currentColor" : "none"} aria-hidden />
              <span className="truncate font-semibold">{component.name}</span>
              <span className="font-tech text-[10px] opacity-80">{component.version}</span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
