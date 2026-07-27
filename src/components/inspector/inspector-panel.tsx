"use client";

import { ChevronDown, ExternalLink, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelectedComponent, useVaultStore } from "@/stores/vault-store";
import type { ComponentState, ComponentVariant } from "@/types/vault";

const tabs = ["PROPS", "STATES", "TOKENS", "NOTES", "USAGE"] as const;
const variants: ComponentVariant[] = ["Primary", "Secondary", "Ghost", "Danger", "Success"];
const states: ComponentState[] = ["Default", "Hover", "Focus", "Active", "Disabled", "Loading", "Error"];

export function InspectorPanel({ focused = false, defaultTab, componentSlug }: { focused?: boolean; defaultTab?: (typeof tabs)[number]; componentSlug?: string }) {
  const selectedComponent = useSelectedComponent();
  const componentFromSlug = useVaultStore((state) => state.components.find((item) => item.slug === componentSlug));
  const component = componentFromSlug ?? selectedComponent;
  const inspectorTab = useVaultStore((state) => state.inspectorTab);
  const setInspectorTab = useVaultStore((state) => state.setInspectorTab);
  const previewVariant = useVaultStore((state) => state.previewVariant);
  const previewState = useVaultStore((state) => state.previewState);
  const setPreviewVariant = useVaultStore((state) => state.setPreviewVariant);
  const setPreviewState = useVaultStore((state) => state.setPreviewState);
  const tableSettings = useVaultStore((state) => state.tableSettings);
  const updateTableSettings = useVaultStore((state) => state.updateTableSettings);

  useEffect(() => {
    if (defaultTab) setInspectorTab(defaultTab);
  }, [defaultTab, setInspectorTab]);

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_1fr] bg-surface-light">
      <div className="flex overflow-x-auto border-b border-surface-dark bg-surface">
        {tabs.map((tab) => (
          <button
            key={tab}
            data-active={inspectorTab === tab}
            className="min-w-16 flex-1 border-r border-surface-dark px-2 py-2 font-tech text-[10px] font-bold data-[active=true]:bg-surface-light"
            onClick={() => setInspectorTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="min-h-0 overflow-y-auto p-3 thin-scrollbar">
        <div className="mb-4 border-b border-surface-dark pb-3">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-tech text-sm font-bold">{component.name}</h2>
              <p className="text-xs text-text-secondary">{component.version} · {component.category}</p>
            </div>
            <Star size={16} fill={component.isFavorite ? "#D68B31" : "none"} className="text-warning" aria-hidden />
          </div>
        </div>

        {inspectorTab === "PROPS" ? (
          <div className="space-y-2 text-sm">
            <InspectorSelect label="Variant" value={previewVariant} values={variants} onChange={(value) => setPreviewVariant(value as ComponentVariant)} />
            <InspectorSelect label="Size" value={component.props.size} values={["Small", "Medium", "Large"]} onChange={() => undefined} />
            {component.slug === "table-data-grid" ? (
              <>
                <InspectorGroup title="Table" defaultOpen>
                  <InspectorSelect label="Density" value={tableSettings.density} values={["Compact", "Comfortable"]} onChange={(value) => updateTableSettings({ density: value as "Compact" | "Comfortable", rowHeight: value === "Compact" ? 34 : 42 })} />
                  <Toggle label="Striped rows" checked={tableSettings.stripedRows} onChange={(checked) => updateTableSettings({ stripedRows: checked })} />
                  <Toggle label="Sticky header" checked={tableSettings.stickyHeader} onChange={(checked) => updateTableSettings({ stickyHeader: checked })} />
                  <Toggle label="Borders" checked={tableSettings.borders} onChange={(checked) => updateTableSettings({ borders: checked })} />
                </InspectorGroup>
                <InspectorGroup title="Data">
                  <Range label="Rows" min={1} max={5} value={tableSettings.rows} onChange={(rows) => updateTableSettings({ rows })} />
                  <Range label="Columns" min={2} max={4} value={tableSettings.columns} onChange={(columns) => updateTableSettings({ columns })} />
                  <Toggle label="Sortable" checked={tableSettings.sortable} onChange={(checked) => updateTableSettings({ sortable: checked })} />
                  <Toggle label="Pagination" checked={tableSettings.pagination} onChange={(checked) => updateTableSettings({ pagination: checked })} />
                </InspectorGroup>
                <InspectorGroup title="Style">
                  <Range label="Radius" min={0} max={12} value={tableSettings.radius} onChange={(radius) => updateTableSettings({ radius })} />
                  <Range label="Row height" min={30} max={54} value={tableSettings.rowHeight} onChange={(rowHeight) => updateTableSettings({ rowHeight })} />
                  <label className="grid grid-cols-[102px_1fr] items-center gap-2">
                    <span>Header bg</span>
                    <input className="retro-panel-inset h-8 bg-surface-light px-1" type="color" value={tableSettings.headerBackground} onChange={(event) => updateTableSettings({ headerBackground: event.target.value })} />
                  </label>
                </InspectorGroup>
              </>
            ) : (
              <InspectorGroup title="Component" defaultOpen>
                {[
                  ["Icon Left", component.props.iconLeft],
                  ["Icon Right", component.props.iconRight],
                  ["Full Width", component.props.fullWidth],
                ].map(([label, checked]) => (
                  <Toggle key={String(label)} label={String(label)} checked={Boolean(checked)} onChange={() => undefined} />
                ))}
              </InspectorGroup>
            )}
          </div>
        ) : null}

        {inspectorTab === "STATES" ? (
          <div className="space-y-2">
            <InspectorGroup title="State" defaultOpen>
              {states.map((state) => (
                <button key={state} data-active={previewState === state} className="flex w-full justify-between border-b border-surface-dark/40 px-2 py-2 text-left text-sm hover:bg-surface data-[active=true]:bg-navy data-[active=true]:text-surface-light" onClick={() => setPreviewState(state)}>
                  <span>{state}</span>
                  <span className="font-tech text-[10px]">{state === "Disabled" ? "Empty" : state}</span>
                </button>
              ))}
            </InspectorGroup>
          </div>
        ) : null}

        {inspectorTab === "NOTES" ? (
          <div className="space-y-4 text-sm leading-6">
            <section>
              <h3 className="font-tech text-xs font-bold uppercase">Description</h3>
              <p>{component.description}</p>
            </section>
            <section>
              <h3 className="font-tech text-xs font-bold uppercase">Usage Guidance</h3>
              <p>{component.notes}</p>
            </section>
            <section>
              <h3 className="font-tech text-xs font-bold uppercase">Accessibility</h3>
              <p>Keyboard focus is visible, labels are explicit, and preview states are isolated from the parent app.</p>
            </section>
          </div>
        ) : null}

        {inspectorTab === "TOKENS" ? (
          <div className="space-y-2">
            {component.tokens.map((token) => (
              <div key={token.id} className="retro-panel-inset flex items-center justify-between gap-3 bg-surface-light p-2 text-xs">
                <span className="font-tech">{token.name}</span>
                <span className="flex items-center gap-2">
                  {token.type === "color" ? <span className="size-4 border border-border-dark" style={{ background: token.value }} /> : null}
                  {token.value}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        {inspectorTab === "USAGE" ? (
          <div className="space-y-2">
            {component.usage.map((item) => (
              <a key={item.id} className="retro-panel-inset block bg-surface-light p-3 text-xs hover:bg-surface" href={item.url}>
                <div className="flex items-center justify-between gap-2">
                  <strong>{item.projectName}</strong>
                  <span className="flex items-center gap-1">
                    {item.count} uses <ExternalLink size={12} aria-hidden />
                  </span>
                </div>
                <p className="mt-1 truncate text-text-secondary">{item.location}</p>
              </a>
            ))}
          </div>
        ) : null}

        {focused ? <p className="mt-4 font-tech text-[10px] text-text-secondary">Inspector synced to {component.slug}.</p> : null}
      </div>
    </div>
  );
}

function InspectorGroup({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="retro-panel-inset bg-surface-light">
      <button className="flex w-full items-center justify-between px-2 py-2 font-tech text-[11px] font-bold uppercase" onClick={() => setOpen((value) => !value)}>
        {title}
        <ChevronDown size={13} className={open ? "" : "-rotate-90"} aria-hidden />
      </button>
      {open ? <div className="space-y-2 border-t border-surface-dark p-2">{children}</div> : null}
    </section>
  );
}

function InspectorSelect({ label, value, values, onChange }: { label: string; value: string; values: readonly string[]; onChange: (value: string) => void }) {
  return (
    <label className="grid grid-cols-[102px_1fr] items-center gap-2">
      <span>{label}</span>
      <select className="retro-panel-inset bg-surface-light px-2 py-1 text-xs" value={value} onChange={(event) => onChange(event.target.value)}>
        {values.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-2 text-sm">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

function Range({ label, min, max, value, onChange }: { label: string; min: number; max: number; value: number; onChange: (value: number) => void }) {
  return (
    <label className="grid grid-cols-[102px_1fr_32px] items-center gap-2 text-sm">
      <span>{label}</span>
      <input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <span className="font-tech text-[10px]">{value}</span>
    </label>
  );
}
