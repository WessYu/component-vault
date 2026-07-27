"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const visualFilters = ["All", "Data Display", "Inputs", "Navigation", "Layout", "Feedback"] as const;

export function CategoryFilters({ active, onChange }: { active: string; onChange: (value: string) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Category filters">
      {visualFilters.map((filter) => (
        <button
          key={filter}
          className={cn("relative min-h-10 shrink-0 rounded-2xl px-4 text-sm font-semibold transition", active === filter ? "text-[#171A2B]" : "text-[#6D7285] hover:text-[#171A2B]")}
          onClick={() => onChange(filter)}
        >
          {active === filter ? <motion.span layoutId="category-filter" className="absolute inset-0 rounded-2xl bg-white shadow-sm ring-1 ring-[#E4E7EF]" /> : null}
          <span className="relative">{filter}</span>
        </button>
      ))}
    </div>
  );
}
