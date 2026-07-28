"use client";

import { Check, Copy, Pencil, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useVaultStore } from "@/stores/vault-store";
import type { VaultComponent } from "@/types/vault";

export function CodeViewer({ component }: { component: VaultComponent }) {
  const updateCode = useVaultStore((state) => state.updateCode);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(component.code);

  useEffect(() => {
    if (!editing) setDraft(component.code);
  }, [component.code, editing]);

  async function copy() {
    await navigator.clipboard.writeText(editing ? draft : component.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1300);
  }

  async function save() {
    if (draft === component.code) {
      setEditing(false);
      return;
    }
    setSaving(true);
    await updateCode(component.id, "code", draft);
    setSaving(false);
    setEditing(false);
  }

  function cancel() {
    setDraft(component.code);
    setEditing(false);
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <select className="h-9 rounded-2xl border border-[#E4E7EF] bg-white px-3 text-sm text-[#6D7285]" defaultValue={component.framework}>
          <option>React</option>
          <option>HTML</option>
          <option>Tailwind</option>
        </select>
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
          aria-label={`Edit ${component.name} code`}
        />
      ) : (
        <pre className="max-h-[360px] overflow-auto rounded-3xl bg-[#171A2B] p-5 text-sm leading-6 text-[#EEF0FF]"><code>{component.code}</code></pre>
      )}
    </div>
  );
}
