"use client";

import { useEffect } from "react";
import { WindowFrame } from "@/components/ui/window-frame";
import { TopBar } from "@/components/desktop/top-bar";
import { SideDock } from "@/components/desktop/side-dock";
import { Taskbar } from "@/components/desktop/taskbar";
import { ComponentBrowser } from "@/components/vault/component-browser";
import { LivePreview } from "@/components/preview/live-preview";
import { CodeEditor } from "@/components/editor/code-editor";
import { InspectorPanel } from "@/components/inspector/inspector-panel";
import { TerminalWindow } from "@/components/desktop/terminal-window";
import { MobileTabs } from "@/components/desktop/mobile-tabs";
import { useVaultStore } from "@/stores/vault-store";
import type { WindowKey } from "@/types/vault";
import { cn } from "@/lib/utils";

type VaultShellProps = {
  activeSection?: string;
  initialComponentId?: string;
  focus?: WindowKey;
};

export function VaultShell({ activeSection = "Dashboard", initialComponentId, focus }: VaultShellProps) {
  const activeWindow = useVaultStore((state) => state.activeWindow);
  const setSelectedComponent = useVaultStore((state) => state.setSelectedComponent);
  const setActiveWindow = useVaultStore((state) => state.setActiveWindow);

  useEffect(() => {
    if (initialComponentId) {
      setSelectedComponent(initialComponentId);
    }
    if (focus) {
      setActiveWindow(focus);
    }
  }, [focus, initialComponentId, setActiveWindow, setSelectedComponent]);

  return (
    <main className="flex h-dvh flex-col gap-1 bg-background p-1 text-text-primary">
      <TopBar />
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-1 md:grid-cols-[96px_1fr]">
        <SideDock active={activeSection} />
        <section className="relative min-h-0 overflow-hidden">
          <div className="hidden h-full min-h-0 grid-cols-12 grid-rows-12 gap-1 md:grid">
            <WindowFrame id="browser" title="BROWSER.EXE" className="col-span-6 row-span-8">
              <ComponentBrowser />
            </WindowFrame>
            <WindowFrame id="preview" title="PREVIEW.LIVE" className="col-span-6 row-span-6">
              <LivePreview />
            </WindowFrame>
            <WindowFrame id="editor" title="CODE_EDITOR.TSX" className="col-span-3 row-span-4">
              <CodeEditor />
            </WindowFrame>
            <WindowFrame id="inspector" title="INSPECTOR.NOTES" className="col-span-3 row-span-4">
              <InspectorPanel />
            </WindowFrame>
            <WindowFrame id="terminal" title="TERMINAL.LOG" className="col-span-6 row-span-2" closeable={false}>
              <TerminalWindow />
            </WindowFrame>
          </div>

          <div className="h-full min-h-0 md:hidden">
            <div className={cn("h-full", activeWindow !== "browser" && "hidden")}>
              <ComponentBrowser compact />
            </div>
            <div className={cn("h-full", activeWindow !== "preview" && "hidden")}>
              <LivePreview />
            </div>
            <div className={cn("h-full", activeWindow !== "editor" && "hidden")}>
              <CodeEditor />
            </div>
            <div className={cn("h-full", activeWindow !== "inspector" && "hidden")}>
              <InspectorPanel />
            </div>
          </div>
        </section>
      </div>
      <Taskbar />
      <MobileTabs />
    </main>
  );
}
