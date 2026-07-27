"use client";

import { useState } from "react";
import { NavigationRail } from "@/components/layout/navigation-rail";
import { Topbar } from "@/components/layout/topbar";

export function AppShell({ active = "Library", children }: { active?: string; children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <main className="min-h-dvh bg-[#F7F8FC] text-[#171A2B]">
      <div className="grid min-h-dvh lg:grid-cols-[auto_1fr]">
        <NavigationRail active={active} expanded={expanded} onToggle={() => setExpanded((value) => !value)} />
        <div className="min-w-0">
          <Topbar />
          {children}
        </div>
      </div>
    </main>
  );
}
