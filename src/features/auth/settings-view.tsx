"use client";

import { Bell, Check, LockKeyhole, MonitorSmartphone, ShieldCheck, SlidersHorizontal, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { isSupabaseConfigured } from "@/lib/supabase";

export function SettingsView() {
  return (
    <AppShell active="Settings">
      <section className="px-4 py-6 md:px-7">
        <div className="mx-auto max-w-[1460px]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-[#E4E7EF] bg-white px-3 py-1 text-sm font-medium text-[#6366F1] shadow-sm">
                <SlidersHorizontal size={15} aria-hidden />
                Workspace preferences
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-[#171A2B] md:text-5xl">Settings</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[#6D7285]">Configure the component workspace, preview behavior and account security.</p>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              <Check size={16} aria-hidden />
              Workspace synced
            </div>
          </div>

          <div className="mt-8 grid gap-5 xl:grid-cols-[1fr_380px]">
            <div className="space-y-5">
              <section className="rounded-[30px] border border-[#E4E7EF] bg-white p-5 shadow-[0_18px_70px_rgba(23,26,43,0.045)]">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-[#EEF0FF] text-[#6366F1]">
                    <MonitorSmartphone size={20} aria-hidden />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold tracking-[-0.02em] text-[#171A2B]">Preview defaults</h2>
                    <p className="text-sm text-[#9A9FB1]">Controls for component inspection.</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {[
                    ["Grid size", "8px"],
                    ["Default viewport", "Desktop"],
                    ["Autosave", "900ms debounce"],
                    ["Preview theme", "Light"],
                  ].map(([label, value]) => (
                    <label key={label} className="grid gap-2">
                      <span className="text-sm font-semibold text-[#171A2B]">{label}</span>
                      <input className="min-h-12 rounded-2xl border border-[#E4E7EF] bg-[#F7F8FC] px-4 text-sm text-[#171A2B] outline-none transition focus:border-[#6366F1] focus:bg-white" defaultValue={value} />
                    </label>
                  ))}
                </div>
              </section>

              <section className="rounded-[30px] border border-[#E4E7EF] bg-white p-5 shadow-[0_18px_70px_rgba(23,26,43,0.045)]">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-[#EAFBF4] text-emerald-600">
                    <Bell size={20} aria-hidden />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold tracking-[-0.02em] text-[#171A2B]">Notifications</h2>
                    <p className="text-sm text-[#9A9FB1]">Updates for shared components and review activity.</p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    ["Component review requests", true],
                    ["Token drift alerts", true],
                    ["Weekly usage digest", false],
                  ].map(([label, checked]) => (
                    <label key={label.toString()} className="flex min-h-14 items-center justify-between gap-4 rounded-2xl border border-[#E4E7EF] bg-[#F7F8FC] px-4">
                      <span className="text-sm font-medium text-[#171A2B]">{label}</span>
                      <input className="size-4 accent-[#6366F1]" type="checkbox" defaultChecked={Boolean(checked)} />
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
                  <p className="mt-2 text-sm leading-6 text-white/75">
                    Supabase Auth is {isSupabaseConfigured ? "configured for this environment." : "waiting for environment variables."}
                  </p>
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    ["Authentication", isSupabaseConfigured ? "Connected" : "Local demo"],
                    ["Session guard", "Enabled"],
                    ["Role checks", "Active"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between rounded-2xl bg-[#F7F8FC] px-4 py-3">
                      <span className="text-sm text-[#6D7285]">{label}</span>
                      <span className="text-sm font-semibold text-[#171A2B]">{value}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[30px] border border-[#E4E7EF] bg-white p-5 shadow-[0_18px_70px_rgba(23,26,43,0.045)]">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-[#FFF4E8] text-[#F59E0B]">
                    <LockKeyhole size={20} aria-hidden />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold tracking-[-0.02em] text-[#171A2B]">Environment</h2>
                    <p className="text-sm text-[#9A9FB1]">Required keys</p>
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  {["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"].map((key) => (
                    <div key={key} className="rounded-2xl bg-[#F7F8FC] px-4 py-3 font-mono text-xs text-[#6D7285]">{key}</div>
                  ))}
                </div>
              </section>

              <section className="rounded-[30px] bg-gradient-to-br from-[#6366F1] via-[#8B7CFF] to-[#E978D4] p-5 text-white shadow-xl shadow-indigo-100">
                <Sparkles size={22} aria-hidden />
                <h2 className="mt-5 text-xl font-bold tracking-[-0.03em]">Component workspace</h2>
                <p className="mt-2 text-sm leading-6 text-white/82">Modern controls are active across the vault routes.</p>
              </section>
            </aside>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
