"use client";

import { Boxes, Code2, Eye, FileText } from "lucide-react";
import { useVaultStore } from "@/stores/vault-store";
import type { WindowKey } from "@/types/vault";

const tabs: Array<{ id: WindowKey; label: string; icon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }> }> = [
  { id: "browser", label: "Browser", icon: Boxes },
  { id: "preview", label: "Preview", icon: Eye },
  { id: "editor", label: "Code", icon: Code2 },
  { id: "inspector", label: "Inspect", icon: FileText },
];

export function MobileTabs() {
  const activeWindow = useVaultStore((state) => state.activeWindow);
  const setActiveWindow = useVaultStore((state) => state.setActiveWindow);

  return (
    <nav className="retro-panel grid h-14 grid-cols-4 md:hidden" aria-label="Mobile vault tabs">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button key={tab.id} data-active={activeWindow === tab.id} className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold data-[active=true]:bg-navy data-[active=true]:text-surface-light" onClick={() => setActiveWindow(tab.id)}>
            <Icon size={16} aria-hidden />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
