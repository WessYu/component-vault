"use client";

import dynamic from "next/dynamic";
import { Copy, FileCode2, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSelectedComponent, useVaultStore } from "@/stores/vault-store";
import { cn } from "@/lib/utils";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center bg-terminal font-tech text-green">Loading Monaco Editor...</div>,
});

const tabs = ["Component.tsx", "styles.css", "usage.tsx", "notes.md"] as const;

export function CodeEditor({ componentSlug }: { componentSlug?: string } = {}) {
  const selectedComponent = useSelectedComponent();
  const componentFromSlug = useVaultStore((state) => state.components.find((item) => item.slug === componentSlug));
  const component = componentFromSlug ?? selectedComponent;
  const editorTab = useVaultStore((state) => state.editorTab);
  const setEditorTab = useVaultStore((state) => state.setEditorTab);
  const updateCode = useVaultStore((state) => state.updateCode);
  const addLog = useVaultStore((state) => state.addLog);
  const [dirty, setDirty] = useState(false);

  const field = useMemo(() => {
    if (editorTab === "styles.css") return "styles";
    if (editorTab === "usage.tsx") return "usageCode";
    if (editorTab === "notes.md") return "notes";
    return "code";
  }, [editorTab]);

  const value = component[field];
  const language = editorTab === "styles.css" ? "css" : editorTab === "notes.md" ? "markdown" : "typescript";

  useEffect(() => {
    if (!dirty) return;
    const handle = window.setTimeout(() => {
      setDirty(false);
      addLog("Autosave complete.");
    }, 900);
    return () => window.clearTimeout(handle);
  }, [dirty, value, addLog]);

  async function copyCode() {
    await navigator.clipboard.writeText(String(value));
    addLog("Code copied.");
  }

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_auto_1fr_auto] bg-terminal text-surface-light">
      <div className="flex items-center gap-1 border-b border-surface-dark bg-surface p-1 text-text-primary">
        {tabs.map((tab) => (
          <button
            key={tab}
            data-active={editorTab === tab}
            className="pressable bg-surface-light px-3 py-1 font-tech text-[11px] font-bold data-[active=true]:bg-navy data-[active=true]:text-surface-light"
            onClick={() => setEditorTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 border-b border-[#2b3228] px-3 py-2 font-tech text-[11px]">
        <FileCode2 size={14} aria-hidden />
        <span>{component.name}</span>
        <span className={cn("ml-auto", dirty ? "text-warning" : "text-green")}>{dirty ? "Unsaved changes" : "Saved"}</span>
        <button className="pressable bg-surface px-2 py-1 text-text-primary" onClick={() => addLog("Component saved.")}>
          <Save size={13} aria-hidden />
        </button>
        <button className="pressable bg-surface px-2 py-1 text-text-primary" onClick={copyCode}>
          <Copy size={13} aria-hidden />
        </button>
      </div>
      <MonacoEditor
        height="100%"
        language={language}
        value={String(value)}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontFamily: "IBM Plex Mono, Consolas, monospace",
          fontSize: 12,
          lineNumbersMinChars: 3,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: "on",
          tabSize: 2,
        }}
        onChange={(nextValue) => {
          updateCode(component.id, field, nextValue ?? "");
          setDirty(true);
        }}
      />
      <div className="flex items-center gap-4 border-t border-[#2b3228] px-3 py-1 font-tech text-[10px] text-green">
        <span>Ln 18, Col 7</span>
        <span>Spaces: 2</span>
        <span>UTF-8</span>
        <span>{language.toUpperCase()}</span>
      </div>
    </div>
  );
}
