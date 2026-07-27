"use client";

import Link from "next/link";
import { Archive, Box, ChevronLeft, Heart, LayoutGrid, Settings, Sparkles, SwatchBook } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { motionEase } from "@/components/motion/site-motion";

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
      className="relative hidden min-h-dvh overflow-hidden border-r border-[#E4E7EF]/80 bg-white/76 px-3 py-4 shadow-[8px_0_38px_rgba(23,26,43,0.045)] backdrop-blur-2xl lg:block"
      animate={{ width: expanded ? 220 : 80 }}
      transition={{ duration: 0.28, ease: motionEase }}
    >
      <div className="pointer-events-none absolute -left-20 top-20 size-44 rounded-full bg-[#6366F1]/10 blur-3xl" />
      <div className="relative flex h-full flex-col">
        <Link href="/vault/components" className={cn("group flex items-center gap-3 rounded-2xl p-2", !expanded && "justify-center")}>
          <motion.span
            className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#9A78FF] text-white shadow-lg shadow-indigo-200"
            whileHover={reduceMotion ? undefined : { rotate: -8, scale: 1.07 }}
            transition={{ type: "spring", stiffness: 320, damping: 18 }}
          >
            <Box size={20} aria-hidden />
          </motion.span>
          <AnimatePresence initial={false}>
            {expanded ? (
              <motion.span
                className="min-w-0"
                initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
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
                initial={reduceMotion ? false : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.32, delay: index * 0.04, ease: motionEase }}
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
                      transition={{ type: "spring", stiffness: 360, damping: 32 }}
                    />
                  ) : (
                    <span className="absolute inset-0 rounded-2xl bg-[#F2F4FA] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  )}
                  <motion.span
                    className="relative z-10 grid size-5 shrink-0 place-items-center"
                    whileHover={reduceMotion ? undefined : { scale: 1.12, rotate: selected ? 0 : -4 }}
                    transition={{ type: "spring", stiffness: 360, damping: 20 }}
                  >
                    <Icon size={18} aria-hidden />
                  </motion.span>
                  <AnimatePresence initial={false}>
                    {expanded ? (
                      <motion.span
                        className="relative z-10 truncate"
                        initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={reduceMotion ? undefined : { opacity: 0, x: -6 }}
                        transition={{ duration: 0.16 }}
                      >
                        {item.label}
                      </motion.span>
                    ) : (
                      <span className="sr-only">{item.label}</span>
                    )}
                  </AnimatePresence>
                  {selected && expanded ? <motion.span className="relative z-10 ml-auto size-1.5 rounded-full bg-[#6366F1]" layoutId="vault-navigation-dot" /> : null}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <AnimatePresence initial={false}>
            {expanded ? (
              <motion.div
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6366F1] via-[#9A78FF] to-[#E978D4] p-4 text-white shadow-xl shadow-indigo-100"
                initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.24, ease: motionEase }}
              >
                <motion.div
                  className="absolute -right-8 -top-8 size-24 rounded-full bg-white/20 blur-2xl"
                  animate={reduceMotion ? undefined : { x: [0, -8, 0], y: [0, 8, 0] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <Sparkles className="relative" size={18} aria-hidden />
                <p className="relative mt-3 text-sm font-semibold">Build faster with high-quality components.</p>
                <Link href="/vault/components/card-stack-navigator" className="relative mt-3 inline-flex text-xs font-medium text-white/90 transition hover:translate-x-0.5">
                  Explore motion
                </Link>
              </motion.div>
            ) : null}
          </AnimatePresence>
          <motion.button
            className="grid size-10 place-items-center rounded-2xl border border-[#E4E7EF] bg-white/88 text-[#6D7285] shadow-sm backdrop-blur transition hover:text-[#171A2B]"
            onClick={onToggle}
            aria-label={expanded ? "Collapse navigation" : "Expand navigation"}
            whileTap={reduceMotion ? undefined : { scale: 0.92 }}
            whileHover={reduceMotion ? undefined : { y: -2 }}
          >
            <ChevronLeft className={cn("transition-transform duration-300", !expanded && "rotate-180")} size={18} aria-hidden />
          </motion.button>
        </div>
      </div>
    </motion.aside>
  );
}
