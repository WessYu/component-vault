"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ComponentPreview } from "@/components/detail/component-preview";
import { fastMotion, motionEase } from "@/components/motion/site-motion";
import { cn } from "@/lib/utils";
import type { VaultComponent } from "@/types/vault";

export function InteractiveExperiencesSection({ experiences }: { experiences: VaultComponent[] }) {
  const router = useRouter();
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const hoverTimer = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();

  if (!experiences.length) return null;

  function clearHoverTimer() {
    if (hoverTimer.current) {
      window.clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    setPendingSlug(null);
  }

  function startPreview(component: VaultComponent) {
    clearHoverTimer();
    setPendingSlug(component.slug);
    hoverTimer.current = window.setTimeout(() => {
      setActiveSlug(component.slug);
      setPendingSlug(null);
    }, 1200);
  }

  function stopPreview(component: VaultComponent) {
    clearHoverTimer();
    setActiveSlug((current) => (current === component.slug ? null : current));
  }

  return (
    <section className="rounded-[34px] border border-[#E4E7EF] bg-white p-4 shadow-[0_18px_70px_rgba(23,26,43,0.045)] md:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-[#F3EEFF] px-3 py-1 text-sm font-semibold text-[#5B21B6]">
            <Sparkles size={15} aria-hidden />
            Motion Experiences
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-[#171A2B]">Interactive Experiences</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6D7285]">
            Complete scroll, navigation, morph and comparison patterns with real interaction previews.
          </p>
        </div>
        <span className="text-sm font-medium text-[#6D7285]">{experiences.length} patterns</span>
      </div>

      <div className="mt-5 grid auto-rows-[minmax(260px,auto)] gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {experiences.map((component) => {
          const isActive = activeSlug === component.slug;
          const isPending = pendingSlug === component.slug;
          return (
            <motion.article
              key={component.slug}
              layout
              data-feature-active={isActive ? "true" : undefined}
              className={cn(
                "group relative overflow-hidden rounded-[30px] border bg-[#F7F8FC] p-3 shadow-[0_14px_44px_rgba(23,26,43,0.04)] transition-colors",
                isActive ? "border-[#C9C7FF] md:col-span-2 2xl:col-span-2" : "border-[#E4E7EF]",
              )}
              animate={isActive ? { scale: 1.012 } : { scale: 1 }}
              whileHover={reduceMotion ? undefined : { y: -5 }}
              transition={{ layout: { duration: 0.28, ease: motionEase }, ...fastMotion }}
              onPointerEnter={() => startPreview(component)}
              onPointerLeave={() => stopPreview(component)}
              onFocus={() => setActiveSlug(component.slug)}
              onBlur={() => setActiveSlug((current) => (current === component.slug ? null : current))}
            >
              <AnimatePresence>
                {isPending ? (
                  <motion.span
                    className="absolute left-5 right-5 top-5 z-20 h-1 overflow-hidden rounded-full bg-white/70"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.span className="block h-full rounded-full bg-[#6366F1]" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 1.2, ease: "linear" }} />
                  </motion.span>
                ) : null}
              </AnimatePresence>

              <motion.div layout className={cn("overflow-hidden rounded-[26px]", isActive ? "min-h-[390px]" : "min-h-[178px]")}>
                <ComponentPreview key={`${component.slug}-${isActive ? "active" : "rest"}`} component={component} compact={!isActive} viewport={isActive ? "Desktop" : "Tablet"} />
              </motion.div>

              <button
                className="mt-4 block w-full rounded-[24px] bg-white p-4 text-left shadow-sm"
                onClick={() => router.push(`/vault/components/${component.slug}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold tracking-[-0.02em] text-[#171A2B]">{component.name}</h3>
                    <p className={cn("mt-1 text-sm leading-6 text-[#6D7285]", isActive ? "line-clamp-3" : "line-clamp-2")}>{component.description}</p>
                  </div>
                  <ArrowRight className="mt-1 shrink-0 text-[#6366F1] transition group-hover:translate-x-1" size={18} aria-hidden />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {component.tags.slice(0, isActive ? 5 : 3).map((tag) => (
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
