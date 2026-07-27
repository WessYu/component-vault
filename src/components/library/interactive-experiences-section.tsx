"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { ExperiencePreview } from "@/components/experiences/shared/experience-shell";
import type { ExperienceSlug } from "@/components/experiences/experience-data";
import type { VaultComponent } from "@/types/vault";

export function InteractiveExperiencesSection({ experiences }: { experiences: VaultComponent[] }) {
  const router = useRouter();

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
            Complete scroll, navigation, morph and comparison patterns with real interaction previews.
          </p>
        </div>
        <span className="text-sm font-medium text-[#6D7285]">{experiences.length} patterns</span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {experiences.map((component) => (
          <article key={component.slug} className="group overflow-hidden rounded-[30px] border border-[#E4E7EF] bg-[#F7F8FC] p-3 transition hover:-translate-y-1 hover:shadow-[0_22px_90px_rgba(23,26,43,0.09)]">
            <ExperiencePreview slug={component.slug as ExperienceSlug} />
            <button className="mt-4 block w-full rounded-[24px] bg-white p-4 text-left shadow-sm" onClick={() => router.push(`/vault/components/${component.slug}`)}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold tracking-[-0.02em] text-[#171A2B]">{component.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#6D7285]">{component.description}</p>
                </div>
                <ArrowRight className="mt-1 shrink-0 text-[#6366F1] transition group-hover:translate-x-1" size={18} aria-hidden />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {component.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded-full bg-[#F3EEFF] px-2.5 py-1 text-xs font-semibold text-[#5B21B6]">{tag}</span>
                ))}
              </div>
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
