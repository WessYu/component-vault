"use client";

import { Expand, Grid2X2, Maximize2, Monitor, RefreshCcw, Smartphone, Tablet } from "lucide-react";
import { useMemo } from "react";
import { useSelectedComponent, useVaultStore } from "@/stores/vault-store";
import { cn } from "@/lib/utils";
import type { ComponentState, ComponentVariant } from "@/types/vault";

const states: ComponentState[] = ["Default", "Hover", "Focus", "Active", "Disabled", "Loading", "Error"];
const variants: ComponentVariant[] = ["Primary", "Secondary", "Ghost", "Danger", "Success"];

export function LivePreview() {
  const component = useSelectedComponent();
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
    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      :root { color-scheme: light; font-family: Inter, system-ui, sans-serif; }
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f4f0e5; color: #171813; }
      .stage { min-width: 220px; display: grid; place-items: center; padding: 30px; }
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
    </style>
  </head>
  <body>
    <div class="stage" data-state="${previewState}" data-variant="${previewVariant}">
      ${component.previewHtml.replace('class="cv-button"', `class="cv-button ${previewVariant.toLowerCase()}"`)}
    </div>
  </body>
</html>`;
  }, [component, previewState, previewVariant]);

  const widthClass = {
    Desktop: "w-[min(100%,720px)]",
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
        <select className="retro-panel-inset bg-surface-light px-2 py-1 font-tech text-xs" value={deviceMode === "Desktop" ? "1280 x 800" : deviceMode === "Tablet" ? "768 x 1024" : "390 x 844"} onChange={() => undefined} aria-label="Preview size">
          <option>1280 x 800</option>
          <option>768 x 1024</option>
          <option>390 x 844</option>
        </select>
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
        <div className={cn("mx-auto h-full min-h-[260px] transition-all", widthClass)} style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}>
          <iframe title={`${component.name} isolated preview`} sandbox="allow-scripts" srcDoc={srcDoc} className="retro-panel-inset h-full min-h-[260px] w-full bg-surface-light" />
        </div>
      </div>
    </div>
  );
}
