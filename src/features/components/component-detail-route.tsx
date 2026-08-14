"use client";

import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { ComponentDetailWorkspace } from "@/features/components/component-detail-workspace";
import { ComponentFallbackWorkspace } from "@/features/components/component-fallback-workspace";
import { getExperience } from "@/components/experiences/experience-data";
import { useVaultStore } from "@/stores/vault-store";

export function ComponentDetailRoute({ slug }: { slug: string }) {
  const components = useVaultStore((state) => state.components);
  const isHydrated = useVaultStore((state) => state.isHydrated);
  const isSyncing = useVaultStore((state) => state.isSyncing);
  const backendError = useVaultStore((state) => state.backendError);
  const loadVault = useVaultStore((state) => state.loadVault);

  useEffect(() => {
    if (!isHydrated) void loadVault();
  }, [isHydrated, loadVault]);

  const component = components.find((item) => item.slug === slug || item.id === slug);

  // Seed data is available immediately. Never block a valid component route on the optional backend.
  if (component) {
    const isStandaloneMotion = component.category === "Motion Experiences" && !component.slug.startsWith("trend-") && !getExperience(component.slug);
    return isStandaloneMotion ? <ComponentFallbackWorkspace component={component} /> : <ComponentDetailWorkspace slug={component.slug} />;
  }

  if (!isHydrated || isSyncing) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[#F7F8FC] px-5">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="grid size-11 place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-[#E4E7EF]">
            <Loader2 className="animate-spin text-[#6366F1]" size={19} aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-text-primary">Loading component</p>
            <p className="mt-1 text-sm text-[#6D7285]">Syncing the component vault…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-[#F7F8FC] px-5 text-center">
      <div className="max-w-md">
        <p className="text-sm font-semibold text-[#FF7664]">Component not found</p>
        <h1 className="mt-2 text-3xl font-bold text-text-primary">{slug}</h1>
        <p className="mt-3 text-sm leading-6 text-[#6D7285]">The component is not available in the current vault dataset.{backendError ? ` ${backendError}` : ""}</p>
        <a className="mt-6 inline-flex min-h-11 items-center rounded-2xl bg-[#6366F1] px-5 text-sm font-semibold text-white" href="/vault/components">Back to library</a>
      </div>
    </div>
  );
}
