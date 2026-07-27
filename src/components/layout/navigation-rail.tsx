"use client";

import Link from "next/link";
import { Archive, Box, ChevronLeft, Heart, LayoutGrid, Settings, Sparkles, SwatchBook } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fastMotion, motionEase } from "@/components/motion/site-motion";

const items = [
  { label: "Library", href: "/vault/components", icon: LayoutGrid },
  { label: "Collections", href: "/vault/collections", icon: Archive },
  { label: "Favorites", href: "/vault/favorites", icon: Heart },
  { label: "Tokens", href: "/vault/tokens", icon: SwatchBook },
  { label: "Settings", href: "/vault/settings", icon: Settings },
];

export function NavigationRail({ active = "Library", expanded, onToggle }: { active?: string; expanded: boolean; onToggle: () => void }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.aside
      className="relative hidden min-h-dvh overflow-hidden border-r border-[#E4E7EF]/80 bg-white/92 px-3 py-4 shadow-[8px_0_26px_rgba(23,26,43,0.035)] lg:block"
      animate={{ width: expanded ? 220 : 80 }}
      transition={{ duration: 0.18, ease: motionEase }}
    >
      <div className="pointer-events-none absolute -left-16 top-20 size-32 rounded-full bg-[#6366F1]/[0.055] blur-2xl" />
      <div className="relative flex h-full flex-col">
        <Link href="/vault/components" className={cn("group flex items-center gap-3 rounded-2xl p-2", !expanded && "justify-center")}>
          <motion.span
            className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#9A78FF] text-white shadow-md shadow-indigo-200"
            whileHover={reduceMotion ? undefined : { scale: 1.035 }}
            whileTap={reduceMotion ? undefined : { scale: 0.96 }}
            transition={fastMotion}
          >
            <Box size={20} aria-hidden />
          </motion.span>
          <AnimatePresence initial={false}>
            {expanded ? (
              <motion.span
                className="min-w-0"
                initial={reduceMotion ? false : { opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: -4 }}
                transition={{ duration: 0.1 }}
              >
                <span className="block truncate text-sm font-semibold tracking-[-0.01em] text-[#171A2B]">Component Vault</span>
                <span className="text-xs text-[#9A9FB1]">Playground</span>
              </motion.span>
            ) : null}
          </AnimatePresence>
        </Link>

        <nav className="mt-8 space-y-2" aria-label="Main navigation">
          {items.map((item, index) => {
            const Icon = item.icon;
            const selected = active === item.label;
            return (
              <motion.div
                key={item.label}
                initial={reduceMotion ? false : { opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.16, delay: index * 0.018, ease: motionEase }}
              >
                <Link
                  href={item.href}
                  title={expanded ? undefined : item.label}
                  aria-current={selected ? "page" : undefined}
                  className={cn(
                    "group relative flex min-h-11 items-center gap-3 overflow-hidden rounded-2xl px-3 text-sm font-medium",
                    expanded ? "justify-start" : "justify-center",
                    selected ? "text-[#6366F1]" : "text-[#6D7285] hover:text-[#171A2B]",
                  )}
                >
                  {selected ? (
                    <motion.span
                      layoutId="vault-navigation-active"
                      className="absolute inset-0 rounded-2xl bg-[#EEF0FF] shadow-[inset_0_0_0_1px_rgba(99,102,241,0.08)]"
                      transition={{ type: "spring", stiffness: 520, damping: 42, mass: 0.35 }}
                    />
                  ) : (
                    <span className="absolute inset-0 rounded-2xl bg-[#F2F4FA] opacity-0 transition-opacity duration-100 group-hover:opacity-100" />
                  )}
                  <motion.span
                    className="relative z-10 grid size-5 shrink-0 place-items-center"
                    whileHover={reduceMotion ? undefined : { scale: 1.06 }}
                    transition={fastMotion}
                  >
                    <Icon size={18} aria-hidden />
                  </motion.span>
                  <AnimatePresence initial={false}>
                    {expanded ? (
                      <motion.span
                        className="relative z-10 truncate"
                        initial={reduceMotion ? false : { opacity: 0, x: -3 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={reduceMotion ? undefined : { opacity: 0, x: -3 }}
                        transition={{ duration: 0.09 }}
                      >
                        {item.label}
                      </motion.span>
                    ) : (
                      <span className="sr-only">{item.label}</span>
                    )}
                  </AnimatePresence>
                  {selected && expanded ? <span className="relative z-10 ml-auto size-1.5 rounded-full bg-[#6366F1]" /> : null}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <AnimatePresence initial={false}>
            {expanded ? (
              <motion.div
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6366F1] via-[#9A78FF] to-[#E978D4] p-4 text-white shadow-lg shadow-indigo-100"
                initial={reduceMotion ? false : { opacity: 0, y: 6, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: 4, scale: 0.99 }}
                transition={{ duration: 0.14, ease: motionEase }}
              >
                <div className="absolute -right-8 -top-8 size-20 rounded-full bg-white/15 blur-xl" />
                <Sparkles className="relative" size={18} aria-hidden />
                <p className="relative mt-3 text-sm font-semibold">Build faster with high-quality components.</p>
                <Link href="/vault/components/card-stack-navigator" className="relative mt-3 inline-flex text-xs font-medium text-white/90 transition-transform duration-100 hover:translate-x-0.5">
                  Explore motion
                </Link>
              </motion.div>
            ) : null}
          </AnimatePresence>
          <motion.button
            className="grid size-10 place-items-center rounded-2xl border border-[#E4E7EF] bg-white text-[#6D7285] shadow-sm transition-colors hover:text-[#171A2B]"
            onClick={onToggle}
            aria-label={expanded ? "Collapse navigation" : "Expand navigation"}
            whileTap={reduceMotion ? undefined : { scale: 0.94 }}
            whileHover={reduceMotion ? undefined : { y: -1 }}
            transition={fastMotion}
          >
            <ChevronLeft className={cn("transition-transform duration-150", !expanded && "rotate-180")} size={18} aria-hidden />
          </motion.button>
        </div>
      </div>
    </motion.aside>
  );
}
