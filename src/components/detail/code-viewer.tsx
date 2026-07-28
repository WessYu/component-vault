"use client";

import { Check, Copy, Pencil, Save, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useVaultStore } from "@/stores/vault-store";
import { cn } from "@/lib/utils";
import type { VaultComponent } from "@/types/vault";

type CodeField = "code" | "styles" | "usageCode";

const files: Array<{ field: CodeField; label: string }> = [
  { field: "code", label: "Component.tsx" },
  { field: "styles", label: "styles.css" },
  { field: "usageCode", label: "usage.tsx" },
];

export function CodeViewer({ component }: { component: VaultComponent }) {
  const updateCode = useVaultStore((state) => state.updateCode);
  const [activeField, setActiveField] = useState<CodeField>("code");
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const source = useMemo(() => component[activeField], [activeField, component]);
  const [draft, setDraft] = useState(source);

  useEffect(() => {
    setEditing(false);
    setDraft(source);
  }, [activeField, component.id, source]);

  async function copy() {
    await navigator.clipboard.writeText(editing ? draft : source);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1300);
  }

  async function save() {
    if (draft === source) {
      setEditing(false);
      return;
    }
    setSaving(true);
    await updateCode(component.id, activeField, draft);
    setSaving(false);
    setEditing(false);
  }

  function cancel() {
    setDraft(source);
    setEditing(false);
  }

  return (
    <div>
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex overflow-x-auto rounded-2xl bg-[#F2F4FA] p-1">
          {files.map((file) => (
            <button
              key={file.field}
              className={cn("min-h-8 whitespace-nowrap rounded-xl px-3 text-xs font-semibold text-[#6D7285]", activeField === file.field && "bg-white text-[#6366F1] shadow-sm")}
              onClick={() => setActiveField(file.field)}
            >
              {file.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button className="inline-flex min-h-9 items-center gap-2 rounded-2xl border border-[#E4E7EF] bg-white px-3 text-sm font-medium text-[#6D7285]" onClick={cancel} disabled={saving}>
                <X size={15} aria-hidden /> Cancel
              </button>
              <button className="inline-flex min-h-9 items-center gap-2 rounded-2xl bg-[#6366F1] px-3 text-sm font-semibold text-white disabled:opacity-60" onClick={() => void save()} disabled={saving}>
                <Save size={15} aria-hidden /> {saving ? "Saving..." : "Save to Convex"}
              </button>
            </>
          ) : (
            <button className="inline-flex min-h-9 items-center gap-2 rounded-2xl border border-[#E4E7EF] bg-white px-3 text-sm font-medium text-[#171A2B]" onClick={() => setEditing(true)}>
              <Pencil size={15} aria-hidden /> Edit
            </button>
          )}
          <button className="inline-flex min-h-9 items-center gap-2 rounded-2xl border border-[#E4E7EF] bg-white px-3 text-sm font-medium text-[#171A2B]" onClick={copy}>
            {copied ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {editing ? (
        <textarea
          className="min-h-[360px] w-full resize-y rounded-3xl border border-[#2A2E44] bg-[#171A2B] p-5 font-mono text-sm leading-6 text-[#EEF0FF] outline-none ring-[#6366F1] focus:ring-2"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          spellCheck={false}
          aria-label={`Edit ${files.find((file) => file.field === activeField)?.label}`}
        />
      ) : (
        <pre className="max-h-[360px] overflow-auto rounded-3xl bg-[#171A2B] p-5 text-sm leading-6 text-[#EEF0FF]"><code>{source || "// No content yet"}</code></pre>
      )}
    </div>
  );
}
