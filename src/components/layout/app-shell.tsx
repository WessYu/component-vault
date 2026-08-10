"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { NavigationRail } from "@/components/layout/navigation-rail";
import { Topbar } from "@/components/layout/topbar";
import { PageFade, RouteProgress, SiteMotionLayer, motionEase } from "@/components/motion/site-motion";
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
    <main className="relative isolate min-h-dvh overflow-x-clip bg-[#F7F8FC] text-text-primary">
      <SiteMotionLayer />
      <RouteProgress />
      <div className="relative z-10 grid min-h-dvh lg:grid-cols-[auto_1fr]">
        <NavigationRail active={active} expanded={expanded} onToggle={() => setExpanded((value) => !value)} />
        <div className="min-w-0">
          <Topbar />
          <AnimatePresence mode="wait" initial={false}>
            {backendError ? (
              <motion.div
                key="backend-error"
                className="mx-4 mt-4 rounded-2xl border border-red-200 bg-red-50/92 px-4 py-3 text-sm font-medium text-red-700 shadow-sm backdrop-blur md:mx-7"
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.24, ease: motionEase }}
              >
                Backend: {backendError}
              </motion.div>
            ) : isSyncing ? (
              <motion.div
                key="backend-syncing"
                className="mx-4 mt-4 flex w-fit items-center gap-2 rounded-2xl border border-[#E4E7EF] bg-white/92 px-4 py-2 text-xs font-semibold text-[#6366F1] shadow-sm backdrop-blur md:mx-7"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: motionEase }}
              >
                <motion.span
                  className="size-2 rounded-full bg-[#6366F1]"
                  animate={{ scale: [1, 1.45, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                />
                Syncing backend...
              </motion.div>
            ) : null}
          </AnimatePresence>
          <PageFade>{children}</PageFade>
        </div>
      </div>
    </main>
  );
}
