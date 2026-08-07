"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, FileCode2, GitPullRequest, ShieldCheck, Sparkles, TrendingDown } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Text } from "@/components/ui/text";

type GuardViolation = {
  rule: string;
  severity: "error" | "warning";
  component: string | null;
  file: string;
  line: number;
  column?: number;
  message: string;
  suggestion?: string;
};

type ComponentSummary = {
  strategy: string;
  violations: number;
  errors: number;
  warnings: number;
  legacy?: number;
  new?: number;
  resolved?: number;
  migrationProgress?: number;
};

type GuardReport = {
  version?: number;
  engine?: string;
  generatedAt: string | null;
  summary: {
    score?: number;
    migrationProgress?: number;
    migrationTotal?: number;
    baseline?: number;
    legacy?: number;
    new?: number;
    resolved?: number;
    filesScanned: number;
    violations: number;
    errors: number;
    warnings: number;
    blocking: number;
    changedFiles: number | null;
    components: Record<string, ComponentSummary>;
  };
  violations: GuardViolation[];
};

const emptyReport: GuardReport = {
  generatedAt: null,
  summary: {
    migrationProgress: 100,
    baseline: 0,
    legacy: 0,
    new: 0,
    resolved: 0,
    filesScanned: 0,
    violations: 0,
    errors: 0,
    warnings: 0,
    blocking: 0,
    changedFiles: null,
    components: {},
  },
  violations: [],
};

export function GuardDashboard() {
  const [report, setReport] = useState<GuardReport>(emptyReport);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/component-vault-report.json", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error(`Report unavailable (${response.status})`);
        return response.json() as Promise<GuardReport>;
      })
      .then((data) => {
        if (active) setReport(data);
      })
      .catch((error: unknown) => {
        if (active) setLoadError(error instanceof Error ? error.message : "Unable to load the Guard report");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const componentRows = useMemo(() => Object.entries(report.summary.components), [report.summary.components]);
  const recentViolations = report.violations.slice(0, 8);
  const migrationProgress = report.summary.migrationProgress ?? report.summary.score ?? 0;
  const legacy = report.summary.legacy ?? report.summary.errors;
  const introduced = report.summary.new ?? 0;
  const resolved = report.summary.resolved ?? 0;
  const baseline = report.summary.baseline ?? legacy + resolved;
  const statusLabel = report.summary.blocking > 0 ? "Blocked" : introduced > 0 ? "New drift detected" : legacy > 0 ? "Legacy contained" : "Healthy";
  const cleanChange = report.summary.blocking === 0 && introduced === 0;

  const stats = [
    { label: "Migration", value: `${migrationProgress}%`, icon: TrendingDown, detail: `${resolved} resolved of ${baseline || legacy}` },
    { label: "Legacy debt", value: legacy, icon: FileCode2, detail: "Known findings still present" },
    { label: "New violations", value: introduced, icon: AlertTriangle, detail: introduced === 0 ? "No new drift introduced" : "Needs attention" },
    { label: "Blocking", value: report.summary.blocking, icon: GitPullRequest, detail: `${report.summary.filesScanned} files scanned` },
  ];

  return (
    <AppShell active="Guard">
      <section className="relative px-3 py-5 sm:px-5 md:px-7 md:py-8 xl:px-8">
        <div className="mx-auto max-w-[1680px] space-y-6">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
            <div>
              <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#E4E7EF] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#6366F1] shadow-sm backdrop-blur">
                <ShieldCheck size={13} aria-hidden />
                Design system governance
              </span>
              <Text.H1>Component Vault Guard</Text.H1>
              <Text.Paragraph className="mt-3 max-w-3xl">
                Measure legacy debt, prevent new component drift and migrate the design system incrementally without freezing an existing codebase.
              </Text.Paragraph>
            </div>
            <div className="flex items-center gap-3 rounded-[22px] border border-white/80 bg-white/78 px-4 py-3 shadow-[0_12px_34px_rgba(23,26,43,0.05)] backdrop-blur">
              {report.summary.blocking > 0 ? <AlertTriangle className="text-amber-500" size={22} /> : <CheckCircle2 className="text-emerald-500" size={22} />}
              <div>
                <Text.Caption className="block uppercase">Current gate</Text.Caption>
                <strong className="text-base text-[#171A2B]">{loading ? "Scanning..." : statusLabel}</strong>
              </div>
            </div>
          </div>

          {loadError ? (
            <div className="rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">{loadError}. Run <code>npm run guard:report</code>.</div>
          ) : null}

          {!loading && cleanChange ? (
            <div className="flex flex-col gap-3 rounded-[22px] border border-emerald-200/80 bg-emerald-50/80 px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-emerald-600 shadow-sm"><CheckCircle2 size={18} aria-hidden /></span>
                <div>
                  <strong className="text-sm text-emerald-950">No new design-system violations</strong>
                  <Text.Paragraph className="mt-0.5 text-sm leading-5 text-emerald-800">Legacy debt remains visible, but the current gate is not allowing new drift through.</Text.Paragraph>
                </div>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-emerald-700 shadow-sm">
                <Sparkles size={13} aria-hidden />
                {report.engine === "typescript-ast" ? "AST engine" : "Guard active"}
              </span>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ label, value, icon: Icon, detail }) => (
              <article key={label} className="rounded-[22px] border border-white/80 bg-white/80 p-4 shadow-[0_12px_34px_rgba(23,26,43,0.045)] backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <Text.Caption className="uppercase">{label}</Text.Caption>
                  <Icon className="text-[#6366F1]" size={17} aria-hidden />
                </div>
                <strong className="mt-3 block text-3xl font-bold tracking-[-0.05em] text-[#171A2B]">{value}</strong>
                <Text.Caption className="mt-1 block normal-case tracking-normal text-[#8B91A3]">{detail}</Text.Caption>
              </article>
            ))}
          </div>

          <article className="rounded-[26px] border border-white/80 bg-white/82 p-5 shadow-[0_18px_44px_rgba(23,26,43,0.055)] backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Text.H2>Migration progress</Text.H2>
                <Text.Paragraph className="mt-2">Baseline debt is reduced over time while new violations remain independently visible.</Text.Paragraph>
              </div>
              <strong className="text-2xl tracking-[-0.04em] text-[#171A2B]">{migrationProgress}%</strong>
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#EEF0F6]">
              <div className="h-full rounded-full bg-gradient-to-r from-[#6366F1] to-[#9A78FF] transition-[width] duration-500" style={{ width: `${Math.max(2, migrationProgress)}%` }} />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <ProgressMetric label="Baseline" value={baseline} />
              <ProgressMetric label="Current legacy" value={legacy} />
              <ProgressMetric label="Resolved" value={resolved} />
            </div>
          </article>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)]">
            <article className="rounded-[26px] border border-white/80 bg-white/82 p-5 shadow-[0_18px_44px_rgba(23,26,43,0.055)] backdrop-blur">
              <Text.H2>Governed components</Text.H2>
              <Text.Paragraph className="mt-2">Each component can move independently from legacy protection to full enforcement.</Text.Paragraph>
              <div className="mt-5 space-y-3">
                {componentRows.length ? componentRows.map(([name, component]) => (
                  <div key={name} className="rounded-[18px] border border-[#E9EBF2] bg-[#F8F9FC] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <strong className="text-sm text-[#171A2B]">{name}</strong>
                      <span className="rounded-full bg-[#EEF0FF] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#6366F1]">{component.strategy}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <Metric label="Legacy" value={component.legacy ?? component.errors} />
                      <Metric label="New" value={component.new ?? 0} />
                      <Metric label="Resolved" value={component.resolved || (componentRows.length === 1 ? resolved : 0)} />
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white">
                        <div className="h-full rounded-full bg-[#6366F1]" style={{ width: `${component.migrationProgress || (componentRows.length === 1 ? migrationProgress : 0)}%` }} />
                      </div>
                      <Text.Caption className="normal-case tracking-normal">{component.migrationProgress || (componentRows.length === 1 ? migrationProgress : 0)}% migrated</Text.Caption>
                    </div>
                  </div>
                )) : <Text.Paragraph>No governed components were found in the report.</Text.Paragraph>}
              </div>
            </article>

            <article className="rounded-[26px] border border-white/80 bg-white/82 p-5 shadow-[0_18px_44px_rgba(23,26,43,0.055)] backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Text.H2>Latest findings</Text.H2>
                  <Text.Paragraph className="mt-2">Actionable AST findings generated for humans, CI and coding agents.</Text.Paragraph>
                </div>
                <span className="rounded-full border border-[#E4E7EF] bg-white px-3 py-1 text-xs font-semibold text-[#6D7285]">{report.summary.violations} total</span>
              </div>
              <div className="mt-5 space-y-3">
                {recentViolations.length ? recentViolations.map((violation, index) => (
                  <div key={`${violation.rule}-${violation.file}-${violation.line}-${violation.column ?? 0}-${index}`} className="rounded-[18px] border border-[#E9EBF2] bg-[#F8F9FC] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={violation.severity === "error" ? "rounded-full bg-red-50 px-2 py-1 text-[11px] font-bold text-red-600" : "rounded-full bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700"}>{violation.rule}</span>
                      <code className="break-all text-xs text-[#6366F1]">{violation.file}:{violation.line}{violation.column ? `:${violation.column}` : ""}</code>
                    </div>
                    <Text.Paragraph className="mt-2 text-sm leading-5">{violation.message}</Text.Paragraph>
                    {violation.suggestion ? <Text.Caption className="mt-2 block normal-case tracking-normal text-[#7A8194]">Fix: {violation.suggestion}</Text.Caption> : null}
                  </div>
                )) : (
                  <div className="grid min-h-44 place-items-center rounded-[20px] border border-dashed border-[#DDE0EA] bg-[#FAFBFD] p-6 text-center">
                    <div>
                      <CheckCircle2 className="mx-auto text-emerald-500" size={30} />
                      <Text.Paragraph className="mt-3">No findings in the latest report.</Text.Paragraph>
                    </div>
                  </div>
                )}
              </div>
            </article>
          </div>

          <Text.Caption className="block text-right normal-case tracking-normal">
            {report.generatedAt ? `Generated ${new Date(report.generatedAt).toLocaleString()}${report.engine ? ` · ${report.engine}` : ""}` : "Report will be generated during the next build."}
          </Text.Caption>
        </div>
      </section>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white px-2 py-2.5">
      <strong className="block text-lg text-[#171A2B]">{value}</strong>
      <Text.Caption className="uppercase">{label}</Text.Caption>
    </div>
  );
}

function ProgressMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[16px] bg-[#F8F9FC] px-4 py-3">
      <Text.Caption className="uppercase">{label}</Text.Caption>
      <strong className="mt-1 block text-xl text-[#171A2B]">{value}</strong>
    </div>
  );
}
