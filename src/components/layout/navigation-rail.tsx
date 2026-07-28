"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, ChevronLeft, Heart, LayoutGrid, Settings, ShieldCheck, Sparkles, SwatchBook } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { BrandMark } from "@/components/brand/brand-mark";
import { cn } from "@/lib/utils";
import { fastMotion, motionEase } from "@/components/motion/site-motion";

const items = [
  { label: "Library", href: "/vault/components", icon: LayoutGrid },
  { label: "Collections", href: "/vault/collections", icon: Archive },
  { label: "Favorites", href: "/vault/favorites", icon: Heart },
  { label: "Tokens", href: "/vault/tokens", icon: SwatchBook },
  { label: "Admin", href: "/vault/admin", icon: ShieldCheck },
  { label: "Settings", href: "/vault/settings", icon: Settings },
];

export function NavigationRail({ active = "Library", expanded, onToggle }: { active?: string; expanded: boolean; onToggle: () => void }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [rippleId, setRippleId] = useState(0);
  const cleanupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (cleanupTimer.current) clearTimeout(cleanupTimer.current);
      if (navigationTimer.current) clearTimeout(navigationTimer.current);
    };
  }, []);

  function handleBrandClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (reduceMotion) return;

    event.preventDefault();
    if (cleanupTimer.current) clearTimeout(cleanupTimer.current);
    if (navigationTimer.current) clearTimeout(navigationTimer.current);

    setRippleId((value) => value + 1 || 1);
    cleanupTimer.current = setTimeout(() => setRippleId(0), 820);
    navigationTimer.current = setTimeout(() => router.push("/vault/components"), 420);
  }

  return (
    <motion.aside
      className="relative isolate hidden min-h-dvh overflow-visible border-r border-[#E4E7EF]/80 bg-white/92 px-3 py-4 shadow-[8px_0_26px_rgba(23,26,43,0.035)] lg:block"
      animate={{ width: expanded ? 220 : 80 }}
      transition={{ duration: 0.18, ease: motionEase }}
    >
      <div className="pointer-events-none absolute -left-16 top-20 size-32 rounded-full bg-[#6366F1]/[0.055] blur-2xl" />

      <AnimatePresence>
        {rippleId ? (
          <motion.div key={rippleId} className="pointer-events-none absolute inset-0 z-20 overflow-visible" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.span
              className="absolute left-10 top-10 size-14 rounded-full bg-[radial-gradient(circle,rgba(54,201,255,0.18)_0%,rgba(54,201,255,0.08)_42%,transparent_72%)]"
              style={{ x: "-50%", y: "-50%" }}
              initial={{ scale: 0.35, opacity: 0.9 }}
              animate={{ scale: 5.4, opacity: 0 }}
              transition={{ duration: 0.72, ease: [0.2, 0.7, 0.2, 1] }}
            />
            {[0, 0.075, 0.15].map((delay, index) => (
              <motion.span
                key={delay}
                className="absolute left-10 top-10 rounded-full border-2 border-[#36C9FF]/80 shadow-[0_0_18px_rgba(54,201,255,0.18)]"
                style={{ width: 50 + index * 14, height: 50 + index * 14, x: "-50%", y: "-50%" }}
                initial={{ scale: 0.3, opacity: 0.72 }}
                animate={{ scale: 4.7 + index * 0.22, opacity: [0.72, 0.52, 0] }}
                transition={{ duration: 0.68 + index * 0.06, delay, ease: [0.18, 0.72, 0.22, 1] }}
              />
            ))}
            {[
              { x: 38, y: 36, dx: 68, dy: 94, size: 7, delay: 0.02 },
              { x: 45, y: 42, dx: 98, dy: 58, size: 5, delay: 0.09 },
              { x: 34, y: 44, dx: 42, dy: 130, size: 6, delay: 0.13 },
              { x: 42, y: 39, dx: 124, dy: 118, size: 4, delay: 0.18 },
            ].map((drop, index) => (
              <motion.span
                key={index}
                className="absolute rounded-full bg-[#43D2FF] shadow-[0_0_12px_rgba(67,210,255,0.45)]"
                style={{ left: drop.x, top: drop.y, width: drop.size, height: drop.size }}
                initial={{ x: 0, y: 0, scale: 0.7, opacity: 0.85 }}
                animate={{ x: drop.dx, y: drop.dy, scale: [0.7, 1.05, 0.5], opacity: [0.85, 0.7, 0] }}
                transition={{ duration: 0.62, delay: drop.delay, ease: "easeOut" }}
              />
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="relative z-30 flex h-full flex-col">
        <Link href="/vault/components" onClick={handleBrandClick} className={cn("group flex items-center gap-3 rounded-2xl p-2", !expanded && "justify-center")} aria-label="Component Vault home">
          <motion.span
            className="relative"
            whileHover={reduceMotion ? undefined : { scale: 1.035 }}
            whileTap={reduceMotion ? undefined : { scale: 0.94 }}
            transition={fastMotion}
          >
            <BrandMark />
            <motion.span
              className="pointer-events-none absolute -inset-1 rounded-[20px] border border-[#43D2FF]/0"
              animate={rippleId ? { borderColor: ["rgba(67,210,255,0)", "rgba(67,210,255,0.7)", "rgba(67,210,255,0)"], scale: [0.9, 1.18, 1.28] } : undefined}
              transition={{ duration: 0.46 }}
            />
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
