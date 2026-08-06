"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, FileCode2, Gauge, GitPullRequest, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Text } from "@/components/ui/text";

type GuardViolation = {
  rule: string;
  severity: "error" | "warning";
  component: string | null;
  file: string;
  line: number;
  message: string;
  suggestion?: string;
};

type GuardReport = {
  generatedAt: string | null;
  summary: {
    score: number;
    filesScanned: number;
    violations: number;
    errors: number;
    warnings: number;
    blocking: number;
    changedFiles: number | null;
    components: Record<string, { strategy: string; violations: number; errors: number; warnings: number }>;
  };
  violations: GuardViolation[];
};

const emptyReport: GuardReport = {
  generatedAt: null,
  summary: {
    score: 100,
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
  const statusLabel = report.summary.blocking > 0 ? "Blocked" : report.summary.errors > 0 ? "Legacy debt" : "Healthy";

  const stats = [
    { label: "Health score", value: `${report.summary.score}/100`, icon: Gauge },
    { label: "Files scanned", value: report.summary.filesScanned, icon: FileCode2 },
    { label: "Errors", value: report.summary.errors, icon: AlertTriangle },
    { label: "Blocking", value: report.summary.blocking, icon: GitPullRequest },
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
                Track component drift, incremental migrations and rules that keep developers and coding agents inside the approved design system.
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

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ label, value, icon: Icon }) => (
              <article key={label} className="rounded-[22px] border border-white/80 bg-white/80 p-4 shadow-[0_12px_34px_rgba(23,26,43,0.045)] backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <Text.Caption className="uppercase">{label}</Text.Caption>
                  <Icon className="text-[#6366F1]" size={17} aria-hidden />
                </div>
                <strong className="mt-3 block text-3xl font-bold tracking-[-0.05em] text-[#171A2B]">{value}</strong>
              </article>
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)]">
            <article className="rounded-[26px] border border-white/80 bg-white/82 p-5 shadow-[0_18px_44px_rgba(23,26,43,0.055)] backdrop-blur">
              <Text.H2>Governed components</Text.H2>
              <Text.Paragraph className="mt-2">Each component moves independently from legacy protection to full enforcement.</Text.Paragraph>
              <div className="mt-5 space-y-3">
                {componentRows.length ? componentRows.map(([name, component]) => (
                  <div key={name} className="rounded-[18px] border border-[#E9EBF2] bg-[#F8F9FC] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <strong className="text-sm text-[#171A2B]">{name}</strong>
                      <span className="rounded-full bg-[#EEF0FF] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#6366F1]">{component.strategy}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <Metric label="Issues" value={component.violations} />
                      <Metric label="Errors" value={component.errors} />
                      <Metric label="Warnings" value={component.warnings} />
                    </div>
                  </div>
                )) : <Text.Paragraph>No governed components were found in the report.</Text.Paragraph>}
              </div>
            </article>

            <article className="rounded-[26px] border border-white/80 bg-white/82 p-5 shadow-[0_18px_44px_rgba(23,26,43,0.055)] backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Text.H2>Latest findings</Text.H2>
                  <Text.Paragraph className="mt-2">Actionable violations generated for humans, CI and coding agents.</Text.Paragraph>
                </div>
                <span className="rounded-full border border-[#E4E7EF] bg-white px-3 py-1 text-xs font-semibold text-[#6D7285]">{report.summary.violations} total</span>
              </div>
              <div className="mt-5 space-y-3">
                {recentViolations.length ? recentViolations.map((violation, index) => (
                  <div key={`${violation.rule}-${violation.file}-${violation.line}-${index}`} className="rounded-[18px] border border-[#E9EBF2] bg-[#F8F9FC] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={violation.severity === "error" ? "rounded-full bg-red-50 px-2 py-1 text-[11px] font-bold text-red-600" : "rounded-full bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700"}>{violation.rule}</span>
                      <code className="break-all text-xs text-[#6366F1]">{violation.file}:{violation.line}</code>
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
            {report.generatedAt ? `Generated ${new Date(report.generatedAt).toLocaleString()}` : "Report will be generated during the next build."}
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
