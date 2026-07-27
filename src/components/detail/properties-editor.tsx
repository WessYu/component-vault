"use client";

import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VaultComponent } from "@/types/vault";

export type TableOptions = {
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

export type PricingOptions = {
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

export function defaultTableOptions(): TableOptions {
  return {
    density: "Comfortable",
    stripedRows: true,
    bordered: true,
    stickyHeader: true,
    pagination: true,
    selectable: false,
    sortable: true,
    loading: false,
    empty: false,
    error: false,
  };
}

export function defaultPricingOptions(): PricingOptions {
  return {
    tier: "Pro",
    price: "29",
    billing: "/month",
    features: ["Unlimited projects", "Team collaboration", "Advanced analytics", "Priority support"],
    buttonLabel: "Start free trial",
    accent: "#6366F1",
    highlighted: true,
    loading: false,
    disabled: false,
  };
}

export function PropertiesEditor({
  component,
  tableOptions,
  setTableOptions,
  pricingOptions,
  setPricingOptions,
}: {
  component: VaultComponent;
  tableOptions: TableOptions;
  setTableOptions: (value: TableOptions) => void;
  pricingOptions: PricingOptions;
  setPricingOptions: (value: PricingOptions) => void;
}) {
  if (component.slug === "pricing-card") {
    return (
      <div className="space-y-4">
        <TextField label="tier" value={pricingOptions.tier} onChange={(tier) => setPricingOptions({ ...pricingOptions, tier })} />
        <TextField label="price" value={pricingOptions.price} onChange={(price) => setPricingOptions({ ...pricingOptions, price })} />
        <TextField label="billing period" value={pricingOptions.billing} onChange={(billing) => setPricingOptions({ ...pricingOptions, billing })} />
        <TextField label="button label" value={pricingOptions.buttonLabel} onChange={(buttonLabel) => setPricingOptions({ ...pricingOptions, buttonLabel })} />
        <label className="block">
          <span className="text-xs font-medium text-[#6D7285]">accent color</span>
          <input className="mt-2 h-10 w-full rounded-2xl border border-[#E4E7EF] bg-white px-2" type="color" value={pricingOptions.accent} onChange={(event) => setPricingOptions({ ...pricingOptions, accent: event.target.value })} />
        </label>
        <div className="space-y-2 rounded-3xl border border-[#E4E7EF] bg-[#F7F8FC] p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#6D7285]">features</span>
            <button
              className="grid size-7 place-items-center rounded-xl bg-white text-[#6366F1]"
              onClick={() => setPricingOptions({ ...pricingOptions, features: [...pricingOptions.features, "New capability"] })}
              aria-label="Add feature"
            >
              <Plus size={14} aria-hidden />
            </button>
          </div>
          {pricingOptions.features.map((feature, index) => (
            <div key={`${feature}-${index}`} className="flex items-center gap-2">
              <input
                className="h-9 min-w-0 flex-1 rounded-xl border border-[#E4E7EF] bg-white px-3 text-sm"
                value={feature}
                onChange={(event) => {
                  const features = [...pricingOptions.features];
                  features[index] = event.target.value;
                  setPricingOptions({ ...pricingOptions, features });
                }}
              />
              <button
                className="grid size-8 place-items-center rounded-xl text-[#9A9FB1] hover:bg-white"
                onClick={() => setPricingOptions({ ...pricingOptions, features: pricingOptions.features.filter((_, itemIndex) => itemIndex !== index) })}
                aria-label={`Remove ${feature}`}
              >
                <X size={14} aria-hidden />
              </button>
            </div>
          ))}
        </div>
        <Toggle label="highlighted" checked={pricingOptions.highlighted} onChange={(highlighted) => setPricingOptions({ ...pricingOptions, highlighted })} />
        <Toggle label="loading" checked={pricingOptions.loading} onChange={(loading) => setPricingOptions({ ...pricingOptions, loading })} />
        <Toggle label="disabled" checked={pricingOptions.disabled} onChange={(disabled) => setPricingOptions({ ...pricingOptions, disabled })} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SelectField label="density" value={tableOptions.density} values={["Compact", "Comfortable"]} onChange={(density) => setTableOptions({ ...tableOptions, density: density as TableOptions["density"] })} />
      <Toggle label="striped rows" checked={tableOptions.stripedRows} onChange={(stripedRows) => setTableOptions({ ...tableOptions, stripedRows })} />
      <Toggle label="bordered" checked={tableOptions.bordered} onChange={(bordered) => setTableOptions({ ...tableOptions, bordered })} />
      <Toggle label="sticky header" checked={tableOptions.stickyHeader} onChange={(stickyHeader) => setTableOptions({ ...tableOptions, stickyHeader })} />
      <Toggle label="pagination" checked={tableOptions.pagination} onChange={(pagination) => setTableOptions({ ...tableOptions, pagination })} />
      <Toggle label="selectable" checked={tableOptions.selectable} onChange={(selectable) => setTableOptions({ ...tableOptions, selectable })} />
      <Toggle label="sortable" checked={tableOptions.sortable} onChange={(sortable) => setTableOptions({ ...tableOptions, sortable })} />
      <div className="grid grid-cols-3 gap-2">
        <StateButton label="Loading" active={tableOptions.loading} onClick={() => setTableOptions({ ...tableOptions, loading: !tableOptions.loading, empty: false, error: false })} />
        <StateButton label="Empty" active={tableOptions.empty} onClick={() => setTableOptions({ ...tableOptions, empty: !tableOptions.empty, loading: false, error: false })} />
        <StateButton label="Error" active={tableOptions.error} onClick={() => setTableOptions({ ...tableOptions, error: !tableOptions.error, loading: false, empty: false })} />
      </div>
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-medium capitalize text-[#6D7285]">{label}</span>
      <input className="mt-2 h-10 w-full rounded-2xl border border-[#E4E7EF] bg-white px-3 text-sm outline-none focus:border-[#6366F1]" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SelectField({ label, value, values, onChange }: { label: string; value: string; values: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-medium capitalize text-[#6D7285]">{label}</span>
      <select className="mt-2 h-10 w-full rounded-2xl border border-[#E4E7EF] bg-white px-3 text-sm outline-none focus:border-[#6366F1]" value={value} onChange={(event) => onChange(event.target.value)}>
        {values.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex min-h-10 items-center justify-between gap-3 rounded-2xl border border-[#E4E7EF] bg-white px-3 text-sm capitalize">
      <span className="text-[#171A2B]">{label}</span>
      <input className="size-4 accent-[#6366F1]" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

function StateButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button className={cn("min-h-10 rounded-2xl border text-xs font-semibold", active ? "border-[#6366F1] bg-[#EEF0FF] text-[#6366F1]" : "border-[#E4E7EF] bg-white text-[#6D7285]")} onClick={onClick}>
      {label}
    </button>
  );
}
