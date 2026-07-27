"use client";

import { useEffect, useState } from "react";
import { NavigationRail } from "@/components/layout/navigation-rail";
import { Topbar } from "@/components/layout/topbar";
import { useVaultStore } from "@/stores/vault-store";

export function AppShell({ active = "Library", children }: { active?: string; children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const loadVault = useVaultStore((state) => state.loadVault);
  const isSyncing = useVaultStore((state) => state.isSyncing);
  const backendError = useVaultStore((state) => state.backendError);

  useEffect(() => {
    void loadVault();
  }, [loadVault]);

  return (
    <main className="min-h-dvh bg-[#F7F8FC] text-[#171A2B]">
      <div className="grid min-h-dvh lg:grid-cols-[auto_1fr]">
        <NavigationRail active={active} expanded={expanded} onToggle={() => setExpanded((value) => !value)} />
        <div className="min-w-0">
          <Topbar />
          {backendError ? (
            <div className="mx-4 mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 md:mx-7">
              Backend: {backendError}
            </div>
          ) : isSyncing ? (
            <div className="mx-4 mt-4 w-fit rounded-2xl border border-[#E4E7EF] bg-white px-4 py-2 text-xs font-semibold text-[#6366F1] shadow-sm md:mx-7">
              Syncing backend...
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </main>
  );
}
