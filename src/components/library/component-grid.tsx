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
    <AnimatedGrid className={view === "grid" ? "grid auto-rows-[minmax(270px,auto)] grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3" : "space-y-4"}>
      {components.map((component) => (
        <AnimatedGridItem key={component.slug}>
          <ComponentCard component={component} selected={selectedSlug === component.slug} view={view} onSelect={() => onSelect(component)} onFavorite={() => onFavorite(component)} />
        </AnimatedGridItem>
      ))}
    </AnimatedGrid>
  );
}
