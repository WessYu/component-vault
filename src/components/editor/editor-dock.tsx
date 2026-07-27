"use client";

import { ChevronDown, ChevronUp, FileCode2 } from "lucide-react";
import { useState } from "react";
import { CodeEditor } from "@/components/editor/code-editor";
import { useSelectedComponent, useVaultStore } from "@/stores/vault-store";

export function EditorDock({ componentSlug }: { componentSlug?: string }) {
  const [expanded, setExpanded] = useState(false);
  const editorTab = useVaultStore((state) => state.editorTab);
  const selected = useSelectedComponent();
  const componentFromSlug = useVaultStore((state) => state.components.find((item) => item.slug === componentSlug));
  const component = componentFromSlug ?? selected;

  return (
    <section className="retro-panel overflow-hidden bg-terminal text-surface-light" style={{ height: expanded ? 340 : 42 }}>
      <button className="flex h-[42px] w-full items-center gap-3 px-3 text-left font-tech text-xs font-bold uppercase" onClick={() => setExpanded((value) => !value)}>
        <FileCode2 size={15} aria-hidden />
        <span>CODE_EDITOR.TSX</span>
        <span className="text-green">{editorTab}</span>
        <span className="ml-auto text-green">Saved</span>
        <span className="inline-flex items-center gap-1">
          {expanded ? "Collapse" : "Expand"} {expanded ? <ChevronDown size={14} aria-hidden /> : <ChevronUp size={14} aria-hidden />}
        </span>
      </button>
      {expanded ? (
        <div className="h-[298px] border-t border-green/30">
          <CodeEditor componentSlug={component.slug} />
        </div>
      ) : null}
    </section>
  );
}
