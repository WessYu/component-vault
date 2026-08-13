"use client";

import { Check, Terminal } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const commands = [
  ["npx component-vault init", "Initialize governance"],
  ["npx component-vault analyze", "Analyze semantic coverage"],
  ["npx component-vault check --base origin/master", "Enforce rules"],
  ["npx component-vault fix --dry-run", "Preview safe fixes"],
];

export function CliShowcase() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden px-5 py-24 lg:py-32" aria-labelledby="cli-showcase-title">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.12),transparent_34%),radial-gradient(circle_at_80%_70%,rgba(233,120,212,0.10),transparent_32%)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
          <motion.div initial={reduceMotion ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.65 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E4E7EF] bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#6366F1] shadow-sm backdrop-blur">
              <Terminal size={14} aria-hidden /> Developer tooling
            </div>
            <h2 id="cli-showcase-title" className="mt-6 max-w-2xl text-4xl font-bold tracking-[-0.055em] md:text-6xl">Governance that runs where developers work.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#6D7285]">
              Component Vault includes a CLI that turns repository rules into an executable development workflow. Analyze your codebase, validate semantic policies, gate changes in CI and preview deterministic fixes — without relying on an AI model to make enforcement decisions.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[["Analyze", "AST + semantic coverage"], ["Validate", "Rules and CI enforcement"], ["Fix", "Conservative autofix"], ["Explain", "Understand every finding"]].map(([title, description]) => (
                <div key={title} className="rounded-2xl border border-[#E4E7EF] bg-white/75 p-4 backdrop-blur">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#171A2B]"><Check size={15} className="text-[#51C89B]" aria-hidden />{title}</div>
                  <p className="mt-1 pl-[23px] text-xs leading-5 text-[#8A90A2]">{description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={reduceMotion ? false : { opacity: 0, x: 28 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.75, ease: "easeOut" }}>
            <div className="overflow-hidden rounded-[30px] border border-[#2B3045] bg-[#101321] shadow-[0_35px_90px_rgba(23,26,43,0.2)]">
              <div className="flex items-center gap-2 border-b border-white/8 bg-[#171A2B] px-5 py-4">
                <span className="size-2.5 rounded-full bg-[#FF7664]" /><span className="size-2.5 rounded-full bg-[#F1BE48]" /><span className="size-2.5 rounded-full bg-[#51C89B]" />
                <span className="ml-3 font-mono text-xs text-[#8F96AA]">component-vault · terminal</span>
              </div>
              <div className="p-5 font-mono text-sm leading-7 md:p-7">
                <div className="text-[#8F96AA]">$ component-vault check --base origin/master</div>
                <div className="mt-5 text-[#DCE1F2]">Component Vault Guard</div>
                <div className="mt-4 space-y-1.5"><div className="text-[#63D6A6]">✓ Configuration loaded</div><div className="text-[#63D6A6]">✓ 42 components analyzed</div><div className="text-[#63D6A6]">✓ Semantic rules validated</div></div>
                <div className="my-6 h-px bg-white/8" />
                <div className="text-[#F1BE48]">⚠ 2 violations found</div>
                <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                  <div className="text-[#DCE1F2]">› Button</div><div className="pl-5 text-[#8F96AA]">└─ Invalid variant usage</div>
                  <div className="mt-3 text-[#DCE1F2]">› Card</div><div className="pl-5 text-[#8F96AA]">└─ Missing required token</div>
                </div>
                <div className="mt-5 text-[#F1BE48]">2 issues found</div>
                <div className="mt-7 grid gap-2 border-t border-white/8 pt-5 sm:grid-cols-2">
                  {commands.map(([command, label]) => <motion.div key={command} className="rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2" whileHover={reduceMotion ? undefined : { y: -2 }}><div className="truncate text-xs text-[#C8CEE2]">$ {command}</div><div className="mt-0.5 text-[10px] text-[#777F96]">{label}</div></motion.div>)}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="mt-10 rounded-3xl border border-[#E4E7EF] bg-white/70 px-6 py-5 text-center backdrop-blur md:px-10">
          <p className="text-sm leading-6 text-[#6D7285]"><span className="font-semibold text-[#171A2B]">From rules to action.</span> Repository-owned semantics, deterministic enforcement and conservative autofix — all available from the command line.</p>
        </div>
      </div>
    </section>
  );
}
