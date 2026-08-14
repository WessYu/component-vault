"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Check, ChevronRight, Copy, Terminal } from "lucide-react";

const commandData = [
  { key: "init", label: "init", title: "Initialize", description: "Set up governance and semantic mappings for a project.", example: "npx component-vault init" },
  { key: "analyze", label: "analyze", title: "Analyze", description: "Inspect semantic roles, coverage, mappings and findings.", example: "npx component-vault analyze" },
  { key: "check", label: "check", title: "Check", description: "Enforce governance policies locally or in CI.", example: "npx component-vault check --base origin/master" },
  { key: "fix", label: "fix", title: "Fix", description: "Preview or apply only the corrections the Guard can resolve safely.", example: "npx component-vault fix --dry-run" },
  { key: "pr", label: "pr", title: "PR gate", description: "Generate a pull-request summary and fail when the gate is blocked.", example: "npx component-vault pr --base origin/master" },
] as const;

type CommandKey = (typeof commandData)[number]["key"];

const output: Record<CommandKey, string[]> = {
  init: ["Component Vault Guard", "", "✓ component-vault.yaml created", "✓ semantic mappings initialized", "✓ project ready"],
  analyze: ["Component Vault Semantic Analysis", "", "Role                 Native   Governed   Findings", "──────────────────────────────────────────────", "heading                   23         19          4", "button                     8         31          0", "", "Files analyzed: 42", "Semantic findings: 4"],
  check: ["Checking component governance...", "", "✓ Configuration loaded", "✓ Component rules validated", "⚠ 2 violations found", "", "Button", "└─ Invalid semantic usage", "Text", "└─ Unapproved variant"],
  fix: ["Component Vault Guard Autofix", "", "Would fix src/components/Hero.tsx", "✓ 1 supported replacement", "→ Review changes, then run fix", ""],
  pr: ["Component Vault Guard PR · blocked", "", "Migration 78% · 118 legacy · 2 new · 0 resolved · 2 blocking"],
};

function Code({ children, light = false }: { children: string; light?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className={`group relative overflow-hidden rounded-2xl ${light ? "bg-[#F7F8FC] ring-1 ring-[#E4E7EF]" : "bg-[#090B15] ring-1 ring-white/10"}`}>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(children);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1100);
          } catch {}
        }}
        className={`absolute right-3 top-3 rounded-lg border px-2 py-1 text-[11px] font-semibold opacity-0 transition group-hover:opacity-100 ${light ? "border-[#E4E7EF] text-[#6D7285] hover:bg-white" : "border-white/10 text-[#9297AE] hover:bg-white/10 hover:text-white"}`}
        aria-label="Copy command"
      >
        <span className="inline-flex items-center gap-1.5"><Copy size={12} aria-hidden />{copied ? "Copied" : "Copy"}</span>
      </button>
      <pre className={`overflow-x-auto p-5 pr-16 text-[12px] leading-6 ${light ? "text-[#313548]" : "text-[#D5D8E4]"}`}><code>{children}</code></pre>
    </div>
  );
}

export default function CliPage() {
  const [active, setActive] = useState<CommandKey>("analyze");
  const current = commandData.find((item) => item.key === active)!;

  return (
    <main className="min-h-dvh bg-[#F7F8FC] text-text-primary">
      <div className="mx-auto max-w-[1540px] px-4 pb-20 pt-5 sm:px-6 lg:px-8">
        <Link href="/vault/components" className="inline-flex items-center gap-2 text-sm font-semibold text-[#6366F1] transition hover:-translate-x-0.5 hover:underline"><ArrowLeft size={16} aria-hidden /> Back to components</Link>

        <section className="relative mt-6 overflow-hidden rounded-[36px] border border-[#DDE1F4] bg-[#111426] text-white shadow-[0_30px_100px_rgba(23,26,43,0.14)]">
          <div className="absolute -right-24 -top-24 size-96 rounded-full bg-[#6366F1]/20 blur-3xl" aria-hidden />
          <div className="absolute bottom-0 left-1/3 size-80 rounded-full bg-[#818CF8]/10 blur-3xl" aria-hidden />
          <div className="relative grid gap-10 p-7 sm:p-9 lg:grid-cols-[0.92fr_1.08fr] lg:p-12 xl:gap-14">
            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#C7CBFF]"><Terminal size={13} aria-hidden /> Component Vault CLI</div>
              <h1 className="mt-6 max-w-2xl text-4xl font-bold tracking-[-0.05em] sm:text-5xl lg:text-[62px] lg:leading-[0.98]">Governance that runs where developers work.</h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-[#B9BDD0]">Analyze your component system, understand its semantic model, enforce governance before review, and apply only the fixes the Guard can prove are safe.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-[#D8DBEA]">AST-driven</span>
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-[#D8DBEA]">Deterministic</span>
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-[#D8DBEA]">Local + CI</span>
              </div>
            </div>

            <div className="self-center">
              <div className="overflow-hidden rounded-[26px] border border-white/10 bg-[#090B15] shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-[#F87171]"/><span className="size-2.5 rounded-full bg-[#FBBF24]"/><span className="size-2.5 rounded-full bg-[#34D399]"/><span className="ml-2 text-[11px] text-[#73798F]">component-vault</span></div><span className="rounded-full border border-[#34D399]/20 bg-[#34D399]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6EE7B7]">ready</span></div>
                <div className="p-5 font-mono text-[12px] leading-7 sm:p-6 sm:text-[13px]"><div className="text-[#8B91A7]"><span className="text-[#A5B4FC]">$</span> {current.example}</div>{output[active].map((line, index) => <div key={`${line}-${index}`} className={index === 0 ? "mt-4 text-[#C7CBFF]" : line.startsWith("✓") ? "text-[#6EE7B7]" : line.startsWith("⚠") ? "text-[#FBBF24]" : line.startsWith("→") ? "text-[#9297AE]" : "text-[#D5D8E4]"}>{line || "\u00a0"}</div>)}</div>
                <div className="flex flex-wrap gap-2 border-t border-white/10 p-3">
                  {commandData.map((item) => <button key={item.key} type="button" onClick={() => setActive(item.key)} className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${active === item.key ? "bg-[#6366F1] text-white" : "bg-white/[0.05] text-[#9297AE] hover:bg-white/[0.09] hover:text-white"}`}>{item.label}</button>)}
                </div>
              </div>
              <p className="mt-3 text-center text-[11px] text-[#73798F]">Switch commands to see how the same governance model moves through the workflow.</p>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="rounded-[30px] border border-[#E4E7EF] bg-white p-6 shadow-[0_18px_60px_rgba(23,26,43,0.04)] md:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6366F1]">01 · Install</p>
            <h2 className="mt-2 text-2xl font-bold">Start with the package</h2>
            <p className="mt-3 text-sm leading-6 text-[#6D7285]">The published CLI package is <code className="font-semibold text-[#4F46E5]">@wess2001/component-vault</code>. For project usage, keep it in devDependencies and invoke it through npx.</p>
            <div className="mt-5"><Code light>{"npm install -D @wess2001/component-vault\nnpx component-vault --help"}</Code></div>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {[['Discover', 'Analyze your component API and semantic coverage.'], ['Enforce', 'Run deterministic governance checks locally and in CI.'], ['Correct', 'Apply conservative fixes only where a governed target is resolvable.']].map(([title, description]) => <article key={title} className="rounded-[30px] border border-[#E4E7EF] bg-white p-6 shadow-[0_18px_60px_rgba(23,26,43,0.04)]"><div className="grid size-10 place-items-center rounded-2xl bg-[#EEF0FF] text-[#6366F1]"><Check size={18} aria-hidden /></div><h3 className="mt-5 font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#6D7285]">{description}</p></article>)}
          </div>
        </section>

        <section className="mt-10">
          <div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6366F1]">02 · Learn the commands</p><h2 className="mt-2 text-3xl font-bold tracking-[-0.03em]">Every command has a job.</h2><p className="mt-3 text-sm leading-6 text-[#6D7285]">Use the workflow in this order when introducing governance to an existing project. You can also adopt individual commands as your team matures.</p></div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {commandData.map((item, index) => <article key={item.key} className={`rounded-[30px] border border-[#E4E7EF] bg-white p-6 shadow-[0_18px_60px_rgba(23,26,43,0.04)] ${index === 2 ? "lg:col-span-2" : ""}`}><div className="flex flex-wrap items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-[#EEF0FF] text-xs font-bold text-[#6366F1]">0{index + 1}</span><code className="rounded-lg bg-[#171A2B] px-2.5 py-1 text-xs font-semibold text-white">npx component-vault {item.key}</code></div><h3 className="mt-5 text-xl font-bold">{item.title}</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-[#6D7285]">{item.description}</p><div className="mt-5"><Code light>{item.example}</Code></div></article>)}
          </div>
        </section>

        <section className="mt-10 overflow-hidden rounded-[34px] bg-[#171A2B] text-white shadow-[0_28px_90px_rgba(23,26,43,0.12)]">
          <div className="grid gap-8 p-7 sm:p-9 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:p-11"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#A5B4FC]">03 · See the pipeline</p><h2 className="mt-3 text-3xl font-bold tracking-[-0.03em]">One governance model. Three places.</h2><p className="mt-4 text-sm leading-7 text-[#A8ADBF]">Run the same rules before commit, in pull requests, and around AI-generated changes. The enforcement core stays deterministic and repository-owned.</p></div><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"><p className="text-xs font-bold uppercase tracking-wider text-[#9297AE]">Local</p><p className="mt-2 text-sm font-semibold">npx component-vault check</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"><p className="text-xs font-bold uppercase tracking-wider text-[#9297AE]">Pull request</p><p className="mt-2 text-sm font-semibold">npx component-vault pr</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"><p className="text-xs font-bold uppercase tracking-wider text-[#9297AE]">AI agent</p><p className="mt-2 text-sm font-semibold">npx component-vault context</p></div></div></div>
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-3">
          <article className="rounded-[28px] border border-[#E4E7EF] bg-white p-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6366F1]">Migration</p><h3 className="mt-2 text-xl font-bold">Adopt without rewriting everything.</h3><p className="mt-3 text-sm leading-6 text-[#6D7285]">Use <code className="font-semibold text-[#4F46E5]">baseline</code> to capture accepted legacy debt and focus checks on what changes next.</p></article>
          <article className="rounded-[28px] border border-[#E4E7EF] bg-white p-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6366F1]">Explainability</p><h3 className="mt-2 text-xl font-bold">Understand why a rule fired.</h3><p className="mt-3 text-sm leading-6 text-[#6D7285]">Use <code className="font-semibold text-[#4F46E5]">explain CV006</code> to inspect the semantic finding and configured mapping.</p></article>
          <article className="rounded-[28px] border border-[#E4E7EF] bg-white p-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6366F1]">Automation</p><h3 className="mt-2 text-xl font-bold">Generate PR and agent context.</h3><p className="mt-3 text-sm leading-6 text-[#6D7285]">Use <code className="font-semibold text-[#4F46E5]">pr</code> for review summaries and <code className="font-semibold text-[#4F46E5]">context</code> for machine-readable governance rules.</p></article>
        </section>

        <footer className="mt-12 flex flex-col gap-3 border-t border-[#E4E7EF] pt-6 text-sm text-[#6D7285] sm:flex-row sm:items-center sm:justify-between"><span>Component Vault Guard · semantic governance for developers, CI and AI coding agents.</span><Link href="/vault/components" className="inline-flex items-center gap-2 font-semibold text-[#6366F1] hover:underline">Back to components <ChevronRight size={15} aria-hidden /></Link></footer>
      </div>
    </main>
  );
}
