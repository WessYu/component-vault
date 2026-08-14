import Link from "next/link";
import { ArrowLeft, Check, Copy, Terminal } from "lucide-react";

const commands = [
  ["init", "Initialize a project", "Prepare a project for Component Vault Guard."],
  ["doctor", "Diagnose the environment", "Check that the local Guard setup is ready."],
  ["analyze", "Analyze components", "Discover component sources and inspect their semantic API."],
  ["check", "Validate governance", "Run governance and semantic policies before CI or review."],
  ["fix", "Apply supported fixes", "Apply supported corrections, then run check again."],
] as const;

function CodeBlock({ children }: { children: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-[#0B0D17] ring-1 ring-white/10">
      <button
        type="button"
        onClick={() => navigator.clipboard?.writeText(children)}
        className="absolute right-3 top-3 rounded-lg border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-[#9297AE] opacity-0 transition group-hover:opacity-100 hover:bg-white/10 hover:text-white"
        aria-label={`Copy ${children}`}
      >
        <Copy size={13} aria-hidden />
      </button>
      <pre className="overflow-x-auto p-5 text-[12px] leading-6 text-[#D5D8E4]"><code>{children}</code></pre>
    </div>
  );
}

export default function CliPage() {
  return (
    <main className="min-h-dvh bg-[#F7F8FC] px-5 py-8 text-text-primary md:px-8 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/vault/components" className="inline-flex items-center gap-2 text-sm font-semibold text-[#6366F1] hover:underline"><ArrowLeft size={16} aria-hidden /> Back to components</Link>

        <header className="mt-10 max-w-4xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#DDE1F4] bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#6366F1] shadow-sm"><Terminal size={13} aria-hidden /> Component Vault CLI</span>
          <h1 className="mt-5 text-4xl font-bold tracking-[-0.045em] md:text-6xl">Governance that runs where developers work.</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[#6D7285] md:text-lg">Component Vault Guard is the developer-facing CLI for analyzing component APIs, validating semantic governance and applying supported corrections locally or in CI.</p>
        </header>

        <section className="mt-10 rounded-[32px] border border-[#E4E7EF] bg-white p-6 shadow-[0_18px_60px_rgba(23,26,43,0.05)] md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6366F1]">Start here</p>
          <h2 className="mt-2 text-2xl font-bold">Install the Guard</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6D7285]">Install the CLI, then verify that the command is available in your terminal.</p>
          <div className="mt-5"><CodeBlock>{"npm install -g @component-vault/guard\ncomponent-vault --help"}</CodeBlock></div>
        </section>

        <section className="mt-10">
          <div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6366F1]">The workflow</p><h2 className="mt-2 text-3xl font-bold">From project setup to governed code</h2><p className="mt-3 text-sm leading-6 text-[#6D7285]">Each command has a specific job. Start with initialization, understand the system, validate it, and only then apply supported corrections.</p></div>
          <div className="mt-6 space-y-4">
            {commands.map(([command, title, description], index) => (
              <article key={command} className="grid gap-5 rounded-[28px] border border-[#E4E7EF] bg-white p-6 md:grid-cols-[72px_minmax(0,1fr)_minmax(280px,0.9fr)] md:items-start md:p-7">
                <span className="grid size-12 place-items-center rounded-2xl bg-[#EEF0FF] text-sm font-bold text-[#6366F1]">0{index + 1}</span>
                <div><div className="flex flex-wrap items-center gap-3"><h3 className="text-xl font-bold">{title}</h3><code className="rounded-lg bg-[#171A2B] px-2.5 py-1 text-xs font-semibold text-white">component-vault {command}</code></div><p className="mt-3 text-sm leading-6 text-[#6D7285]">{description}</p></div>
                <CodeBlock>{`component-vault ${command}`}</CodeBlock>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <article className="rounded-[28px] border border-[#E4E7EF] bg-white p-6 md:p-8"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6366F1]">01 · Analyze</p><h2 className="mt-2 text-2xl font-bold">Understand what the Guard sees</h2><p className="mt-3 text-sm leading-6 text-[#6D7285]">Analysis turns component source into a structured view of public APIs, semantic roles, coverage and mappings. This is the context used by later governance checks.</p><div className="mt-5"><CodeBlock>{"component-vault analyze\n\nAnalyzing component sources...\n✓ Component sources scanned\n✓ Public semantic API analyzed\n→ Governance coverage calculated"}</CodeBlock></div></article>
          <article className="rounded-[28px] border border-[#E4E7EF] bg-white p-6 md:p-8"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6366F1]">02 · Check</p><h2 className="mt-2 text-2xl font-bold">Catch problems before review</h2><p className="mt-3 text-sm leading-6 text-[#6D7285]">Run check locally after changing components or usage. In CI, the same command can act as a governance gate.</p><div className="mt-5"><CodeBlock>{"component-vault check\n\n✓ Configuration loaded\n✓ Component rules validated\n⚠ Violations found"}</CodeBlock></div></article>
        </section>

        <section className="mt-6 rounded-[28px] border border-[#E4E7EF] bg-white p-6 md:p-8"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6366F1]">03 · Fix</p><h2 className="mt-2 text-2xl font-bold">Correct only what the Guard supports</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-[#6D7285]">Fix is intentionally constrained. It should apply supported semantic corrections, not rewrite arbitrary application code. After a fix, run check again and verify the result.</p><div className="mt-5"><CodeBlock>{"component-vault fix\n\nSupported corrections found\n✓ Apply correction\n→ component-vault check"}</CodeBlock></div></section>

        <section className="mt-10 overflow-hidden rounded-[32px] bg-[#111426] text-white shadow-[0_28px_90px_rgba(23,26,43,0.16)]"><div className="border-b border-white/10 px-6 py-4 text-xs font-semibold text-[#9297AE]">component-vault · complete local workflow</div><div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[1fr_1.1fr] lg:items-center"><div><h2 className="text-3xl font-bold tracking-[-0.03em]">One governance model from local development to CI.</h2><p className="mt-4 text-sm leading-7 text-[#A8ADBF]">Analyze the system, check your changes, fix supported violations, and run the same check again before opening a pull request.</p></div><div className="font-mono text-xs leading-7 text-[#D5D8E4]"><p><span className="text-[#A5B4FC]">$</span> component-vault analyze</p><p className="text-[#6EE7B7]">✓ Component API analyzed</p><p className="mt-2"><span className="text-[#A5B4FC]">$</span> component-vault check</p><p className="text-[#FBBF24]">⚠ Governance violations found</p><p className="mt-2"><span className="text-[#A5B4FC]">$</span> component-vault fix</p><p className="text-[#6EE7B7]">✓ Supported corrections applied</p><p className="mt-2"><span className="text-[#A5B4FC]">$</span> component-vault check</p><p className="text-[#6EE7B7]"><Check className="mr-2 inline" size={13} />All governance checks passed</p></div></div></section>

        <section className="mt-10 rounded-[28px] border border-[#E4E7EF] bg-white p-6 md:p-8"><h2 className="text-2xl font-bold">Where it fits</h2><div className="mt-5 grid gap-6 md:grid-cols-3"><div><strong>Local development</strong><p className="mt-2 text-sm leading-6 text-[#6D7285]">Catch inconsistencies before committing.</p></div><div><strong>Pull requests</strong><p className="mt-2 text-sm leading-6 text-[#6D7285]">Run the same governance gate in CI.</p></div><div><strong>AI coding agents</strong><p className="mt-2 text-sm leading-6 text-[#6D7285]">Provide a deterministic governance check around generated changes.</p></div></div></section>

        <section className="mt-10 rounded-[28px] border border-[#E4E7EF] bg-white p-6 md:p-8"><h2 className="text-2xl font-bold">Quick reference</h2><div className="mt-5 divide-y divide-[#E8EAF0]">{commands.map(([command, title, description]) => <div key={command} className="grid gap-2 py-4 md:grid-cols-[260px_1fr]"><code className="font-semibold text-[#4F46E5]">component-vault {command}</code><div><strong className="text-sm">{title}</strong><p className="mt-1 text-sm text-[#6D7285]">{description}</p></div></div>)}</div></section>
      </div>
    </main>
  );
}
