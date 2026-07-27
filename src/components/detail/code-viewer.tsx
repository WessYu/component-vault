"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import type { VaultComponent } from "@/types/vault";

export function CodeViewer({ component }: { component: VaultComponent }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(component.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1300);
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <select className="h-9 rounded-2xl border border-[#E4E7EF] bg-white px-3 text-sm text-[#6D7285]" defaultValue="React">
          <option>React</option>
          <option>HTML</option>
          <option>Tailwind</option>
        </select>
        <button className="inline-flex min-h-9 items-center gap-2 rounded-2xl border border-[#E4E7EF] bg-white px-3 text-sm font-medium text-[#171A2B]" onClick={copy}>
          {copied ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="max-h-[360px] overflow-auto rounded-3xl bg-[#171A2B] p-5 text-sm leading-6 text-[#EEF0FF]"><code>{component.code}</code></pre>
    </div>
  );
}
