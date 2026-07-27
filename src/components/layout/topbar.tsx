"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bell, Check, Command, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { demoCollections } from "@/services/demo-data";
import { useVaultStore } from "@/stores/vault-store";
import { cn } from "@/lib/utils";

export function Topbar({ onCreate }: { onCreate?: () => void }) {
  const router = useRouter();
  const components = useVaultStore((state) => state.components);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isCommand = event.ctrlKey || event.metaKey;
      if (isCommand && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(true);
      }
      if (event.key === "Escape") {
        setPaletteOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (paletteOpen) {
      window.setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [paletteOpen]);

  const results = useMemo(() => {
    const term = query.toLowerCase();
    const componentResults = components
      .filter((component) => [component.name, component.category, ...component.tags].join(" ").toLowerCase().includes(term))
      .slice(0, 6)
      .map((component) => ({ label: component.name, meta: component.category, href: `/vault/components/${component.slug}` }));
    const collectionResults = demoCollections
      .filter((collection) => collection.name.toLowerCase().includes(term))
      .slice(0, 3)
      .map((collection) => ({ label: collection.name, meta: "Collection", href: `/vault/collections/${collection.id}` }));
    return [...componentResults, ...collectionResults];
  }, [components, query]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#E4E7EF]/80 bg-[#F7F8FC]/82 px-4 backdrop-blur-xl md:px-6">
        <button
          className="flex h-10 min-w-0 flex-1 items-center gap-3 rounded-2xl border border-[#E4E7EF] bg-white px-4 text-left text-sm text-[#9A9FB1] shadow-sm transition hover:border-[#D4D8E3] md:max-w-xl"
          onClick={() => setPaletteOpen(true)}
        >
          <Search size={17} aria-hidden />
          <span className="truncate">Search components, categories, or tags...</span>
          <span className="ml-auto hidden rounded-md border border-[#E4E7EF] px-1.5 py-0.5 text-[11px] font-medium text-[#6D7285] sm:inline">⌘ K</span>
        </button>
        <button className="grid size-10 place-items-center rounded-2xl border border-[#E4E7EF] bg-white text-[#6D7285] shadow-sm" aria-label="Filters">
          <SlidersHorizontal size={17} aria-hidden />
        </button>
        <button
          className="inline-flex min-h-10 items-center gap-2 rounded-2xl bg-[#6366F1] px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-[#5558e8]"
          onClick={() => onCreate?.() ?? router.push("/vault/components/pricing-card")}
        >
          <Plus size={17} aria-hidden />
          <span className="hidden sm:inline">New Component</span>
        </button>
        <button className="relative grid size-10 place-items-center rounded-2xl border border-[#E4E7EF] bg-white text-[#6D7285] shadow-sm" aria-label="Open updates" onClick={() => router.push("/vault/settings")}>
          <Bell size={17} aria-hidden />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-[#FF7664]" />
        </button>
        <button className="flex min-h-10 items-center gap-2 rounded-2xl border border-[#E4E7EF] bg-white px-2 shadow-sm" aria-label="Account menu">
          <span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-[#F1BE48] to-[#FF7664] text-xs font-semibold text-white">W</span>
        </button>
      </header>

      <AnimatePresence>
        {paletteOpen ? (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-start bg-[#171A2B]/28 px-4 py-24 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={() => setPaletteOpen(false)}
          >
            <motion.div
              className="mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-[#E4E7EF] bg-white shadow-2xl shadow-[#171A2B]/18"
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              transition={{ duration: 0.18 }}
              onMouseDown={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
            >
              <div className="flex items-center gap-3 border-b border-[#E4E7EF] px-4 py-3">
                <Command size={18} className="text-[#6366F1]" aria-hidden />
                <input
                  ref={inputRef}
                  className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none"
                  placeholder="Jump to a component, collection or command..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <button className="grid size-8 place-items-center rounded-xl text-[#9A9FB1] hover:bg-[#F2F4FA]" onClick={() => setPaletteOpen(false)} aria-label="Close command palette">
                  <X size={17} aria-hidden />
                </button>
              </div>
              <div className="max-h-[420px] overflow-auto p-2">
                {results.map((result) => (
                  <Link
                    key={`${result.href}-${result.label}`}
                    href={result.href}
                    className={cn("flex items-center gap-3 rounded-2xl px-3 py-3 text-sm hover:bg-[#F2F4FA]")}
                    onClick={() => setPaletteOpen(false)}
                  >
                    <span className="grid size-9 place-items-center rounded-2xl bg-[#EEF0FF] text-[#6366F1]">
                      <Check size={16} aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-[#171A2B]">{result.label}</span>
                      <span className="text-xs text-[#9A9FB1]">{result.meta}</span>
                    </span>
                  </Link>
                ))}
                {results.length === 0 ? <p className="px-4 py-8 text-center text-sm text-[#9A9FB1]">No matching commands.</p> : null}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
