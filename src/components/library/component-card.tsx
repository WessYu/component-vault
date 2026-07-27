"use client";

import { motion } from "framer-motion";
import { Heart, MoreHorizontal, Star } from "lucide-react";
import { ComponentPreview } from "@/components/detail/component-preview";
import { cardSpan, categoryStyle, visualCategory } from "@/components/library/category-style";
import { cn } from "@/lib/utils";
import type { VaultComponent } from "@/types/vault";

export function ComponentCard({
  component,
  selected,
  view,
  onSelect,
  onFavorite,
}: {
  component: VaultComponent;
  selected: boolean;
  view: "grid" | "list";
  onSelect: () => void;
  onFavorite: () => void;
}) {
  const style = categoryStyle(component);
  const uses = component.usage.reduce((sum, item) => sum + item.count, 0);

  return (
    <motion.article
      layout
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      className={cn(
        "group relative overflow-hidden rounded-[28px] border bg-white shadow-[0_18px_70px_rgba(23,26,43,0.055)] transition-colors",
        selected ? "ring-2 ring-[#6366F1]/40" : "border-[#E4E7EF]",
        view === "grid" && cardSpan(component),
        view === "list" && "grid gap-4 md:grid-cols-[320px_1fr]",
      )}
      style={{ borderColor: selected ? style.accent : undefined }}
    >
      <div
        className="block h-full w-full cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]"
        onClick={onSelect}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Open ${component.name}`}
      >
        <div className={cn("p-3", view === "list" && "md:p-4")}>
          <ComponentPreview component={component} compact />
        </div>
        <div className="px-5 pb-5">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: style.soft, color: style.text }}>
              {visualCategory(component)}
            </span>
            <span className="font-mono text-xs text-[#9A9FB1]">{component.version}</span>
          </div>
          <h3 className="mt-3 text-base font-bold tracking-[-0.015em] text-[#171A2B]">{component.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#6D7285]">{component.description}</p>
          <div className="mt-4 flex items-center justify-between text-xs text-[#9A9FB1]">
            <span className="inline-flex items-center gap-1"><Star size={13} aria-hidden /> {component.isFavorite ? 124 : 78}</span>
            <span>{uses} uses</span>
            <span>{component.framework}</span>
          </div>
        </div>
      </div>
      <div className="absolute right-4 top-4 flex translate-y-1 gap-2 opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100">
        <button
          className="grid size-9 place-items-center rounded-2xl bg-white/90 text-[#6D7285] shadow-lg backdrop-blur hover:text-[#6366F1]"
          onClick={(event) => {
            event.stopPropagation();
            onFavorite();
          }}
          aria-label={component.isFavorite ? "Remove favorite" : "Add favorite"}
        >
          <Heart size={16} fill={component.isFavorite ? style.accent : "none"} color={component.isFavorite ? style.accent : "currentColor"} aria-hidden />
        </button>
        <button className="grid size-9 place-items-center rounded-2xl bg-white/90 text-[#6D7285] shadow-lg backdrop-blur" aria-label="Component actions" onClick={(event) => event.stopPropagation()}>
          <MoreHorizontal size={16} aria-hidden />
        </button>
      </div>
    </motion.article>
  );
}
