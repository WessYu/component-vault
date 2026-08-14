import Link from "next/link";
import { ArrowLeft, Check, Terminal } from "lucide-react";

const steps = [
  { command: "analyze", title: "Analyze your component system", description: "Discover component sources and inspect their semantic API, coverage and mappings." },
  { command: "check", title: "Validate governance", description: "Run the same governance and semantic policies locally before changes reach CI or review." },
  { command: "fix", title: "Apply supported fixes", description: "Preview or apply safe semantic corrections, then run check again to verify the result." },
];

export default function CliPage() {
  return (
    <main className="min-h-dvh bg-[#F7F8FC] px-5 py-8 text-text-primary md:px-8 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/vault/components" className="inline-flex items-center gap-2 text-sm font-semibold text-[#6366F1] hover:underline">
          <ArrowLeft size={16} aria-hidden /> Back to components
        </Link>

        <header className="mt-10 max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#DDE1F4] bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#6366F1] shadow-sm">
            <Terminal size={13} aria-hidden /> Component Vault CLI
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-[-0.045em] md:text-6xl">Governance that runs where developers work.</h1>
          <p className="mt-5 text-base leading-8 text-[#6D7285] md:text-lg">Use the Component Vault Guard from the terminal to analyze components, enforce semantic governance and apply supported corrections locally or in CI.</p>
        </header>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <article key={step.command} className="rounded-[28px] border border-[#E4E7EF] bg-white p-6 shadow-[0_18px_60px_rgba(23,26,43,0.05)]">
              <div className="flex items-center justify-between"><span className="grid size-9 place-items-center rounded-xl bg-[#EEF0FF] text-xs font-bold text-[#6366F1]">0{index + 1}</span><code className="rounded-lg bg-[#171A2B] px-2.5 py-1 text-xs font-semibold text-white">component-vault {step.command}</code></div>
              <h2 className="mt-6 text-xl font-bold">{step.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#6D7285]">{step.description}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 overflow-hidden rounded-[32px] bg-[#111426] text-white shadow-[0_28px_90px_rgba(23,26,43,0.16)]">
          <div className="border-b border-white/10 px-6 py-4 text-xs font-semibold text-[#9297AE]">component-vault · local workflow</div>
          <div className="p-6 font-mono text-sm leading-8 md:p-8">
            <p><span className="text-[#A5B4FC]">$</span> component-vault analyze</p>
            <p className="mt-3 text-[#C7CBFF]">Analyzing semantic roles and component coverage...</p>
            <p className="text-[#6EE7B7]"><Check className="mr-2 inline" size={15} />Component sources scanned</p>
            <p className="text-[#6EE7B7]"><Check className="mr-2 inline" size={15} />Public semantic API analyzed</p>
            <p className="text-[#9297AE]">→ Governance coverage calculated</p>
            <p className="mt-3 text-[#D5D8E4]">Files analyzed: 42</p>
            <p className="text-[#D5D8E4]">Semantic findings: 0</p>
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-[#E4E7EF] bg-white p-6 md:p-8">
          <h2 className="text-2xl font-bold">Where it fits</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div><strong className="text-sm">Local development</strong><p className="mt-1 text-sm leading-6 text-[#6D7285]">Catch inconsistencies before committing.</p></div>
            <div><strong className="text-sm">Pull requests</strong><p className="mt-1 text-sm leading-6 text-[#6D7285]">Use the same rules as a CI gate.</p></div>
            <div><strong className="text-sm">AI coding agents</strong><p className="mt-1 text-sm leading-6 text-[#6D7285]">Expose governance context in a machine-readable workflow.</p></div>
          </div>
        </section>
      </div>
    </main>
  );
}
