"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Accessibility, BookOpen, Code2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeViewer } from "@/components/detail/code-viewer";
import type { VaultComponent } from "@/types/vault";

export type PanelTab = "Preview" | "Code" | "Usage" | "Props";
export type DetailTab = "Code" | "Usage" | "Accessibility" | "Notes" | "Changelog";

export function PanelTabs({ active, onChange }: { active: PanelTab; onChange: (tab: PanelTab) => void }) {
  const tabs: PanelTab[] = ["Preview", "Code", "Usage", "Props"];
  return (
    <div className="relative flex border-b border-[#E4E7EF]">
      {tabs.map((tab) => (
        <button key={tab} className={cn("relative min-h-11 flex-1 text-sm font-medium", active === tab ? "text-[#6366F1]" : "text-[#6D7285]")} onClick={() => onChange(tab)}>
          {tab}
          {active === tab ? <motion.span layoutId="panel-tab-indicator" className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-[#6366F1]" /> : null}
        </button>
      ))}
    </div>
  );
}

export function ComponentDetailTabs({ component, active, onChange }: { component: VaultComponent; active: DetailTab; onChange: (tab: DetailTab) => void }) {
  const tabs: Array<{ tab: DetailTab; icon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }> }> = [
    { tab: "Code", icon: Code2 },
    { tab: "Usage", icon: BookOpen },
    { tab: "Accessibility", icon: Accessibility },
    { tab: "Notes", icon: FileText },
    { tab: "Changelog", icon: FileText },
  ];

  return (
    <section className="overflow-hidden rounded-[28px] border border-[#E4E7EF] bg-white shadow-[0_18px_70px_rgba(23,26,43,0.05)]">
      <div className="flex overflow-x-auto border-b border-[#E4E7EF] px-2">
        {tabs.map(({ tab, icon: Icon }) => (
          <button key={tab} className={cn("relative inline-flex min-h-12 items-center gap-2 px-4 text-sm font-medium", active === tab ? "text-[#171A2B]" : "text-[#6D7285]")} onClick={() => onChange(tab)}>
            <Icon size={16} aria-hidden />
            {tab}
            {active === tab ? <motion.span layoutId="detail-tab-indicator" className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[#6366F1]" /> : null}
          </button>
        ))}
      </div>
      <div className="p-5">
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.16 }}>
            {active === "Code" ? <CodeViewer component={component} /> : null}
            {active === "Usage" ? <UsageContent component={component} /> : null}
            {active === "Accessibility" ? <AccessibilityContent /> : null}
            {active === "Notes" ? <p className="text-sm leading-7 text-[#6D7285]">{component.notes}</p> : null}
            {active === "Changelog" ? <ChangelogContent component={component} /> : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function UsageContent({ component }: { component: VaultComponent }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-3xl border border-[#E4E7EF] bg-[#F7F8FC] p-4">
        <h3 className="font-semibold">Import</h3>
        <pre className="mt-3 overflow-auto rounded-2xl bg-white p-3 text-sm text-[#6366F1]"><code>{`import { ${component.slug === "pricing-card" ? "PricingCard" : "DataGrid"} } from "@/components/ui";`}</code></pre>
      </div>
      <div className="rounded-3xl border border-[#E4E7EF] bg-[#F7F8FC] p-4">
        <h3 className="font-semibold">Used in</h3>
        <div className="mt-3 space-y-2">
          {component.usage.map((item) => (
            <div key={item.id} className="rounded-2xl bg-white p-3 text-sm">
              <strong>{item.projectName}</strong>
              <p className="text-xs text-[#6D7285]">{item.location}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AccessibilityContent() {
  return (
    <div className="space-y-3 text-sm leading-7 text-[#6D7285]">
      <p>Keyboard navigation, clear labels, visible focus styles and semantic HTML are expected for every saved component.</p>
      <p>Interactive states are represented in the preview so teams can review hover, loading, disabled and error behavior before reuse.</p>
    </div>
  );
}

function ChangelogContent({ component }: { component: VaultComponent }) {
  return (
    <div className="space-y-3">
      {[component.version, "v1.6.0", "v1.2.0"].map((version, index) => (
        <div key={version} className="rounded-3xl border border-[#E4E7EF] bg-[#F7F8FC] p-4">
          <p className="text-sm font-semibold">{version}</p>
          <p className="mt-1 text-sm text-[#6D7285]">{index === 0 ? "Improved responsive preview and property controls." : "Refined tokens and usage guidance."}</p>
        </div>
      ))}
    </div>
  );
}
