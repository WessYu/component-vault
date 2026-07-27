"use client";

import { Expand, Grid2X2, Maximize2, Monitor, RefreshCcw, Smartphone, Tablet } from "lucide-react";
import { useMemo } from "react";
import { useSelectedComponent, useVaultStore } from "@/stores/vault-store";
import { cn } from "@/lib/utils";
import type { ComponentState, ComponentVariant } from "@/types/vault";

const states: ComponentState[] = ["Default", "Hover", "Focus", "Active", "Disabled", "Loading", "Error"];
const variants: ComponentVariant[] = ["Primary", "Secondary", "Ghost", "Danger", "Success"];

export function LivePreview({ focused = false, componentSlug }: { focused?: boolean; componentSlug?: string }) {
  const selectedComponent = useSelectedComponent();
  const componentFromSlug = useVaultStore((state) => state.components.find((item) => item.slug === componentSlug));
  const component = componentFromSlug ?? selectedComponent;
  const tableSettings = useVaultStore((state) => state.tableSettings);
  const gridEnabled = useVaultStore((state) => state.gridEnabled);
  const guidesEnabled = useVaultStore((state) => state.guidesEnabled);
  const deviceMode = useVaultStore((state) => state.deviceMode);
  const zoom = useVaultStore((state) => state.zoom);
  const previewState = useVaultStore((state) => state.previewState);
  const previewVariant = useVaultStore((state) => state.previewVariant);
  const setGridEnabled = useVaultStore((state) => state.setGridEnabled);
  const setGuidesEnabled = useVaultStore((state) => state.setGuidesEnabled);
  const setDeviceMode = useVaultStore((state) => state.setDeviceMode);
  const setZoom = useVaultStore((state) => state.setZoom);
  const setPreviewState = useVaultStore((state) => state.setPreviewState);
  const setPreviewVariant = useVaultStore((state) => state.setPreviewVariant);
  const addLog = useVaultStore((state) => state.addLog);

  const srcDoc = useMemo(() => {
    const previewMarkup =
      component.slug === "table-data-grid"
        ? createTablePreviewMarkup(previewState, tableSettings)
        : component.previewHtml.replace('class="cv-button"', `class="cv-button ${previewVariant.toLowerCase()}"`);

    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      :root { color-scheme: light; font-family: Inter, system-ui, sans-serif; }
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f4f0e5; color: #171813; }
      .stage { width: 100%; min-width: 220px; display: grid; place-items: center; padding: ${focused ? "42px" : "30px"}; }
      ${component.styles}
      .cv-button.secondary { background: #ded9cb; color: #171813; }
      .cv-button.ghost { background: transparent; color: #243f5e; }
      .cv-button.danger { background: #a84034; color: #fff; }
      .cv-button.success { background: #7fa16a; color: #10170e; }
      .is-disabled, [data-state="Disabled"] { opacity: .55; filter: grayscale(.3); pointer-events: none; }
      [data-state="Hover"] { transform: translateY(-1px); }
      [data-state="Focus"] { outline: 3px solid #de572f; outline-offset: 3px; }
      [data-state="Active"] { transform: translate(1px, 1px); }
      [data-state="Loading"]::after { content: "  ..."; }
      [data-state="Error"] { outline: 2px solid #a84034; }
      svg { width: 100%; height: 34px; fill: none; stroke: #243f5e; stroke-width: 2; }
      .cv-table-shell { width: min(760px, 94vw); background: #ece8dc; border: ${tableSettings.borders ? "1px solid #918b7b" : "0"}; border-radius: ${tableSettings.radius}px; overflow: hidden; box-shadow: 2px 2px 0 rgba(62, 59, 52, .22); }
      .cv-table-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 10px 12px; border-bottom: 1px solid #b8b0a0; background: #ded9cb; font-size: 12px; }
      .cv-table { width: 100%; border-collapse: collapse; font-size: 12px; }
      .cv-table th { position: ${tableSettings.stickyHeader ? "sticky" : "static"}; top: 0; background: ${tableSettings.headerBackground}; }
      .cv-table th, .cv-table td { padding: 0 12px; height: ${tableSettings.rowHeight}px; border-bottom: ${tableSettings.borders ? "1px solid #c9c4b5" : "0"}; text-align: left; }
      .cv-table.striped tbody tr:nth-child(even) { background: rgba(201, 196, 181, .42); }
      .status { display: inline-block; border: 1px solid #918b7b; padding: 2px 7px; font-size: 11px; }
      .status.active { background: #dfead7; color: #314421; }
      .status.pending { background: #fff4da; color: #5a3608; }
      .status.error { background: #f2d4d0; color: #7c2018; }
      .cv-pagination { display: flex; justify-content: flex-end; gap: 8px; padding: 10px 12px; border-top: 1px solid #b8b0a0; background: #ded9cb; font-size: 12px; }
      .placeholder { display: grid; min-height: 220px; place-items: center; color: #555549; }
    </style>
  </head>
  <body>
    <div class="stage" data-state="${previewState}" data-variant="${previewVariant}">
      ${previewMarkup}
    </div>
  </body>
</html>`;
  }, [component, focused, previewState, previewVariant, tableSettings]);

  const widthClass = {
    Desktop: focused ? "w-[min(100%,920px)]" : "w-[min(100%,720px)]",
    Tablet: "w-[520px]",
    Mobile: "w-[310px]",
  }[deviceMode];

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_auto_1fr] bg-surface-light">
      <div className="flex flex-wrap items-center gap-2 border-b border-surface-dark p-2">
        {([
          ["Desktop", Monitor],
          ["Tablet", Tablet],
          ["Mobile", Smartphone],
        ] as const).map(([label, Icon]) => (
          <button key={label} className="pressable grid size-8 place-items-center bg-surface" data-active={deviceMode === label} aria-label={`${label} preview`} onClick={() => setDeviceMode(label)}>
            <Icon size={15} aria-hidden />
          </button>
        ))}
        <label className="flex items-center gap-1 font-tech text-[10px] uppercase">
          Width
          <select className="retro-panel-inset bg-surface-light px-2 py-1 font-tech text-xs" value={deviceMode === "Desktop" ? "1280" : deviceMode === "Tablet" ? "768" : "390"} onChange={() => undefined} aria-label="Preview width">
            <option>1280</option>
            <option>768</option>
            <option>390</option>
          </select>
        </label>
        <label className="flex items-center gap-1 font-tech text-[10px] uppercase">
          Height
          <select className="retro-panel-inset bg-surface-light px-2 py-1 font-tech text-xs" value={deviceMode === "Desktop" ? "800" : deviceMode === "Tablet" ? "1024" : "844"} onChange={() => undefined} aria-label="Preview height">
            <option>800</option>
            <option>1024</option>
            <option>844</option>
          </select>
        </label>
        <div className="ml-auto flex gap-1">
          <button className="pressable grid size-8 place-items-center bg-surface" aria-label="Refresh preview" onClick={() => addLog("Preview compiled.")}>
            <RefreshCcw size={15} aria-hidden />
          </button>
          <button className="pressable grid size-8 place-items-center bg-surface" aria-label="Toggle grid" data-active={gridEnabled} onClick={() => setGridEnabled(!gridEnabled)}>
            <Grid2X2 size={15} aria-hidden />
          </button>
          <button className="pressable grid size-8 place-items-center bg-surface" aria-label="Toggle guides" data-active={guidesEnabled} onClick={() => setGuidesEnabled(!guidesEnabled)}>
            <Expand size={15} aria-hidden />
          </button>
          <select className="retro-panel-inset bg-surface-light px-2 py-1 font-tech text-xs" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} aria-label="Preview zoom">
            {[75, 100, 125].map((value) => (
              <option key={value} value={value}>
                {value}%
              </option>
            ))}
          </select>
          <button className="pressable grid size-8 place-items-center bg-surface" aria-label="Fullscreen preview">
            <Maximize2 size={15} aria-hidden />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-surface-dark bg-surface px-2 py-1">
        <select className="retro-panel-inset bg-surface-light px-2 py-1 text-xs" defaultValue="Light" aria-label="Theme">
          <option>Light</option>
          <option>Workstation</option>
        </select>
        <select className="retro-panel-inset bg-surface-light px-2 py-1 text-xs" value={previewVariant} onChange={(event) => setPreviewVariant(event.target.value as ComponentVariant)} aria-label="Variant">
          {variants.map((variant) => (
            <option key={variant}>{variant}</option>
          ))}
        </select>
        <select className="retro-panel-inset bg-surface-light px-2 py-1 text-xs" value={previewState} onChange={(event) => setPreviewState(event.target.value as ComponentState)} aria-label="State">
          {states.map((state) => (
            <option key={state}>{state}</option>
          ))}
        </select>
        <span className="font-tech text-[10px] text-text-secondary">Sandboxed iframe · {component.framework} · {component.version}</span>
      </div>

      <div className={cn("relative min-h-0 overflow-auto bg-background p-5", gridEnabled && "dot-grid")}>
        {guidesEnabled ? (
          <>
            <span className="absolute left-1/2 top-0 h-full border-l border-orange/50" />
            <span className="absolute left-0 top-1/2 w-full border-t border-orange/50" />
            <span className="absolute left-8 top-20 bg-orange px-1 font-tech text-[10px] text-surface-light">48px</span>
            <span className="absolute left-1/2 top-8 bg-orange px-1 font-tech text-[10px] text-surface-light">50%</span>
          </>
        ) : null}
        <div className={cn("mx-auto h-full transition-all", focused ? "min-h-[420px]" : "min-h-[260px]", widthClass)} style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}>
          <iframe title={`${component.name} isolated preview`} sandbox="allow-scripts" srcDoc={srcDoc} className={cn("retro-panel-inset h-full w-full bg-surface-light", focused ? "min-h-[420px]" : "min-h-[260px]")} />
        </div>
      </div>
    </div>
  );
}

function createTablePreviewMarkup(
  state: ComponentState,
  settings: ReturnType<typeof useVaultStore.getState>["tableSettings"],
) {
  if (state === "Loading") {
    return '<div class="cv-table-shell"><div class="cv-table-toolbar"><strong>Customers</strong><span>Loading rows...</span></div><div class="placeholder">Loading table data...</div></div>';
  }

  if (state === "Error") {
    return '<div class="cv-table-shell"><div class="cv-table-toolbar"><strong>Customers</strong><span class="status error">Error</span></div><div class="placeholder">Build error detected while loading rows.</div></div>';
  }

  if (state === "Disabled") {
    return '<div class="cv-table-shell"><div class="cv-table-toolbar"><strong>Customers</strong><span>Empty</span></div><div class="placeholder">No customer records found.</div></div>';
  }

  if (state === "Active" || state === "Hover" || state === "Focus") {
    return `<div class="cv-table-shell" data-state="${state}">
      <div class="cv-table-toolbar"><strong>Customer Revenue</strong><span class="status active">${state}</span></div>
      <table class="cv-table striped"><thead><tr><th>Customer ↑</th><th>Status</th><th>Value</th><th>Change</th></tr></thead>
      <tbody><tr><td>Acme Corporation</td><td><span class="status active">Active</span></td><td>$12,430</td><td>+8.2%</td></tr></tbody></table>
    </div>`;
  }

  const rows = [
    ["Acme Corporation", "Active", "$12,430", "+8.2%"],
    ["Globex Inc.", "Pending", "$8,210", "-2.1%"],
    ["Soylent Corp.", "Active", "$4,140", "+1.4%"],
    ["Initech", "Active", "$18,900", "+6.8%"],
    ["Umbrella Lab", "Pending", "$7,760", "+0.9%"],
  ].slice(0, settings.rows);

  const columns = ["Customer", "Status", "Value", "Change"].slice(0, settings.columns);
  return `<div class="cv-table-shell">
    <div class="cv-table-toolbar"><strong>Customer Revenue</strong><span>${settings.sortable ? "Sorted by value" : "Static rows"}</span></div>
    <table class="cv-table ${settings.stripedRows ? "striped" : ""}">
      <thead><tr>${columns.map((column) => `<th>${column}${settings.sortable ? " ↑" : ""}</th>`).join("")}</tr></thead>
      <tbody>${rows
        .map((row) => `<tr>${row.slice(0, settings.columns).map((cell, index) => `<td>${index === 1 ? `<span class="status ${cell.toLowerCase()}">${cell}</span>` : cell}</td>`).join("")}</tr>`)
        .join("")}</tbody>
    </table>
    ${settings.pagination ? '<div class="cv-pagination"><span>Page 1 of 4</span><button>Prev</button><button>Next</button></div>' : ""}
  </div>`;
}
