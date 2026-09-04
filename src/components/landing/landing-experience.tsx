"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleCheck,
  Code2,
  ExternalLink,
  FileJson2,
  GitPullRequest,
  ScanSearch,
  ShieldCheck,
  Terminal,
  WandSparkles,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { BrandMark } from "@/components/brand/brand-mark";
import { Reveal, RouteProgress, StaggerGroup, StaggerItem, motionEase } from "@/components/motion/site-motion";

const proofSteps = [
  { command: "discover", result: "2 candidates", tone: "text-[#AFA4FF]" },
  { command: "scan", result: "3 blocking CV006", tone: "text-[#FF9C8F]" },
  { command: "report", result: "JSON written", tone: "text-[#F5C86B]" },
  { command: "fix --dry-run", result: "0 files changed", tone: "text-[#AFA4FF]" },
  { command: "fix", result: "8 safe edits", tone: "text-[#6FE0B2]" },
  { command: "scan", result: "clean", tone: "text-[#6FE0B2]" },
];

const surfaces = [
  {
    index: "01",
    title: "A contract in the repository",
    description: "Components, semantic roles, protected props and migration strategy live in reviewable YAML beside the code.",
    icon: Code2,
    detail: "component-vault.yaml",
  },
  {
    index: "02",
    title: "The same engine everywhere",
    description: "Local scans, pull-request gates, JSON reports and the programmatic API use the same deterministic AST analysis.",
    icon: GitPullRequest,
    detail: "CLI · CI · API",
  },
  {
    index: "03",
    title: "A workspace for the result",
    description: "Review findings, migration progress and governed components in a product surface built around the Guard workflow.",
    icon: ScanSearch,
    detail: "Guard dashboard",
  },
];

const capabilities = [
  ["CV001", "Import boundaries"],
  ["CV002", "Protected properties"],
  ["CV003", "Raw governed JSX"],
  ["CV004", "Repeated styles"],
  ["CV005", "Repository patterns"],
  ["CV006", "Semantic mappings"],
];

export function LandingExperience() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="min-h-dvh overflow-x-clip bg-[#0A0B10] text-[#F4F2EC]">
      <RouteProgress />

      <header className="relative z-20 border-b border-white/10 bg-[#0A0B10]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Component Vault home">
            <BrandMark size="sm" className="rounded-lg shadow-none" />
            <span className="text-sm font-semibold tracking-[-0.02em]">Component Vault</span>
            <span className="hidden rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] text-white/45 sm:inline">v0.6.0</span>
          </Link>
          <nav className="flex items-center gap-1" aria-label="Primary navigation">
            <a href="#proof" className="hidden min-h-10 items-center px-3 text-sm text-white/55 transition hover:text-white sm:inline-flex">Proof</a>
            <a href="https://github.com/WessYu/component-vault" target="_blank" rel="noreferrer" className="hidden min-h-10 items-center gap-1.5 px-3 text-sm text-white/55 transition hover:text-white md:inline-flex">
              Source <ExternalLink size={13} aria-hidden />
            </a>
            <Link href="/vault/guard" className="ml-2 inline-flex min-h-10 items-center gap-2 rounded-full bg-[#F4F2EC] px-4 text-sm font-semibold text-[#0A0B10] transition hover:bg-white">
              Open Guard <ArrowRight size={15} aria-hidden />
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute left-[-12rem] top-[-10rem] size-[32rem] rounded-full bg-[#705CF6]/15 blur-[110px]" />
          <div className="absolute bottom-[-18rem] right-[-12rem] size-[38rem] rounded-full bg-[#53D6A5]/8 blur-[130px]" />
          <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
        </div>

        <div className="relative mx-auto grid max-w-[1440px] gap-14 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20 lg:py-36">
          <div>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: motionEase }}
              className="inline-flex items-center gap-2 rounded-full border border-[#8877FF]/35 bg-[#8877FF]/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[#B7ADFF]"
            >
              <ShieldCheck size={14} aria-hidden /> Deterministic design-system governance
            </motion.div>
            <motion.h1
              initial={reduceMotion ? false : { opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.08, ease: motionEase }}
              className="mt-7 max-w-4xl text-[clamp(3.5rem,7vw,7.3rem)] font-semibold leading-[0.9] tracking-[-0.075em]"
            >
              Your design system,
              <span className="block text-white/38">enforced as code.</span>
            </motion.h1>
            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.18, ease: motionEase }}
              className="mt-8 max-w-2xl text-lg leading-8 text-white/58 md:text-xl"
            >
              Component Vault turns repository-owned component rules into AST checks, conservative fixes and pull-request gates for React codebases.
            </motion.p>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.26, ease: motionEase }}
              className="mt-9 flex flex-col gap-3 sm:flex-row"
            >
              <a href="#proof" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#806CFF] px-5 text-sm font-semibold text-white transition hover:bg-[#907FFF]">
                See the reproducible proof <ArrowRight size={16} aria-hidden />
              </a>
              <a href="https://www.npmjs.com/package/@wess2001/component-vault" target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-5 text-sm font-semibold text-white/78 transition hover:border-white/30 hover:text-white">
                View package on npm <ExternalLink size={14} aria-hidden />
              </a>
            </motion.div>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.34 }}
              className="mt-8 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.08em] text-white/38"
            >
              <span>TypeScript compiler API</span>
              <span>JS · JSX · TS · TSX</span>
              <span>No model at enforcement time</span>
            </motion.div>
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: 28, rotateY: -3 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease: motionEase }}
            className="relative [perspective:1200px]"
          >
            <div className="absolute -inset-6 rounded-[2.5rem] bg-[#806CFF]/10 blur-3xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/12 bg-[#101117] shadow-[0_36px_120px_rgba(0,0,0,.55)]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-[#FF7D70]" />
                  <span className="size-2 rounded-full bg-[#F5C86B]" />
                  <span className="size-2 rounded-full bg-[#6FE0B2]" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/30">verified fixture · react/vite</span>
              </div>
              <div className="p-5 md:p-7">
                <div className="font-mono text-xs text-white/42"><span className="text-[#6FE0B2]">$</span> npm run demo:proof</div>
                <div className="mt-6 space-y-1">
                  {proofSteps.map((step, index) => (
                    <motion.div
                      key={`${step.command}-${index}`}
                      initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: 0.38 + index * 0.06 }}
                      className="grid grid-cols-[24px_minmax(0,1fr)] items-center gap-2 border-b border-white/[0.06] py-3 font-mono text-xs sm:grid-cols-[24px_minmax(0,1fr)_auto]"
                    >
                      <span className="text-white/20">0{index + 1}</span>
                      <span className="text-white/68">component-vault {step.command}</span>
                      <span className={`${step.tone} col-start-2 sm:col-start-auto`}>{step.result}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between rounded-2xl border border-[#6FE0B2]/25 bg-[#6FE0B2]/[0.07] px-4 py-3">
                  <span className="flex items-center gap-2 text-sm font-medium text-[#93EBC8]"><CircleCheck size={16} aria-hidden /> Proof passed</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#93EBC8]/65">build green</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#F1EFE8] text-[#121318]">
        <div className="mx-auto max-w-[1440px] px-5 py-20 md:px-8 md:py-28">
          <Reveal className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#6653E4]">One policy model</p>
              <h2 className="mt-4 text-4xl font-semibold leading-[0.98] tracking-[-0.055em] md:text-6xl">Not another component gallery.</h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-[#5E6069] lg:justify-self-end">
              The library is the review surface. The product is the contract connecting repository policy, developer workflow and migration evidence.
            </p>
          </Reveal>

          <StaggerGroup className="mt-14 grid border-l border-t border-[#C9C6BD] md:grid-cols-3">
            {surfaces.map((surface) => {
              const Icon = surface.icon;
              return (
                <StaggerItem key={surface.index} className="h-full">
                  <article className="flex h-full min-h-[330px] flex-col border-b border-r border-[#C9C6BD] p-6 md:p-8">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-[#878982]">/{surface.index}</span>
                      <Icon size={20} className="text-[#6653E4]" aria-hidden />
                    </div>
                    <h3 className="mt-16 max-w-xs text-2xl font-semibold tracking-[-0.035em]">{surface.title}</h3>
                    <p className="mt-4 max-w-sm leading-7 text-[#696B72]">{surface.description}</p>
                    <div className="mt-auto pt-8 font-mono text-[11px] uppercase tracking-[0.12em] text-[#6653E4]">{surface.detail}</div>
                  </article>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </div>
      </section>

      <section id="proof" className="scroll-mt-16 border-b border-white/10">
        <div className="mx-auto max-w-[1440px] px-5 py-20 md:px-8 md:py-28">
          <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#AFA4FF]">Committed fixture · packaged CLI</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] md:text-6xl">Show the failure. Prove the fix.</h2>
            </div>
            <a href="https://github.com/WessYu/component-vault/tree/master/examples/react-vite" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 self-start border-b border-white/25 text-sm font-medium text-white/70 transition hover:border-white hover:text-white md:self-auto">
              Inspect the fixture <ExternalLink size={14} aria-hidden />
            </a>
          </Reveal>

          <div className="mt-14 grid gap-px overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/10 lg:grid-cols-2">
            <div className="bg-[#0E0F14] p-5 md:p-8">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-white/42">src/App.tsx · before (excerpt)</span>
                <span className="rounded-full border border-[#FF7D70]/25 bg-[#FF7D70]/8 px-2.5 py-1 font-mono text-[10px] text-[#FF9C8F]">3 findings</span>
              </div>
              <pre className="mt-8 overflow-x-auto font-mono text-[13px] leading-7 text-white/64"><code>{`<h1>Govern components without guessing</h1>
<p>Scan the native elements, preview a safe fix, and let Component Vault add only proven imports.</p>
<button type="button">Review the dry-run</button>`}</code></pre>
            </div>
            <div className="bg-[#0E0F14] p-5 md:p-8">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-white/42">src/App.tsx · after (excerpt)</span>
                <span className="rounded-full border border-[#6FE0B2]/25 bg-[#6FE0B2]/8 px-2.5 py-1 font-mono text-[10px] text-[#93EBC8]">clean scan</span>
              </div>
              <pre className="mt-8 overflow-x-auto font-mono text-[13px] leading-7 text-white/64"><code><span className="text-[#93EBC8]">{`import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
`}</span><span className="text-[#AFA4FF]">{`
<Text.H1>Govern components without guessing</Text.H1>
<Text.Paragraph>Scan the native elements, preview a safe fix, and let Component Vault add only proven imports.</Text.Paragraph>
<Button type="button">Review the dry-run</Button>`}</span></code></pre>
            </div>
          </div>

          <Reveal className="mt-6 grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5 md:grid-cols-[1fr_auto] md:items-center md:p-7">
            <div className="flex items-start gap-4">
              <FileJson2 className="mt-1 shrink-0 text-[#F5C86B]" size={20} aria-hidden />
              <div>
                <h3 className="font-semibold">The report is part of the proof.</h3>
                <p className="mt-1 text-sm leading-6 text-white/48">CI asserts 3 semantic findings are also 3 blocking report findings, preventing scan/report drift.</p>
              </div>
            </div>
            <code className="rounded-xl bg-black/25 px-4 py-3 font-mono text-xs text-[#F5C86B]">engine: typescript-ast+semantic</code>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#101117]">
        <div className="mx-auto grid max-w-[1440px] gap-14 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#AFA4FF]">Scope, stated honestly</p>
            <h2 className="mt-4 text-4xl font-semibold leading-[1] tracking-[-0.05em] md:text-5xl">Strong claims need visible boundaries.</h2>
            <p className="mt-6 max-w-xl leading-7 text-white/52">
              CV006 enforces semantic mappings defined by the repository—for example, <code className="font-mono text-[#AFA4FF]">h1 → Text.H1</code>. It supports accessibility governance, but it is not presented as a complete WCAG audit.
            </p>
            <div className="mt-8 flex items-center gap-3 text-sm text-[#93EBC8]"><Check size={16} aria-hidden /> Deterministic and testable</div>
            <div className="mt-3 flex items-center gap-3 text-sm text-white/48"><ChevronRight size={16} aria-hidden /> Repository-specific by design</div>
          </Reveal>

          <StaggerGroup className="grid gap-3 sm:grid-cols-2">
            {capabilities.map(([id, label]) => (
              <StaggerItem key={id}>
                <div className="flex min-h-20 items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.035] px-5">
                  <span className="font-mono text-xs text-[#AFA4FF]">{id}</span>
                  <span className="text-sm font-medium text-white/72">{label}</span>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section className="bg-[#806CFF] text-white">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-16 md:px-8 md:py-20 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-white/65"><Terminal size={15} aria-hidden /> Start with the actual workflow</div>
            <h2 className="mt-4 max-w-4xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] md:text-6xl">Put the contract next to the code.</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <a href="https://www.npmjs.com/package/@wess2001/component-vault" target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#36269E] transition hover:bg-[#F4F2EC]">
              Install from npm <ArrowRight size={16} aria-hidden />
            </a>
            <Link href="/vault/guard" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/30 px-5 text-sm font-semibold transition hover:bg-white/10">
              Open Guard dashboard <WandSparkles size={15} aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#0A0B10]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-5 py-7 text-sm text-white/38 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex items-center gap-3"><BrandMark size="sm" className="rounded-lg shadow-none" /><span>Component Vault · repository-owned governance</span></div>
          <div className="flex flex-wrap gap-5">
            <a className="transition hover:text-white" href="https://github.com/WessYu/component-vault" target="_blank" rel="noreferrer">GitHub</a>
            <a className="transition hover:text-white" href="https://www.npmjs.com/package/@wess2001/component-vault" target="_blank" rel="noreferrer">npm</a>
            <Link className="transition hover:text-white" href="/vault/components">Component workspace</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
