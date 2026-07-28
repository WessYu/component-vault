"use client";

import { Bell, Check, Loader2, LockKeyhole, MonitorSmartphone, RotateCcw, Save, ShieldCheck, SlidersHorizontal, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  getWorkspacePreferences,
  saveWorkspacePreferences,
  type WorkspacePreferences,
} from "@/services/vault-service";

const defaults: WorkspacePreferences = {
  gridSize: 8,
  defaultViewport: "Desktop",
  autosaveDebounce: 900,
  previewTheme: "Light",
  componentReviewRequests: true,
  tokenDriftAlerts: true,
  weeklyUsageDigest: false,
};

export function SettingsView() {
  const [preferences, setPreferences] = useState<WorkspacePreferences>(defaults);
  const [savedPreferences, setSavedPreferences] = useState<WorkspacePreferences>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const dirty = useMemo(() => JSON.stringify(preferences) !== JSON.stringify(savedPreferences), [preferences, savedPreferences]);

  useEffect(() => {
    let active = true;
    void getWorkspacePreferences()
      .then((next) => {
        if (!active) return;
        setPreferences(next);
        setSavedPreferences(next);
        document.documentElement.style.setProperty("--vault-grid-size", `${next.gridSize * 6}px`);
      })
      .catch((error) => {
        if (active) setMessage(error instanceof Error ? error.message : "Unable to load settings.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function patch<K extends keyof WorkspacePreferences>(key: K, value: WorkspacePreferences[K]) {
    setPreferences((current) => ({ ...current, [key]: value }));
    setMessage(null);
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const saved = await saveWorkspacePreferences(preferences);
      setPreferences(saved);
      setSavedPreferences(saved);
      document.documentElement.style.setProperty("--vault-grid-size", `${saved.gridSize * 6}px`);
      setMessage("Preferences saved to your account.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setPreferences(defaults);
    setMessage("Defaults restored locally. Save to apply them to your account.");
  }

  return (
    <AppShell active="Settings">
      <section className="px-4 py-6 md:px-7">
        <div className="mx-auto max-w-[1460px]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-[#E4E7EF] bg-white px-3 py-1 text-sm font-medium text-[#6366F1] shadow-sm">
                <SlidersHorizontal size={15} aria-hidden /> Workspace preferences
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-[#171A2B] md:text-5xl">Settings</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[#6D7285]">Configure defaults and notifications. These settings are saved to the signed-in Convex account.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={reset} disabled={loading || saving} className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-[#E4E7EF] bg-white px-4 text-sm font-semibold text-[#6D7285] shadow-sm disabled:opacity-50">
                <RotateCcw size={16} aria-hidden /> Reset
              </button>
              <button onClick={() => void save()} disabled={loading || saving || !dirty} className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[#6366F1] px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 disabled:cursor-not-allowed disabled:opacity-45">
                {saving ? <Loader2 className="animate-spin" size={16} aria-hidden /> : <Save size={16} aria-hidden />}
                {saving ? "Saving..." : dirty ? "Save changes" : "Saved"}
              </button>
            </div>
          </div>

          {message ? <div className="mt-5 rounded-2xl border border-[#E4E7EF] bg-white px-4 py-3 text-sm text-[#6D7285] shadow-sm">{message}</div> : null}

          <div className="mt-8 grid gap-5 xl:grid-cols-[1fr_380px]">
            <div className="space-y-5">
              <section className="rounded-[30px] border border-[#E4E7EF] bg-white p-5 shadow-[0_18px_70px_rgba(23,26,43,0.045)]">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-[#EEF0FF] text-[#6366F1]"><MonitorSmartphone size={20} aria-hidden /></span>
                  <div><h2 className="text-lg font-bold tracking-[-0.02em] text-[#171A2B]">Preview defaults</h2><p className="text-sm text-[#9A9FB1]">Used whenever a component preview is opened.</p></div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-[#171A2B]">Grid size</span>
                    <div className="flex items-center gap-3 rounded-2xl border border-[#E4E7EF] bg-[#F7F8FC] px-4">
                      <input className="h-12 min-w-0 flex-1 accent-[#6366F1]" type="range" min="2" max="16" step="2" value={preferences.gridSize} disabled={loading} onChange={(event) => patch("gridSize", Number(event.target.value))} />
                      <span className="w-10 text-right font-mono text-sm text-[#171A2B]">{preferences.gridSize}px</span>
                    </div>
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-[#171A2B]">Default viewport</span>
                    <select className="min-h-12 rounded-2xl border border-[#E4E7EF] bg-[#F7F8FC] px-4 text-sm outline-none focus:border-[#6366F1]" value={preferences.defaultViewport} disabled={loading} onChange={(event) => patch("defaultViewport", event.target.value as WorkspacePreferences["defaultViewport"])}>
                      <option>Desktop</option><option>Tablet</option><option>Mobile</option>
                    </select>
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-[#171A2B]">Autosave delay</span>
                    <select className="min-h-12 rounded-2xl border border-[#E4E7EF] bg-[#F7F8FC] px-4 text-sm outline-none focus:border-[#6366F1]" value={preferences.autosaveDebounce} disabled={loading} onChange={(event) => patch("autosaveDebounce", Number(event.target.value))}>
                      <option value={300}>300 ms</option><option value={600}>600 ms</option><option value={900}>900 ms</option><option value={1500}>1.5 s</option><option value={2500}>2.5 s</option>
                    </select>
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-[#171A2B]">Preview theme</span>
                    <select className="min-h-12 rounded-2xl border border-[#E4E7EF] bg-[#F7F8FC] px-4 text-sm outline-none focus:border-[#6366F1]" value={preferences.previewTheme} disabled={loading} onChange={(event) => patch("previewTheme", event.target.value as WorkspacePreferences["previewTheme"])}>
                      <option>Light</option><option>Dark</option>
                    </select>
                  </label>
                </div>
              </section>

              <section className="rounded-[30px] border border-[#E4E7EF] bg-white p-5 shadow-[0_18px_70px_rgba(23,26,43,0.045)]">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-[#EAFBF4] text-emerald-600"><Bell size={20} aria-hidden /></span>
                  <div><h2 className="text-lg font-bold tracking-[-0.02em] text-[#171A2B]">Notifications</h2><p className="text-sm text-[#9A9FB1]">Choose which workspace activity should surface as an update.</p></div>
                </div>

                <div className="mt-5 space-y-3">
                  {([
                    ["Component review requests", "componentReviewRequests"],
                    ["Token drift alerts", "tokenDriftAlerts"],
                    ["Weekly usage digest", "weeklyUsageDigest"],
                  ] as const).map(([label, key]) => (
                    <label key={key} className="flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[#E4E7EF] bg-[#F7F8FC] px-4">
                      <span className="text-sm font-medium text-[#171A2B]">{label}</span>
                      <button type="button" role="switch" aria-checked={preferences[key]} disabled={loading} onClick={() => patch(key, !preferences[key])} className={`relative h-7 w-12 rounded-full transition-colors ${preferences[key] ? "bg-[#6366F1]" : "bg-[#D9DDE8]"}`}>
                        <span className={`absolute top-1 size-5 rounded-full bg-white shadow-sm transition-transform ${preferences[key] ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                    </label>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-5">
              <section className="rounded-[30px] border border-[#E4E7EF] bg-white p-5 shadow-[0_18px_70px_rgba(23,26,43,0.045)]">
                <div className="rounded-[26px] bg-[#171A2B] p-5 text-white">
                  <ShieldCheck size={24} aria-hidden />
                  <h2 className="mt-5 text-2xl font-bold tracking-[-0.03em]">Security</h2>
                  <p className="mt-2 text-sm leading-6 text-white/75">Authentication and account preferences are backed by the connected Convex deployment.</p>
                </div>
                <div className="mt-5 space-y-3">
                  {[["Authentication", "Convex account"], ["Session cookie", "httpOnly"], ["Preferences", "Per account"]].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between rounded-2xl bg-[#F7F8FC] px-4 py-3"><span className="text-sm text-[#6D7285]">{label}</span><span className="text-sm font-semibold text-[#171A2B]">{value}</span></div>
                  ))}
                </div>
              </section>

              <section className="rounded-[30px] border border-[#E4E7EF] bg-white p-5 shadow-[0_18px_70px_rgba(23,26,43,0.045)]">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-[#FFF4E8] text-[#F59E0B]"><LockKeyhole size={20} aria-hidden /></span>
                  <div><h2 className="text-lg font-bold tracking-[-0.02em] text-[#171A2B]">Backend</h2><p className="text-sm text-[#9A9FB1]">Current runtime</p></div>
                </div>
                <div className="mt-5 space-y-2">
                  <div className="rounded-2xl bg-[#F7F8FC] px-4 py-3 font-mono text-xs text-[#6D7285]">NEXT_PUBLIC_CONVEX_URL</div>
                  <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700"><Check size={14} /> Connected</div>
                </div>
              </section>

              <section className="rounded-[30px] bg-gradient-to-br from-[#6366F1] via-[#8B7CFF] to-[#E978D4] p-5 text-white shadow-xl shadow-indigo-100">
                <Sparkles size={22} aria-hidden /><h2 className="mt-5 text-xl font-bold tracking-[-0.03em]">Live preferences</h2><p className="mt-2 text-sm leading-6 text-white/82">Changes remain local until you press Save changes, then follow your account across sessions.</p>
              </section>
            </aside>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
