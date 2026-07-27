"use client";

import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { Bell, Check, Command, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { demoCollections } from "@/services/demo-data";
import { useVaultStore } from "@/stores/vault-store";
import { cn } from "@/lib/utils";
import { motionEase } from "@/components/motion/site-motion";

export function Topbar({ onCreate }: { onCreate?: () => void }) {
  const router = useRouter();
  const components = useVaultStore((state) => state.components);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 18);
  });

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
      <motion.header
        className="sticky top-0 z-30 flex items-center gap-3 border-b border-[#E4E7EF]/75 px-4 backdrop-blur-2xl md:px-6"
        initial={reduceMotion ? false : { opacity: 0, y: -14 }}
        animate={{
          opacity: 1,
          y: 0,
          height: scrolled ? 56 : 64,
          backgroundColor: scrolled ? "rgba(247,248,252,0.92)" : "rgba(247,248,252,0.76)",
          boxShadow: scrolled ? "0 12px 34px rgba(23,26,43,0.055)" : "0 0 0 rgba(23,26,43,0)",
        }}
        transition={{ duration: 0.28, ease: motionEase }}
      >
        <motion.button
          className="group flex h-10 min-w-0 flex-1 items-center gap-3 rounded-2xl border border-[#E4E7EF] bg-white/92 px-4 text-left text-sm text-[#9A9FB1] shadow-sm backdrop-blur transition hover:border-[#C9CDDA] md:max-w-xl"
          onClick={() => setPaletteOpen(true)}
          whileHover={reduceMotion ? undefined : { y: -1, scale: 1.003 }}
          whileTap={reduceMotion ? undefined : { scale: 0.995 }}
        >
          <motion.span whileHover={reduceMotion ? undefined : { rotate: -8, scale: 1.08 }}>
            <Search size={17} aria-hidden />
          </motion.span>
          <span className="truncate transition-colors group-hover:text-[#6D7285]">Search components, categories, or tags...</span>
          <span className="ml-auto hidden rounded-md border border-[#E4E7EF] bg-[#F7F8FC] px-1.5 py-0.5 text-[11px] font-medium text-[#6D7285] sm:inline">⌘ K</span>
        </motion.button>
        <motion.button
          className="grid size-10 place-items-center rounded-2xl border border-[#E4E7EF] bg-white/92 text-[#6D7285] shadow-sm backdrop-blur"
          aria-label="Filters"
          whileHover={reduceMotion ? undefined : { y: -2, rotate: -3 }}
          whileTap={reduceMotion ? undefined : { scale: 0.92 }}
        >
          <SlidersHorizontal size={17} aria-hidden />
        </motion.button>
        <motion.button
          className="group inline-flex min-h-10 items-center gap-2 rounded-2xl bg-[#6366F1] px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-[#5558e8]"
          onClick={() => onCreate?.() ?? router.push("/vault/components/pricing-card")}
          whileHover={reduceMotion ? undefined : { y: -2, scale: 1.015 }}
          whileTap={reduceMotion ? undefined : { scale: 0.97 }}
        >
          <motion.span className="grid place-items-center" whileHover={reduceMotion ? undefined : { rotate: 90 }}>
            <Plus size={17} aria-hidden />
          </motion.span>
          <span className="hidden sm:inline">New Component</span>
        </motion.button>
        <motion.button
          className="relative grid size-10 place-items-center rounded-2xl border border-[#E4E7EF] bg-white/92 text-[#6D7285] shadow-sm backdrop-blur"
          aria-label="Open updates"
          onClick={() => router.push("/vault/settings")}
          whileHover={reduceMotion ? undefined : { y: -2, rotate: 3 }}
          whileTap={reduceMotion ? undefined : { scale: 0.92 }}
        >
          <Bell size={17} aria-hidden />
          <motion.span
            className="absolute right-2 top-2 size-2 rounded-full bg-[#FF7664]"
            initial={reduceMotion ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 18, delay: 0.45 }}
          />
        </motion.button>
        <motion.button
          className="flex min-h-10 items-center gap-2 rounded-2xl border border-[#E4E7EF] bg-white/92 px-2 shadow-sm backdrop-blur"
          aria-label="Account menu"
          whileHover={reduceMotion ? undefined : { y: -2 }}
          whileTap={reduceMotion ? undefined : { scale: 0.94 }}
        >
          <span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-[#F1BE48] to-[#FF7664] text-xs font-semibold text-white">W</span>
        </motion.button>
      </motion.header>

      <AnimatePresence>
        {paletteOpen ? (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-start bg-[#171A2B]/30 px-4 py-24 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={() => setPaletteOpen(false)}
          >
            <motion.div
              className="mx-auto w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/70 bg-white/96 shadow-[0_32px_100px_rgba(23,26,43,0.22)] backdrop-blur-2xl"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 18, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98, y: 8, filter: "blur(5px)" }}
              transition={{ duration: 0.24, ease: motionEase }}
              onMouseDown={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
            >
              <div className="flex items-center gap-3 border-b border-[#E4E7EF] px-4 py-3">
                <motion.span initial={reduceMotion ? false : { rotate: -18, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", stiffness: 320, damping: 18 }}>
                  <Command size={18} className="text-[#6366F1]" aria-hidden />
                </motion.span>
                <input
                  ref={inputRef}
                  className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none"
                  placeholder="Jump to a component, collection or command..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <button className="grid size-8 place-items-center rounded-xl text-[#9A9FB1] transition hover:bg-[#F2F4FA] hover:text-[#171A2B]" onClick={() => setPaletteOpen(false)} aria-label="Close command palette">
                  <X size={17} aria-hidden />
                </button>
              </div>
              <motion.div className="max-h-[420px] overflow-auto p-2" layout>
                <AnimatePresence mode="popLayout" initial={false}>
                  {results.map((result, index) => (
                    <motion.div
                      key={`${result.href}-${result.label}`}
                      layout
                      initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, x: 8 }}
                      transition={{ duration: 0.18, delay: index * 0.025 }}
                    >
                      <Link
                        href={result.href}
                        className={cn("group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition hover:bg-[#F2F4FA]")}
                        onClick={() => setPaletteOpen(false)}
                      >
                        <span className="grid size-9 place-items-center rounded-2xl bg-[#EEF0FF] text-[#6366F1] transition group-hover:scale-105">
                          <Check size={16} aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-[#171A2B]">{result.label}</span>
                          <span className="text-xs text-[#9A9FB1]">{result.meta}</span>
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                  {results.length === 0 ? (
                    <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 py-8 text-center text-sm text-[#9A9FB1]">
                      No matching commands.
                    </motion.p>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
