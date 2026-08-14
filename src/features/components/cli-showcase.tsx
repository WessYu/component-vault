"use client";

import { Check, ChevronRight, Copy, Terminal, X } from "lucide-react";
import { useState } from "react";

const commands = ["analyze", "check", "fix"] as const;

type Command = (typeof commands)[number];

export function CliShowcase() {
  const [command, setCommand] = useState<Command>("check");
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
    <section aria-labelledby="cli-showcase-title" className="relative overflow-hidden rounded-[30px] border border-[#DDE1F4] bg-[#111426] text-white shadow-[0_28px_90px_rgba(23,26,43,0.16)]">
      <div className="absolute -right-24 -top-24 size-72 rounded-full bg-[#6366F1]/20 blur-3xl" aria-hidden />
      <div className="absolute -bottom-32 left-1/3 size-80 rounded-full bg-[#818CF8]/10 blur-3xl" aria-hidden />

      <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)] lg:gap-10 lg:p-10">
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#C7CBFF]">
            <Terminal size={13} aria-hidden />
            Component Vault CLI
          </div>

          <h2 id="cli-showcase-title" className="mt-5 max-w-xl text-3xl font-bold tracking-[-0.04em] sm:text-4xl lg:text-[46px] lg:leading-[1.02]">
            Governance that runs where developers work.
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-[#B9BDD0] sm:text-base">
            Take Component Vault beyond the dashboard. Analyze your component system, validate governance rules and apply safe fixes directly from the terminal.
          </p>

          <div className="mt-7 grid gap-2 sm:grid-cols-3">
            {[
              ["Analyze", "Understand the component API"],
              ["Validate", "Catch governance violations"],
              ["Fix", "Apply guided corrections"],
            ].map(([title, description]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.045] p-3.5">
                <div className="flex items-center gap-2 text-sm font-semibold"><Check size={15} className="text-[#A5B4FC]" aria-hidden />{title}</div>
                <p className="mt-1.5 text-xs leading-5 text-[#9297AE]">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-7 inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#C7CBFF]">
            Built for local workflows <ChevronRight size={16} aria-hidden />
          </div>
        </div>

        <div className="min-w-0 self-center">
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

            <div className="min-h-[270px] p-5 font-mono text-[12px] leading-7 sm:text-[13px]">
              <div className="text-[#8B91A7]"><span className="text-[#A5B4FC]">$</span> {commandText}</div>
              {command === "analyze" ? (
                <>
                  <div className="mt-3 text-[#C7CBFF]">Scanning component sources...</div>
                  <div className="text-[#6EE7B7]">✓ 42 components discovered</div>
                  <div className="text-[#6EE7B7]">✓ Public APIs extracted</div>
                  <div className="text-[#8B91A7]">→ 7 component groups</div>
                </>
              ) : command === "check" ? (
                <>
                  <div className="mt-3 text-[#C7CBFF]">Loading governance configuration...</div>
                  <div className="text-[#6EE7B7]">✓ Configuration loaded</div>
                  <div className="text-[#6EE7B7]">✓ 42 components analyzed</div>
                  <div className="mt-2 text-[#FBBF24]">⚠ 2 violations found</div>
                  <div className="mt-1 text-[#D5D8E4]">Button</div>
                  <div className="pl-4 text-[#9297AE]">└─ Invalid variant usage</div>
                  <div className="text-[#D5D8E4]">Card</div>
                  <div className="pl-4 text-[#9297AE]">└─ Missing required token</div>
                </>
              ) : (
                <>
                  <div className="mt-3 text-[#C7CBFF]">Preparing safe corrections...</div>
                  <div className="text-[#6EE7B7]">✓ 2 fixes available</div>
                  <div className="text-[#6EE7B7]">✓ Changes applied</div>
                  <div className="text-[#8B91A7]">→ Run check to verify</div>
                </>
              )}
              <div className="mt-4 border-t border-white/10 pt-3 text-[#6EE7B7]">{command === "check" ? "2 issues found" : "Done"}</div>
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] text-[#73798F]">A developer-first workflow for keeping component systems consistent.</p>
        </div>
      </div>
    </section>
  );
}
