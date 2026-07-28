"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ComponentPreview } from "@/components/detail/component-preview";
import { motionEase } from "@/components/motion/site-motion";
import { cn } from "@/lib/utils";
import type { VaultComponent } from "@/types/vault";

export function InteractiveExperiencesSection({ experiences }: { experiences: VaultComponent[] }) {
  const router = useRouter();
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const hoverTimer = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();

  if (!experiences.length) return null;

  function canSustainHover() {
    return typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }

  function clearHoverTimer() {
    if (hoverTimer.current) {
      window.clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    setPendingSlug(null);
  }

  function startPreview(component: VaultComponent) {
    if (!canSustainHover()) return;
    clearHoverTimer();
    setPendingSlug(component.slug);
    hoverTimer.current = window.setTimeout(() => {
      setActiveSlug(component.slug);
      setPendingSlug(null);
    }, 650);
  }

  function stopPreview(component: VaultComponent) {
    clearHoverTimer();
    setActiveSlug((current) => (current === component.slug ? null : current));
  }

  return (
    <section className="overflow-hidden rounded-[24px] border border-[#E4E7EF] bg-white shadow-[0_18px_70px_rgba(23,26,43,0.045)] md:rounded-[30px]">
      <div className="relative border-b border-[#E4E7EF] bg-[linear-gradient(135deg,#FFFFFF_0%,#F7F8FC_58%,#F3EEFF_100%)] p-4 md:p-6">
        <div className="pointer-events-none absolute inset-0 opacity-55 [background-image:radial-gradient(rgba(99,102,241,0.15)_0.8px,transparent_0.8px)] [background-size:12px_12px] [mask-image:linear-gradient(to_bottom,black,transparent_86%)]" />
        <div className="relative flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/85 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#5B21B6] shadow-sm backdrop-blur">
              <Sparkles size={14} aria-hidden />
              Motion experiences
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-[#171A2B] md:text-4xl">Interactive Experiences</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6D7285] md:text-base">
              Responsive previews for motion patterns, emerging UI models and polished interaction systems.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
            <span className="rounded-2xl border border-white/80 bg-white/80 px-3 py-2 text-xs font-bold text-[#171A2B] shadow-sm">
              {experiences.length} patterns
            </span>
            <span className="inline-flex items-center gap-2 rounded-2xl border border-[#DCD7FF] bg-[#F7F7FF] px-3 py-2 text-xs font-bold text-[#6366F1] shadow-sm">
              <Wand2 size={13} aria-hidden />
              Hover preview
            </span>
          </div>
        </div>
      </div>

      <div className="grid auto-rows-auto gap-3 bg-white p-3 md:grid-cols-2 md:gap-4 md:p-5 xl:grid-cols-3">
        {experiences.map((component, index) => {
          const isActive = activeSlug === component.slug;
          const isPending = pendingSlug === component.slug;
          const isEmerging = component.tags.includes("2026-trend") || component.slug.startsWith("trend-");
          return (
            <motion.article
              key={component.slug}
              data-feature-active={isActive ? "true" : undefined}
              className={cn(
                "group relative min-w-0 overflow-hidden rounded-[22px] border bg-[#F7F8FC] p-2.5 shadow-[0_12px_34px_rgba(23,26,43,0.04)] transition-[border-color,box-shadow] duration-150 md:rounded-[26px]",
                isActive ? "border-[#C9C7FF] shadow-[0_18px_52px_rgba(99,102,241,0.11)]" : "border-[#E4E7EF]",
              )}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.12 }}
              transition={{ duration: 0.22, delay: Math.min(index * 0.012, 0.16), ease: motionEase }}
              animate={isActive ? { scale: 1.004 } : { scale: 1 }}
              whileHover={reduceMotion ? undefined : { y: -3 }}
              onPointerEnter={() => startPreview(component)}
              onPointerLeave={() => stopPreview(component)}
              onFocus={() => {
                if (canSustainHover()) setActiveSlug(component.slug);
              }}
              onBlur={() => setActiveSlug((current) => (current === component.slug ? null : current))}
            >
              <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex items-center justify-between gap-3">
                <AnimatePresence>
                  {isPending ? (
                    <motion.span
                      className="h-1 flex-1 overflow-hidden rounded-full bg-white/80 shadow-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.span className="block h-full rounded-full bg-[#6366F1]" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 0.65, ease: "linear" }} />
                    </motion.span>
                  ) : (
                    <span />
                  )}
                </AnimatePresence>
                {isEmerging ? (
                  <span className="rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#6366F1] shadow-sm backdrop-blur">
                    Emerging 2026
                  </span>
                ) : null}
              </div>

              <div className={cn("overflow-hidden rounded-[20px] transition-[height] duration-200 ease-out md:rounded-[24px]", isActive ? "h-[224px] md:h-[238px]" : "h-[158px] md:h-[176px]")}>
                <ComponentPreview component={component} compact viewport="Tablet" />
              </div>

              <button
                className="mt-2.5 block min-h-[136px] w-full rounded-[18px] bg-white p-3 text-left shadow-sm transition-colors hover:bg-[#FCFCFF] md:rounded-[22px] md:p-4"
                onClick={() => router.push(`/vault/components/${component.slug}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-bold tracking-[-0.02em] text-[#171A2B] md:text-lg">{component.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#6D7285]">{component.description}</p>
                  </div>
                  <ArrowRight className="mt-1 shrink-0 text-[#6366F1] transition-transform group-hover:translate-x-1" size={18} aria-hidden />
                </div>
                <div className="mt-4 flex min-h-7 flex-wrap gap-2">
                  {component.tags.filter((tag) => tag !== "2026-trend").slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-full bg-[#F3EEFF] px-2.5 py-1 text-xs font-semibold text-[#5B21B6]">{tag}</span>
                  ))}
                </div>
              </button>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
