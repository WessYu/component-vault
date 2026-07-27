"use client";

import { Code2, Eye, FileText, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { LivePreview } from "@/components/preview/live-preview";
import { CodeEditor } from "@/components/editor/code-editor";
import { InspectorPanel } from "@/components/inspector/inspector-panel";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "preview", label: "Preview", icon: Eye },
  { id: "code", label: "Code", icon: Code2 },
  { id: "props", label: "Props", icon: SlidersHorizontal },
  { id: "notes", label: "Notes", icon: FileText },
] as const;

export function MobileDetailTabs({ componentSlug }: { componentSlug?: string }) {
  const [active, setActive] = useState<(typeof tabs)[number]["id"]>("preview");

  return (
    <div className="grid min-h-0 grid-rows-[1fr_54px] md:hidden">
      <div className="min-h-0 overflow-hidden">
        <div className={cn("h-full", active !== "preview" && "hidden")}>
          <LivePreview focused componentSlug={componentSlug} />
        </div>
        <div className={cn("h-full", active !== "code" && "hidden")}>
          <CodeEditor componentSlug={componentSlug} />
        </div>
        <div className={cn("h-full", active !== "props" && "hidden")}>
          <InspectorPanel focused defaultTab="PROPS" componentSlug={componentSlug} />
        </div>
        <div className={cn("h-full", active !== "notes" && "hidden")}>
          <InspectorPanel focused defaultTab="NOTES" componentSlug={componentSlug} />
        </div>
      </div>
      <nav className="grid grid-cols-4 border-t border-[#e5e5e2] bg-white" aria-label="Component detail tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} data-active={active === tab.id} className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold data-[active=true]:bg-navy data-[active=true]:text-surface-light" onClick={() => setActive(tab.id)}>
              <Icon size={16} aria-hidden />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
