"use client";

import { ExternalLink, Loader2, Star } from "lucide-react";
import { useSelectedComponent, useVaultStore } from "@/stores/vault-store";
import type { ComponentState, ComponentVariant } from "@/types/vault";

const tabs = ["PROPS", "NOTES", "TOKENS", "USAGE"] as const;
const variants: ComponentVariant[] = ["Primary", "Secondary", "Ghost", "Danger", "Success"];
const states: ComponentState[] = ["Default", "Hover", "Focus", "Active", "Disabled", "Loading", "Error"];

export function InspectorPanel() {
  const component = useSelectedComponent();
  const inspectorTab = useVaultStore((state) => state.inspectorTab);
  const setInspectorTab = useVaultStore((state) => state.setInspectorTab);
  const previewVariant = useVaultStore((state) => state.previewVariant);
  const previewState = useVaultStore((state) => state.previewState);
  const setPreviewVariant = useVaultStore((state) => state.setPreviewVariant);
  const setPreviewState = useVaultStore((state) => state.setPreviewState);

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_1fr] bg-surface-light">
      <div className="flex border-b border-surface-dark bg-surface">
        {tabs.map((tab) => (
          <button
            key={tab}
            data-active={inspectorTab === tab}
            className="flex-1 border-r border-surface-dark px-2 py-2 font-tech text-[10px] font-bold data-[active=true]:bg-surface-light"
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
          <div className="space-y-3 text-sm">
            <InspectorSelect label="Variant" value={previewVariant} values={variants} onChange={(value) => setPreviewVariant(value as ComponentVariant)} />
            <InspectorSelect label="State" value={previewState} values={states} onChange={(value) => setPreviewState(value as ComponentState)} />
            <InspectorSelect label="Size" value={component.props.size} values={["Small", "Medium", "Large"]} onChange={() => undefined} />
            {[
              ["Icon Left", component.props.iconLeft],
              ["Icon Right", component.props.iconRight],
              ["Full Width", component.props.fullWidth],
              ["Disabled", previewState === "Disabled"],
              ["Loading", previewState === "Loading"],
            ].map(([label, checked]) => (
              <label key={String(label)} className="flex items-center justify-between border-b border-surface-dark/40 pb-2">
                <span>{label}</span>
                <input type="checkbox" checked={Boolean(checked)} onChange={() => label === "Disabled" ? setPreviewState("Disabled") : label === "Loading" ? setPreviewState("Loading") : undefined} />
              </label>
            ))}
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
              <p>Keyboard focus is visible, labels are explicit, and the preview state can be tested without executing untrusted app code in the parent context.</p>
            </section>
            <section>
              <h3 className="font-tech text-xs font-bold uppercase">Limitations</h3>
              <p>Demo data is local until Supabase credentials and migrations are applied.</p>
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

        <div className="mt-4 retro-panel-inset flex items-center gap-2 bg-terminal p-2 font-tech text-xs text-green">
          <Loader2 size={13} aria-hidden />
          Inspector synced with preview.
        </div>
      </div>
    </div>
  );
}

function InspectorSelect({ label, value, values, onChange }: { label: string; value: string; values: readonly string[]; onChange: (value: string) => void }) {
  return (
    <label className="grid grid-cols-[92px_1fr] items-center gap-2">
      <span>{label}</span>
      <select className="retro-panel-inset bg-surface-light px-2 py-1 text-xs" value={value} onChange={(event) => onChange(event.target.value)}>
        {values.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </label>
  );
}
