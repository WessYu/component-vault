"use client";

import Link from "next/link";
import { Archive, Box, ChevronLeft, Heart, LayoutGrid, Settings, Sparkles, SwatchBook } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const items = [
  { label: "Library", href: "/vault/components", icon: LayoutGrid },
  { label: "Collections", href: "/vault/collections", icon: Archive },
  { label: "Favorites", href: "/vault/favorites", icon: Heart },
  { label: "Tokens", href: "/vault/tokens", icon: SwatchBook },
  { label: "Settings", href: "/vault/settings", icon: Settings },
];

export function NavigationRail({ active = "Library", expanded, onToggle }: { active?: string; expanded: boolean; onToggle: () => void }) {
  return (
    <motion.aside
      className="hidden min-h-dvh border-r border-[#E4E7EF] bg-white/88 px-3 py-4 shadow-[8px_0_30px_rgba(23,26,43,0.03)] backdrop-blur-xl lg:block"
      animate={{ width: expanded ? 220 : 80 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="flex h-full flex-col">
        <Link href="/vault/components" className={cn("flex items-center gap-3 rounded-2xl p-2", !expanded && "justify-center")}>
          <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#9A78FF] text-white shadow-lg shadow-indigo-200">
            <Box size={20} aria-hidden />
          </span>
          {expanded ? (
            <span>
              <span className="block text-sm font-semibold tracking-[-0.01em] text-[#171A2B]">Component Vault</span>
              <span className="text-xs text-[#9A9FB1]">Playground</span>
            </span>
          ) : null}
        </Link>

        <nav className="mt-8 space-y-2" aria-label="Main navigation">
          {items.map((item) => {
            const Icon = item.icon;
            const selected = active === item.label;
            return (
              <Link
                key={item.label}
                href={item.href}
                title={expanded ? undefined : item.label}
                className={cn(
                  "group flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm font-medium transition-colors",
                  expanded ? "justify-start" : "justify-center",
                  selected ? "bg-[#EEF0FF] text-[#6366F1]" : "text-[#6D7285] hover:bg-[#F2F4FA] hover:text-[#171A2B]",
                )}
              >
                <Icon size={18} aria-hidden />
                {expanded ? <span>{item.label}</span> : <span className="sr-only">{item.label}</span>}
                {selected && expanded ? <span className="ml-auto size-1.5 rounded-full bg-[#6366F1]" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          {expanded ? (
            <div className="rounded-3xl bg-gradient-to-br from-[#6366F1] via-[#9A78FF] to-[#E978D4] p-4 text-white shadow-xl shadow-indigo-100">
              <Sparkles size={18} aria-hidden />
              <p className="mt-3 text-sm font-semibold">Build faster with high-quality components.</p>
              <Link href="/vault/components/pricing-card" className="mt-3 inline-flex text-xs font-medium text-white/90">
                Learn more
              </Link>
            </div>
          ) : null}
          <button
            className="grid size-10 place-items-center rounded-2xl border border-[#E4E7EF] bg-white text-[#6D7285] shadow-sm transition hover:text-[#171A2B]"
            onClick={onToggle}
            aria-label={expanded ? "Collapse navigation" : "Expand navigation"}
          >
            <ChevronLeft className={cn("transition-transform", !expanded && "rotate-180")} size={18} aria-hidden />
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
