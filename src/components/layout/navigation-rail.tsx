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
  { label: "Guard", href: "/vault/guard", icon: ShieldCheck },
  { label: "Admin", href: "/vault/admin", icon: ShieldCheck },
  { label: "Settings", href: "/vault/settings", icon: Settings },
];

const waterPaths = [
  "M39 39 C73 43 100 55 101 86 C103 122 82 148 37 164",
  "M39 39 C86 44 127 60 128 99 C130 146 97 181 31 199",
  "M39 39 C102 45 153 65 154 113 C156 170 113 214 26 238",
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
    cleanupTimer.current = setTimeout(() => setRippleId(0), 1250);
    navigationTimer.current = setTimeout(() => router.push("/vault/components"), 1080);
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
          <motion.div key={rippleId} className="pointer-events-none fixed inset-0 z-[100]" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="fixed left-10 top-10 size-20 rounded-full bg-[radial-gradient(circle,rgba(65,211,255,0.34)_0%,rgba(65,211,255,0.14)_38%,transparent_72%)] blur-[1px]"
              style={{ x: "-50%", y: "-50%" }}
              initial={{ scale: 0.35, opacity: 0.95 }}
              animate={{ scale: 4.8, opacity: 0 }}
              transition={{ duration: 0.92, ease: [0.16, 0.78, 0.2, 1] }}
            />

            <svg className="fixed left-0 top-0 h-[270px] w-[360px] overflow-visible" viewBox="0 0 360 270" fill="none" aria-hidden>
              <defs>
                <linearGradient id={`water-stroke-${rippleId}`} x1="38" y1="38" x2="170" y2="238" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#39D7FF" />
                  <stop offset="0.55" stopColor="#30C4FF" />
                  <stop offset="1" stopColor="#46AFFF" stopOpacity="0.25" />
                </linearGradient>
                <filter id={`water-glow-${rippleId}`} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2.6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {waterPaths.map((path, index) => (
                <motion.path
                  key={path}
                  d={path}
                  stroke={`url(#water-stroke-${rippleId})`}
                  strokeWidth={index === 0 ? 5.5 : 5}
                  strokeLinecap="round"
                  filter={`url(#water-glow-${rippleId})`}
                  initial={{ pathLength: 0, opacity: 0, pathOffset: 0 }}
                  animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 0], pathOffset: [0, 0, 0.12] }}
                  transition={{ duration: 1.02, delay: index * 0.07, times: [0, 0.62, 1], ease: [0.2, 0.72, 0.2, 1] }}
                />
              ))}

              {[0, 1, 2].map((index) => (
                <motion.circle
                  key={index}
                  cx={42 + index * 5}
                  cy={42 + index * 2}
                  r={5 - index}
                  fill="#48D8FF"
                  initial={{ opacity: 0.9, scale: 0.4, x: 0, y: 0 }}
                  animate={{ opacity: [0.9, 0.85, 0], scale: [0.4, 1, 0.7], x: 78 + index * 36, y: 74 + index * 48 }}
                  transition={{ duration: 0.8, delay: 0.08 + index * 0.1, ease: "easeOut" }}
                />
              ))}
            </svg>

            {[0, 0.09, 0.18].map((delay, index) => (
              <motion.span
                key={delay}
                className="fixed left-10 top-10 rounded-full border-[3px] border-[#43D2FF]/90 shadow-[0_0_26px_rgba(67,210,255,0.42)]"
                style={{ width: 48 + index * 14, height: 48 + index * 14, x: "-50%", y: "-50%" }}
                initial={{ scale: 0.45, opacity: 0.9 }}
                animate={{ scale: 3.8 + index * 0.28, opacity: [0.9, 0.55, 0] }}
                transition={{ duration: 0.88, delay, ease: [0.18, 0.72, 0.22, 1] }}
              />
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="relative z-30 flex h-full flex-col">
        <Link href="/vault/components" onClick={handleBrandClick} className={cn("group flex items-center gap-3 rounded-2xl p-2", !expanded && "justify-center")} aria-label="Component Vault home">
          <motion.span
            className="relative"
            whileHover={reduceMotion ? undefined : { scale: 1.045 }}
            whileTap={reduceMotion ? undefined : { scale: 0.9 }}
            animate={rippleId ? { rotate: [0, -4, 4, -2, 0], scale: [1, 0.94, 1.08, 1] } : undefined}
            transition={rippleId ? { duration: 0.52 } : fastMotion}
          >
            <BrandMark />
            <motion.span
              className="pointer-events-none absolute -inset-1 rounded-[20px] border-2 border-[#43D2FF]/0"
              animate={rippleId ? { borderColor: ["rgba(67,210,255,0)", "rgba(67,210,255,0.95)", "rgba(67,210,255,0)"], scale: [0.88, 1.22, 1.35] } : undefined}
              transition={{ duration: 0.52 }}
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
                  <motion.span className="relative z-10 grid size-5 shrink-0 place-items-center" whileHover={reduceMotion ? undefined : { scale: 1.06 }} transition={fastMotion}>
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
                <span className="relative mt-3 block text-sm font-semibold">Build faster with high-quality components.</span>
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
