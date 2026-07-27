"use client";

import { useState } from "react";
import { NavigationRail } from "@/components/layout/navigation-rail";
import { Topbar } from "@/components/layout/topbar";
import { PageFade, RouteProgress, SiteMotionLayer } from "@/components/motion/site-motion";

export function AppShell({ active = "Library", children }: { active?: string; children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <main className="relative isolate min-h-dvh overflow-x-clip bg-[#F7F8FC] text-[#171A2B]">
      <SiteMotionLayer />
      <RouteProgress />
      <div className="relative z-10 grid min-h-dvh lg:grid-cols-[auto_1fr]">
        <NavigationRail active={active} expanded={expanded} onToggle={() => setExpanded((value) => !value)} />
        <div className="min-w-0">
          <Topbar />
          <PageFade>{children}</PageFade>
        </div>
      </div>
    </main>
  );
}
