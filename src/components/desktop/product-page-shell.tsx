"use client";

import { TopBar } from "@/components/desktop/top-bar";
import { SideDock } from "@/components/desktop/side-dock";
import { FocusedTaskbar } from "@/components/desktop/focused-taskbar";

export function ProductPageShell({ activeSection, children }: { activeSection: string; children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col gap-1 bg-background p-1 text-text-primary">
      <TopBar />
      <div className="grid flex-1 gap-1 md:grid-cols-[96px_1fr]">
        <SideDock active={activeSection} />
        <section className="retro-panel min-h-[calc(100dvh-120px)] overflow-hidden bg-surface-light">{children}</section>
      </div>
      <FocusedTaskbar />
    </main>
  );
}
