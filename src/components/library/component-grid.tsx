"use client";

import { AnimatedGrid, AnimatedGridItem } from "@/components/motion/animated-grid";
import { ComponentCard } from "@/components/library/component-card";
import type { VaultComponent } from "@/types/vault";

export function ComponentGrid({
  components,
  selectedSlug,
  view,
  onSelect,
  onFavorite,
}: {
  components: VaultComponent[];
  selectedSlug?: string;
  view: "grid" | "list";
  onSelect: (component: VaultComponent) => void;
  onFavorite: (component: VaultComponent) => void;
}) {
  return (
    <AnimatedGrid className={view === "grid" ? "grid auto-rows-[minmax(252px,auto)] grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" : "space-y-3"}>
      {components.map((component) => (
        <AnimatedGridItem key={component.slug}>
          <ComponentCard component={component} selected={selectedSlug === component.slug} view={view} onSelect={() => onSelect(component)} onFavorite={() => onFavorite(component)} />
        </AnimatedGridItem>
      ))}
    </AnimatedGrid>
  );
}
