"use client";

import { Check, ChevronRight, Copy, Terminal } from "lucide-react";
import { useState } from "react";

const commands = ["analyze", "check", "fix"] as const;
type Command = (typeof commands)[number];

const steps = [
  { number: "01", title: "Analyze", description: "Discover components and understand their public semantic API." },
  { number: "02", title: "Check", description: "Compare real usage against your governance rules and surface violations." },
  { number: "03", title: "Fix", description: "Apply supported corrections safely, then run the check again." },
];

export function CliShowcase() {
  const [command, setCommand] = useState<Command>("analyze");
  const [copied, setCopied] = useState(false);
  const commandText = `component-vault ${command}`;

  async function copyCommand() {
    try {
      await navigator.clipboard.writeText(commandText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section aria-labelledby="cli-showcase-title" className="relative overflow-hidden rounded-[32px] border border-[#DDE1F4] bg-[#111426] text-white shadow-[0_28px_90px_rgba(23,26,43,0.16)]">
      <div className="absolute -right-28 -top-28 size-80 rounded-full bg-[#6366F1]/20 blur-3xl" aria-hidden />
      <div className="absolute -bottom-36 left-1/3 size-96 rounded-full bg-[#818CF8]/10 blur-3xl" aria-hidden />

      <div className="relative p-6 sm:p-8 lg:p-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#C7CBFF]">
            <Terminal size={13} aria-hidden />
            Component Vault CLI
          </div>
          <h2 id="cli-showcase-title" className="mt-5 max-w-3xl text-3xl font-bold tracking-[-0.04em] sm:text-4xl lg:text-[48px] lg:leading-[1.04]">
            Governance that runs where developers work.
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#B9BDD0] sm:text-base">
            Take Component Vault beyond the dashboard. The CLI reads your component system, analyzes its semantic API, checks governance rules, and helps you correct supported violations from the terminal.
          </p>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
              <div className="flex items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#6366F1]/20 text-[11px] font-bold text-[#C7CBFF]">{step.number}</span>
                <span className="text-sm font-semibold">{step.title}</span>
              </div>
              <p className="mt-3 text-xs leading-5 text-[#9297AE]">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.72fr)_minmax(460px,1.28fr)] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8188A1]">How it works</p>
            <div className="mt-4 space-y-3">
              {[
                ["Your source", "React / TypeScript components"],
                ["Component Vault", "AST + semantic API + governance rules"],
                ["Your workflow", "Terminal → findings → safe corrections"],
              ].map(([title, description], index) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-white/[0.07] text-xs font-bold text-[#A5B4FC]">{index + 1}</div>
                  <div>
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-[#858BA0]">{description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#C7CBFF]">
              Built for local workflows <ChevronRight size={16} aria-hidden />
            </div>
          </div>

          <div className="min-w-0">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#090B15] shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-[#F87171]" aria-hidden />
                  <span className="size-2.5 rounded-full bg-[#FBBF24]" aria-hidden />
                  <span className="size-2.5 rounded-full bg-[#34D399]" aria-hidden />
                  <span className="ml-2 text-[11px] font-medium text-[#73798F]">component-vault</span>
                </div>
                <button type="button" onClick={() => void copyCommand()} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] text-[#858BA0] hover:bg-white/5 hover:text-white" aria-label="Copy CLI command">
                  <Copy size={13} aria-hidden />{copied ? "Copied" : "Copy"}
                </button>
              </div>

              <div className="flex flex-wrap gap-2 border-b border-white/10 p-3">
                {commands.map((item) => (
                  <button key={item} type="button" onClick={() => setCommand(item)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${command === item ? "bg-[#6366F1] text-white" : "bg-white/[0.05] text-[#9297AE] hover:bg-white/[0.09] hover:text-white"}`}>
                    {item}
                  </button>
                ))}
              </div>

              <div className="min-h-[300px] p-5 font-mono text-[12px] leading-7 sm:text-[13px]">
                <div className="text-[#8B91A7]"><span className="text-[#A5B4FC]">$</span> {commandText}</div>
                {command === "analyze" ? (
                  <>
                    <div className="mt-3 text-[#C7CBFF]">Analyzing semantic roles and component coverage...</div>
                    <div className="text-[#6EE7B7]">✓ Component sources scanned</div>
                    <div className="text-[#6EE7B7]">✓ Public semantic API analyzed</div>
                    <div className="text-[#8B91A7]">→ Governance coverage calculated</div>
                    <div className="mt-3 text-[#D5D8E4]">Files analyzed: 42</div>
                    <div className="text-[#D5D8E4]">Semantic findings: 0</div>
                  </>
                ) : command === "check" ? (
                  <>
                    <div className="mt-3 text-[#C7CBFF]">Checking governance and semantic policies...</div>
                    <div className="text-[#6EE7B7]">✓ Configuration loaded</div>
                    <div className="text-[#6EE7B7]">✓ Component rules validated</div>
                    <div className="mt-2 text-[#FBBF24]">⚠ 2 violations found</div>
                    <div className="mt-1 text-[#D5D8E4]">Button</div>
                    <div className="pl-4 text-[#9297AE]">└─ Invalid semantic usage</div>
                    <div className="text-[#D5D8E4]">Text</div>
                    <div className="pl-4 text-[#9297AE]">└─ Unapproved variant</div>
                  </>
                ) : (
                  <>
                    <div className="mt-3 text-[#C7CBFF]">Applying supported semantic corrections...</div>
                    <div className="text-[#6EE7B7]">✓ Safe replacements applied</div>
                    <div className="text-[#8B91A7]">→ Run component-vault check to verify</div>
                  </>
                )}
                <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3 text-[#6EE7B7]">
                  <Check size={13} aria-hidden />
                  {command === "check" ? "2 issues found" : "Done"}
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-[11px] text-[#73798F]">Analyze → check → fix. The same governance model can run locally and in CI.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
