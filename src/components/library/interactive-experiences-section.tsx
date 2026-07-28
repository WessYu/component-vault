"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { ComponentPreview } from "@/components/detail/component-preview";
import { fastMotion } from "@/components/motion/site-motion";
import type { VaultComponent } from "@/types/vault";

export function InteractiveExperiencesSection({ experiences }: { experiences: VaultComponent[] }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  if (!experiences.length) return null;

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
            Compact previews in the library. Open a pattern to use the complete interactive experience.
          </p>
        </div>
        <span className="text-sm font-medium text-[#6D7285]">{experiences.length} patterns</span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {experiences.map((component) => {
          const isEmerging = component.tags.includes("2026-trend") || component.slug.startsWith("trend-");
          return (
            <motion.article
              key={component.slug}
              className="group relative min-w-0 overflow-hidden rounded-[30px] border border-[#E4E7EF] bg-[#F7F8FC] p-3 shadow-[0_14px_44px_rgba(23,26,43,0.04)]"
              whileHover={reduceMotion ? undefined : { y: -3, scale: 1.006 }}
              transition={fastMotion}
            >
              {isEmerging ? (
                <span className="absolute right-5 top-5 z-20 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#6366F1] shadow-sm backdrop-blur">
                  Emerging 2026
                </span>
              ) : null}

              <div className="h-[184px] min-h-0 overflow-hidden rounded-[24px]">
                <ComponentPreview component={component} compact viewport="Tablet" />
              </div>

              <button
                className="mt-3 block min-h-[154px] w-full rounded-[24px] bg-white p-4 text-left shadow-sm transition-colors hover:bg-[#FCFCFF]"
                onClick={() => router.push(`/vault/components/${component.slug}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-bold tracking-[-0.02em] text-[#171A2B]">{component.name}</h3>
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
