"use client";

import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { EmergingTrendPreview } from "@/components/trends/emerging-trend-preview";
import { categoryStyle } from "@/components/library/category-style";
import { ExperiencePreview } from "@/components/experiences/shared/experience-shell";
import { getExperience, type ExperienceSlug } from "@/components/experiences/experience-data";
import { cn } from "@/lib/utils";
import type { VaultComponent } from "@/types/vault";

type PreviewProps = {
  component: VaultComponent;
  compact?: boolean;
  viewport?: "Desktop" | "Tablet" | "Mobile";
  variant?: string;
  theme?: "Light" | "Dark";
  tableOptions?: {
    density: "Compact" | "Comfortable";
    stripedRows: boolean;
    bordered: boolean;
    stickyHeader: boolean;
    pagination: boolean;
    selectable: boolean;
    sortable: boolean;
    loading: boolean;
    empty: boolean;
    error: boolean;
  };
  pricingOptions?: {
    tier: string;
    price: string;
    billing: string;
    features: string[];
    buttonLabel: string;
    accent: string;
    highlighted: boolean;
    loading: boolean;
    disabled: boolean;
  };
};

export function ComponentPreview({ component, compact = false, viewport = "Desktop", theme = "Light", tableOptions, pricingOptions }: PreviewProps) {
  const style = categoryStyle(component);
  const width = viewport === "Mobile" ? "max-w-[310px]" : viewport === "Tablet" ? "max-w-[560px]" : "max-w-[900px]";
  const isEmergingTrend = component.tags.includes("2026-trend") || component.slug.startsWith("trend-");

  return (
    <motion.div
      layout
      className={cn(
        "relative grid min-h-[220px] place-items-center overflow-hidden rounded-[28px] border p-5",
        compact ? "min-h-[170px]" : "min-h-[430px]",
        theme === "Dark" ? "border-[#25283A] bg-[#171A2B]" : "border-[#E4E7EF] bg-white",
      )}
      style={{
        background: theme === "Dark"
          ? `radial-gradient(circle at 20% 20%, ${style.accent}33, transparent 30%), #171A2B`
          : `radial-gradient(circle at 22px 22px, ${style.accent}22 1.5px, transparent 1.5px), linear-gradient(135deg, ${style.soft}, #fff)`,
        backgroundSize: theme === "Dark" ? "auto" : "22px 22px, auto",
      }}
    >
      <div className={cn("w-full transition-all duration-200", width)}>
        {isEmergingTrend ? (
          <EmergingTrendPreview slug={component.slug} />
        ) : component.slug === "table-data-grid" ? (
          <DataTablePreview compact={compact} options={tableOptions} />
        ) : component.category === "Motion Experiences" && getExperience(component.slug) ? (
          <ExperiencePreview slug={component.slug as ExperienceSlug} />
        ) : component.slug === "pricing-card" ? (
          <PricingPreview compact={compact} options={pricingOptions} />
        ) : component.slug === "card-stats" ? (
          <AnalyticsPreview />
        ) : component.slug === "profile-compact" ? (
          <ProfilePreview />
        ) : component.slug === "navbar-floating" ? (
          <NavigationPreview />
        ) : component.slug === "input-text-field" ? (
          <FormPreview />
        ) : component.slug === "button-primary" ? (
          <ButtonPreview />
        ) : (
          <div className="mx-auto max-w-sm rounded-2xl border border-[#E4E7EF] bg-white p-5 shadow-xl shadow-[#171A2B]/8" dangerouslySetInnerHTML={{ __html: component.previewHtml }} />
        )}
      </div>
    </motion.div>
  );
}

function PricingPreview({ compact, options }: { compact?: boolean; options?: PreviewProps["pricingOptions"] }) {
  const tier = options?.tier ?? "Pro";
  const price = options?.price ?? "29";
  const billing = options?.billing ?? "/month";
  const buttonLabel = options?.buttonLabel ?? "Start free trial";
  const accent = options?.accent ?? "#6366F1";
  const features = options?.features?.length ? options.features : ["Unlimited projects", "Team collaboration", "Advanced analytics", "Priority support"];

  return (
    <motion.article
      className={cn("mx-auto rounded-3xl border bg-white p-6 shadow-2xl shadow-[#171A2B]/10", compact ? "max-w-[220px] p-4" : "max-w-[300px]", options?.highlighted ? "border-[#6366F1]" : "border-[#E4E7EF]")}
      whileHover={{ y: -3 }}
    >
      <div className="text-sm font-semibold text-[#171A2B]">{tier}</div>
      <div className="mt-4 flex items-end gap-1"><span className={cn("font-bold tracking-[-0.03em]", compact ? "text-3xl" : "text-4xl")}>${price}</span><span className="pb-1 text-sm text-[#6D7285]">{billing}</span></div>
      <ul className="mt-5 space-y-3">
        {features.map((feature) => <li key={feature} className="flex items-center gap-2 text-xs font-medium text-[#4B5165]"><span className="grid size-4 place-items-center rounded-full text-white" style={{ background: accent }}><Check size={10} aria-hidden /></span>{feature}</li>)}
      </ul>
      <button className="mt-6 min-h-10 w-full rounded-xl text-sm font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60" style={{ background: options?.disabled ? "#9A9FB1" : "#171A2B" }} disabled={options?.disabled}>
        {options?.loading ? <Loader2 className="mx-auto animate-spin" size={16} aria-hidden /> : buttonLabel}
      </button>
    </motion.article>
  );
}

function DataTablePreview({ compact, options }: { compact?: boolean; options?: PreviewProps["tableOptions"] }) {
  const rows = [["Acme Corp", "Active", "Enterprise", "$24,800"], ["Northstar", "Trial", "Team", "$4,200"], ["Luma Systems", "Active", "Scale", "$18,450"], ["Orbit", "Paused", "Pro", "$7,920"]];
  const rowPadding = options?.density === "Compact" || compact ? "py-2" : "py-3";
  if (options?.error) return <div className="rounded-2xl border border-red-200 bg-white p-8 text-center text-sm font-medium text-red-600">Unable to load table data.</div>;
  if (options?.empty) return <div className="rounded-2xl border border-[#E4E7EF] bg-white p-8 text-center text-sm text-[#6D7285]">No customers match this view.</div>;
  return (
    <div className={cn("overflow-hidden rounded-2xl bg-white shadow-xl shadow-[#171A2B]/8", options?.bordered !== false && "border border-[#E4E7EF]")}>
      <div className="flex items-center justify-between border-b border-[#E4E7EF] px-4 py-3"><div><p className="text-sm font-semibold">Customers</p>{!compact ? <p className="text-xs text-[#9A9FB1]">Revenue and renewal overview</p> : null}</div><span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">Live</span></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left text-xs"><thead className={cn("text-[#6D7285]", options?.stickyHeader && "sticky top-0 bg-white")}><tr>{["Customer", "Status", "Plan", "Spend"].map((heading) => <th key={heading} className="border-b border-[#EEF0F6] px-4 py-3 font-medium">{heading}{options?.sortable && heading === "Spend" ? " ↓" : ""}</th>)}</tr></thead><tbody>{options?.loading ? Array.from({ length: 3 }).map((_, row) => <tr key={row}>{Array.from({ length: 4 }).map((__, cell) => <td key={cell} className="px-4 py-3"><span className="block h-3 animate-pulse rounded-full bg-[#EEF0F6]" /></td>)}</tr>) : rows.slice(0, compact ? 3 : 4).map((row, index) => <tr key={row[0]} className={cn(options?.stripedRows && index % 2 === 1 && "bg-[#F7F8FC]")}><td className={cn("border-b border-[#EEF0F6] px-4 font-medium text-[#171A2B]", rowPadding)}><span className="inline-flex items-center gap-2">{options?.selectable ? <input type="checkbox" aria-label={`Select ${row[0]}`} /> : null}{row[0]}</span></td><td className={cn("border-b border-[#EEF0F6] px-4", rowPadding)}><StatusPill status={row[1]} /></td><td className={cn("border-b border-[#EEF0F6] px-4 text-[#6D7285]", rowPadding)}>{row[2]}</td><td className={cn("border-b border-[#EEF0F6] px-4 font-semibold", rowPadding)}>{row[3]}</td></tr>)}</tbody></table></div>
      {options?.pagination !== false && !compact ? <div className="flex items-center justify-between px-4 py-3 text-xs text-[#6D7285]"><span>1-4 of 42</span><span>Next →</span></div> : null}
    </div>
  );
}

function AnalyticsPreview() {
  return <div className="rounded-3xl border border-[#E4E7EF] bg-white p-5 shadow-xl shadow-[#171A2B]/8"><div className="flex items-start justify-between"><div><p className="text-xs text-[#6D7285]">Total Revenue</p><strong className="mt-1 block text-2xl">$45,231.89</strong><span className="text-xs font-medium text-emerald-600">+12.5% vs last month</span></div><span className="rounded-full bg-[#EEF0FF] px-2 py-1 text-xs text-[#6366F1]">Live</span></div><svg viewBox="0 0 240 80" className="mt-4 h-24 w-full overflow-visible"><path d="M4 70 C30 18 58 72 86 38 S136 60 164 24 S210 46 236 12" fill="none" stroke="#6366F1" strokeWidth="4" strokeLinecap="round" /><path d="M4 70 C30 18 58 72 86 38 S136 60 164 24 S210 46 236 12 L236 80 L4 80 Z" fill="url(#chartFill)" opacity=".28" /><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#6366F1" /><stop offset="1" stopColor="#6366F1" stopOpacity="0" /></linearGradient></defs></svg></div>;
}
function ProfilePreview() { return <div className="mx-auto max-w-[240px] overflow-hidden rounded-3xl border border-[#E4E7EF] bg-white shadow-xl shadow-[#171A2B]/8"><div className="h-20 bg-gradient-to-br from-[#6366F1] to-[#E978D4]" /><div className="-mt-9 p-5 text-center"><span className="mx-auto grid size-18 place-items-center rounded-full border-4 border-white bg-gradient-to-br from-[#F1BE48] to-[#FF7664] text-lg font-bold text-white">OR</span><h3 className="mt-3 font-semibold">Olivia Rhye</h3><p className="text-xs text-[#6D7285]">Product Designer</p><div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs"><strong>128</strong><strong>2.4k</strong><strong>342</strong></div></div></div>; }
function NavigationPreview() { return <div className="rounded-2xl bg-[#111827] p-4 shadow-xl shadow-[#171A2B]/10"><nav className="flex items-center gap-5 text-xs text-white/72"><span className="flex items-center gap-2 font-semibold text-white"><span className="size-5 rounded bg-[#9A78FF]" /> Dashboard</span><span>Projects</span><span>Team</span><span>Reports</span><span className="ml-auto size-7 rounded-full bg-gradient-to-br from-[#F1BE48] to-[#FF7664]" /></nav></div>; }
function FormPreview() { return <div className="rounded-2xl border border-[#E4E7EF] bg-white p-5 shadow-xl shadow-[#171A2B]/8"><label className="block text-xs font-medium text-[#6D7285]">Email address</label><input className="mt-2 h-11 w-full rounded-xl border border-[#D4D8E3] px-3 text-sm outline-none focus:border-[#6366F1]" defaultValue="olivia@untitled.co" /><label className="mt-4 block text-xs font-medium text-[#6D7285]">Password</label><input className="mt-2 h-11 w-full rounded-xl border border-[#D4D8E3] px-3 text-sm outline-none focus:border-[#6366F1]" defaultValue="••••••••••" /></div>; }
function ButtonPreview() { return <div className="flex flex-wrap justify-center gap-3"><button className="min-h-10 rounded-xl bg-[#6366F1] px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200">Primary</button><button className="min-h-10 rounded-xl border border-[#D4D8E3] bg-white px-4 text-sm font-semibold text-[#6366F1]">Secondary</button><button className="min-h-10 rounded-xl px-4 text-sm font-semibold text-[#6D7285]">Tertiary</button></div>; }
function StatusPill({ status }: { status: string }) {
  const tone = { Active: "bg-emerald-50 text-emerald-700", Trial: "bg-blue-50 text-blue-700", Paused: "bg-amber-50 text-amber-700" }[status] ?? "bg-slate-50 text-slate-700";
  return <span className={cn("rounded-full px-2 py-1 text-[11px] font-medium", tone)}>{status}</span>;
}
