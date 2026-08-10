"use client";

import Link from "next/link";
import { ArrowRight, Bot, Check, CircleDot, FileCode2, GitPullRequest, TerminalSquare, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const rules = [
  { id: "CV001", title: "Direct component import", text: "Blocks imports that bypass the governed component API." },
  { id: "CV002", title: "Protected prop override", text: "Catches visual props that should stay inside the design-system contract." },
  { id: "CV003", title: "Raw semantic JSX", text: "Finds raw HTML where a governed semantic variant should be used." },
  { id: "CV004", title: "Repeated static style", text: "Highlights repeated class combinations that should become reusable primitives." },
  { id: "CV005", title: "Forbidden pattern", text: "Lets teams add repository-specific patterns directly from YAML." },
];

const strategies = [
  ["protect", "Accept known legacy debt and block new violations."],
  ["touched", "Require migration when a legacy file is changed."],
  ["full", "Block every governed violation."],
];

export function GuardOverview() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[#171A2B] px-5 py-24 text-white md:py-32">
      <div className="absolute -left-40 top-20 size-[32rem] rounded-full bg-[#6366F1]/20 blur-3xl" />
      <div className="absolute -right-40 bottom-0 size-[30rem] rounded-full bg-[#E978D4]/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-semibold text-[#A8ABFF]"
            >
              <ShieldCheck size={15} aria-hidden /> Component Vault Guard
            </motion.div>
            <h2 className="mt-6 max-w-3xl text-4xl font-bold tracking-[-0.055em] md:text-6xl">
              Your design system should be a contract, not a suggestion.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
              An AST-based governance layer for TypeScript and React projects. Define the rules in YAML, scan real code structures and enforce the result locally, in CI and alongside AI-assisted development.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/vault/guard" className="group inline-flex min-h-12 items-center gap-2 rounded-2xl bg-white px-5 text-sm font-bold text-[#171A2B] transition hover:-translate-y-0.5">
                Open Guard dashboard <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
              <a href="https://www.npmjs.com/package/@wess2001/component-vault" target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-white/15 px-5 text-sm font-bold text-white/85 transition hover:bg-white/5">
                View npm package
              </a>
            </div>
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24, rotateX: 5 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.65 }}
            className="overflow-hidden rounded-[30px] border border-white/10 bg-[#0F1120] shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
              <span className="size-2.5 rounded-full bg-[#FF7664]" />
              <span className="size-2.5 rounded-full bg-[#F1BE48]" />
              <span className="size-2.5 rounded-full bg-[#51C89B]" />
              <span className="ml-3 font-mono text-xs text-white/35">component-vault / terminal</span>
            </div>
            <div className="space-y-4 p-6 font-mono text-sm leading-7">
              <div className="text-white/45">$ npx component-vault scan</div>
              <div className="rounded-2xl border border-[#FF7664]/20 bg-[#FF7664]/5 p-4">
                <div className="text-[#FF9A8D]">[CV003] Raw semantic element</div>
                <div className="mt-1 text-white/45">src/components/Card.tsx:18:5</div>
                <div className="mt-2 text-white/70">Raw &lt;h1&gt; detected in governed JSX.</div>
                <div className="mt-2 text-[#A8ABFF]">→ Use &lt;Text.H1&gt; instead.</div>
              </div>
              <div className="flex items-center gap-2 text-[#51C89B]"><Check size={15} /> Component Vault: 1 violation found.</div>
            </div>
          </motion.div>
        </div>

        <div className="mt-20 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 lg:col-span-1">
            <FileCode2 className="text-[#A8ABFF]" size={22} aria-hidden />
            <h3 className="mt-6 text-xl font-bold">AST, not guesswork</h3>
            <p className="mt-3 leading-7 text-white/55">The Guard uses the TypeScript Compiler API to reason about imports, JSX nodes and properties as code structures.</p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
            <TerminalSquare className="text-[#51C89B]" size={22} aria-hidden />
            <h3 className="mt-6 text-xl font-bold">YAML is the source of truth</h3>
            <p className="mt-3 leading-7 text-white/55">Governance lives in the repository, not inside a coding agent. Rules stay reviewable, deterministic and portable.</p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
            <Bot className="text-[#E978D4]" size={22} aria-hidden />
            <h3 className="mt-6 text-xl font-bold">Ready for AI-assisted code</h3>
            <p className="mt-3 leading-7 text-white/55">Agents can write code. The repository still decides what is allowed, and the Guard verifies the result.</p>
          </div>
        </div>

        <div className="mt-20">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A8ABFF]">Governance rules</p>
              <h3 className="mt-3 text-3xl font-bold tracking-[-0.04em]">Small rules. Enforceable behavior.</h3>
            </div>
            <CircleDot className="hidden text-white/20 md:block" size={34} aria-hidden />
          </div>
          <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            {rules.map((rule) => (
              <div key={rule.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <span className="font-mono text-xs font-bold text-[#A8ABFF]">{rule.id}</span>
                <h4 className="mt-3 font-bold">{rule.title}</h4>
                <p className="mt-2 text-sm leading-6 text-white/45">{rule.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A8ABFF]">Brownfield migration</p>
            <h3 className="mt-3 text-3xl font-bold tracking-[-0.04em]">Adopt governance without rewriting everything.</h3>
            <p className="mt-4 max-w-xl leading-7 text-white/55">Capture existing debt once, then move toward stronger enforcement as the codebase improves.</p>
          </div>
          <div className="space-y-3">
            {strategies.map(([name, text], index) => (
              <motion.div key={name} whileHover={reduceMotion ? undefined : { x: 5 }} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/5 font-mono text-xs text-white/50">0{index + 1}</span>
                <div><strong className="font-mono text-[#A8ABFF]">{name}</strong><p className="mt-1 text-sm text-white/50">{text}</p></div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-20 rounded-[30px] border border-white/10 bg-white/[0.04] p-6 md:p-8">
          <div className="flex items-start gap-4">
            <GitPullRequest className="mt-1 shrink-0 text-[#51C89B]" size={22} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">Install the Guard</p>
              <div className="mt-4 overflow-x-auto rounded-2xl bg-[#0F1120] p-5 font-mono text-sm text-white/70">
                <div><span className="text-[#51C89B]">$</span> npm install -D @wess2001/component-vault</div>
                <div className="mt-2"><span className="text-[#51C89B]">$</span> npx component-vault init --ci</div>
                <div className="mt-2"><span className="text-[#51C89B]">$</span> npx component-vault scan</div>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/40">The CLI is published on npm as <span className="font-mono text-white/65">@wess2001/component-vault</span> and exposes the <span className="font-mono text-white/65">component-vault</span> command.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
