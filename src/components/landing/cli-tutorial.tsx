import { ArrowRight, CheckCircle2, ShieldCheck, Terminal } from "lucide-react";

const steps = [
  {
    index: "01",
    label: "Initialize",
    title: "Bring governance into the repository",
    command: "npx @wess2001/component-vault@latest init",
    description:
      "Create the repository-owned configuration that defines which component, semantic and import rules Component Vault should enforce.",
    result: "component-vault.yaml created",
  },
  {
    index: "02",
    label: "Analyze",
    title: "Understand the codebase before enforcing it",
    command: "npx component-vault analyze",
    description:
      "Inspect semantic coverage and governed component usage before introducing a hard gate into an existing workflow.",
    result: "semantic coverage mapped",
  },
  {
    index: "03",
    label: "Validate",
    title: "Gate only the changes that matter",
    command: "npx component-vault check --base origin/master",
    description:
      "Compare the current branch against the base ref and surface violations using the enforcement strategy owned by the repository.",
    result: "new violations identified",
  },
  {
    index: "04",
    label: "Fix safely",
    title: "Preview deterministic fixes before writing",
    command: "npx component-vault fix --dry-run",
    description:
      "Review supported changes first. Component Vault only proposes fixes it can resolve deterministically from the repository configuration.",
    result: "safe changes previewed",
  },
] as const;

export function CliTutorial() {
  return (
    <section
      className="relative overflow-hidden border-y border-[#E7E9F1] bg-[#F7F8FC] px-5 py-24 lg:py-32"
      aria-labelledby="cli-tutorial-title"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_16%,rgba(99,102,241,0.09),transparent_30%)]" />

      <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#DDE0EB] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#6366F1] shadow-sm">
            <Terminal size={14} aria-hidden /> CLI workflow · 4 steps
          </div>

          <h2
            id="cli-tutorial-title"
            className="mt-6 max-w-xl text-4xl font-bold tracking-[-0.055em] text-[#171A2B] md:text-6xl"
          >
            From install to an enforceable rule set.
          </h2>

          <p className="mt-6 max-w-lg text-lg leading-8 text-[#6D7285]">
            The shortest path from a normal React codebase to repository-owned component governance. No hidden model, no opaque review step — just configuration, AST analysis and deterministic enforcement.
          </p>

          <div className="mt-8 rounded-[26px] border border-[#272C40] bg-[#111421] p-5 shadow-[0_24px_70px_rgba(23,26,43,0.15)]">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8F96AA]">
              <ShieldCheck size={15} className="text-[#63D6A6]" aria-hidden /> End state
            </div>
            <p className="mt-3 text-sm leading-6 text-[#DCE1F2]">
              A pull request can be checked against the exact governance contract committed with the codebase.
            </p>
            <div className="mt-4 flex items-center gap-2 font-mono text-xs text-[#63D6A6]">
              rules <ArrowRight size={13} aria-hidden /> AST <ArrowRight size={13} aria-hidden /> gate
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute bottom-8 left-[25px] top-8 hidden w-px bg-[#D9DCE7] md:block" />

          <div className="space-y-5">
            {steps.map((step) => (
              <article
                key={step.index}
                className="relative rounded-[30px] border border-[#E1E4ED] bg-white p-5 shadow-[0_18px_55px_rgba(23,26,43,0.055)] md:pl-20 md:pr-7 md:py-7"
              >
                <div className="mb-5 flex items-center gap-4 md:absolute md:left-5 md:top-7 md:mb-0 md:block">
                  <div className="grid size-10 place-items-center rounded-full border border-[#D9DCE7] bg-[#F7F8FC] font-mono text-xs font-bold text-[#6366F1] shadow-[0_0_0_6px_#fff]">
                    {step.index}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#6366F1]">{step.label}</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#7C8397]">
                    <CheckCircle2 size={14} className="text-[#51C89B]" aria-hidden /> {step.result}
                  </span>
                </div>

                <h3 className="mt-3 text-2xl font-bold tracking-[-0.035em] text-[#171A2B] md:text-3xl">{step.title}</h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#747B8F] md:text-base md:leading-7">{step.description}</p>

                <div className="mt-5 overflow-hidden rounded-2xl border border-[#2A2F43] bg-[#111421]">
                  <div className="flex items-center gap-1.5 border-b border-white/8 bg-[#171A2B] px-4 py-3">
                    <span className="size-2 rounded-full bg-[#FF7664]" />
                    <span className="size-2 rounded-full bg-[#F1BE48]" />
                    <span className="size-2 rounded-full bg-[#51C89B]" />
                    <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#777F96]">terminal</span>
                  </div>
                  <pre className="overflow-x-auto px-4 py-4 text-sm leading-6 text-[#DCE1F2]">
                    <code><span className="text-[#777F96]">$ </span>{step.command}</code>
                  </pre>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-7 flex flex-col justify-between gap-5 rounded-[28px] border border-[#DDE0EB] bg-[#EEF0F8] p-6 sm:flex-row sm:items-center md:p-7">
            <div>
              <p className="text-sm font-bold text-[#171A2B]">Need brownfield adoption?</p>
              <p className="mt-1 text-sm leading-6 text-[#6D7285]">Capture accepted legacy debt first, then block regressions as the codebase evolves.</p>
            </div>
            <code className="shrink-0 rounded-xl border border-[#D6D9E5] bg-white px-4 py-3 font-mono text-xs font-semibold text-[#4F566B] shadow-sm">
              npx component-vault baseline
            </code>
          </div>
        </div>
      </div>
    </section>
  );
}
