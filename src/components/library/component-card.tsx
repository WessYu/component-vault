"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Heart, MoreHorizontal, Star } from "lucide-react";
import { ComponentPreview } from "@/components/detail/component-preview";
import { cardSpan, categoryStyle, visualCategory } from "@/components/library/category-style";
import { fastMotion, motionEase } from "@/components/motion/site-motion";
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
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      layout="position"
      initial="rest"
      animate={selected ? "selected" : "rest"}
      whileHover={reduceMotion ? undefined : "hover"}
      variants={{
        rest: { y: 0, scale: 1 },
        selected: { y: -1, scale: 1.002 },
        hover: { y: -4, scale: 1.003 },
      }}
      transition={fastMotion}
      className={cn(
        "group relative transform-gpu overflow-hidden rounded-[28px] border bg-white shadow-[0_14px_48px_rgba(23,26,43,0.05)] transition-[border-color,box-shadow] duration-150 hover:shadow-[0_18px_54px_rgba(23,26,43,0.075)]",
        selected ? "ring-2 ring-[#6366F1]/35" : "border-[#E4E7EF]",
        view === "grid" && cardSpan(component),
        view === "list" && "grid gap-4 md:grid-cols-[320px_1fr]",
      )}
      style={{ borderColor: selected ? style.accent : undefined }}
    >
      <motion.div
        className="pointer-events-none absolute inset-y-0 -left-1/3 z-20 w-1/4 transform-gpu bg-gradient-to-r from-transparent via-white/60 to-transparent"
        variants={{
          rest: { x: "-120%", opacity: 0 },
          selected: { x: "-120%", opacity: 0 },
          hover: { x: "620%", opacity: 0.55 },
        }}
        transition={{ duration: 0.34, ease: motionEase }}
      />
      <motion.div
        className="pointer-events-none absolute -right-12 -top-12 size-36 rounded-full blur-2xl"
        style={{ background: style.accent }}
        variants={{
          rest: { opacity: 0.025, scale: 0.94 },
          selected: { opacity: 0.085, scale: 1 },
          hover: { opacity: 0.1, scale: 1.04 },
        }}
        transition={fastMotion}
      />

      <div
        className="relative z-10 block h-full w-full cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]"
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
        <div className={cn("overflow-hidden p-3", view === "list" && "md:p-4")}>
          <motion.div
            className="transform-gpu"
            variants={{
              rest: { scale: 1, y: 0 },
              selected: { scale: 1.004, y: 0 },
              hover: { scale: 1.012, y: -1 },
            }}
            transition={{ duration: 0.18, ease: motionEase }}
          >
            <ComponentPreview component={component} compact />
          </motion.div>
        </div>
        <div className="px-5 pb-5">
          <div className="flex items-center justify-between gap-3">
            <motion.span
              className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{ background: style.soft, color: style.text }}
              variants={{ rest: { scale: 1 }, selected: { scale: 1.015 }, hover: { scale: 1.02 } }}
              transition={fastMotion}
            >
              {visualCategory(component)}
            </motion.span>
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
      <motion.div
        className="absolute right-4 top-4 z-30 flex gap-2"
        variants={{
          rest: { opacity: 0, y: 3, scale: 0.98 },
          selected: { opacity: 1, y: 0, scale: 1 },
          hover: { opacity: 1, y: 0, scale: 1 },
        }}
        transition={{ duration: 0.12, ease: motionEase }}
      >
        <motion.button
          className="grid size-9 place-items-center rounded-2xl bg-white/95 text-[#6D7285] shadow-md hover:text-[#6366F1]"
          onClick={(event) => {
            event.stopPropagation();
            onFavorite();
          }}
          aria-label={component.isFavorite ? "Remove favorite" : "Add favorite"}
          whileTap={reduceMotion ? undefined : { scale: 0.92 }}
          whileHover={reduceMotion ? undefined : { scale: 1.04 }}
          transition={fastMotion}
        >
          <Heart size={16} fill={component.isFavorite ? style.accent : "none"} color={component.isFavorite ? style.accent : "currentColor"} aria-hidden />
        </motion.button>
        <motion.button
          className="grid size-9 place-items-center rounded-2xl bg-white/95 text-[#6D7285] shadow-md"
          aria-label="Component actions"
          onClick={(event) => event.stopPropagation()}
          whileTap={reduceMotion ? undefined : { scale: 0.92 }}
          whileHover={reduceMotion ? undefined : { scale: 1.04 }}
          transition={fastMotion}
        >
          <MoreHorizontal size={16} aria-hidden />
        </motion.button>
      </motion.div>
    </motion.article>
  );
}
