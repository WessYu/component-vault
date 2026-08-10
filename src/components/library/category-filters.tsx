"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const visualFilters = ["All", "Motion Experiences", "Data Display", "Inputs", "Navigation", "Layout", "Feedback"] as const;

export function CategoryFilters({ active, onChange }: { active: string; onChange: (value: string) => void }) {
  return (
    <div className="thin-scrollbar flex max-w-full gap-2 overflow-x-auto pb-1 pr-1 [mask-image:linear-gradient(to_right,black_0%,black_calc(100%-28px),transparent_100%)] 2xl:flex-wrap 2xl:overflow-visible 2xl:pb-0 2xl:[mask-image:none]" aria-label="Category filters">
      {visualFilters.map((filter) => (
        <button
          key={filter}
          className={cn("relative min-h-10 shrink-0 rounded-2xl px-3.5 text-sm font-semibold transition md:px-4", active === filter ? "text-text-primary" : "text-[#6D7285] hover:text-text-primary")}
          onClick={() => onChange(filter)}
        >
          {active === filter ? <motion.span layoutId="category-filter" className="absolute inset-0 rounded-2xl bg-white shadow-sm ring-1 ring-[#E4E7EF]" /> : null}
          <span className="relative">{filter}</span>
        </button>
      ))}
    </div>
  );
}
