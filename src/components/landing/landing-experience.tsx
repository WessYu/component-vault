"use client";

import Link from "next/link";
import { ArrowRight, Check, Code2, Layers3, MousePointer2, Play, SlidersHorizontal, Sparkles, WandSparkles } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ComponentPreview } from "@/components/detail/component-preview";
import { Magnetic, Reveal, RouteProgress, SiteMotionLayer, StaggerGroup, StaggerItem, motionEase } from "@/components/motion/site-motion";
import { demoComponents } from "@/services/demo-data";

const storyCards = [
  {
    index: "01",
    eyebrow: "Discover visually",
    title: "A library that behaves like a playground.",
    description: "Browse real previews instead of guessing from names. Every card reacts, reveals states and opens into a focused workspace.",
    accent: "#6366F1",
  },
  {
    index: "02",
    eyebrow: "Shape every state",
    title: "Change props and watch the interface respond.",
    description: "Switch viewport, density, loading and content while transitions preserve context and make every change easy to understand.",
    accent: "#51C89B",
  },
  {
    index: "03",
    eyebrow: "Keep implementation close",
    title: "Move from preview to code without losing the flow.",
    description: "Code, usage, accessibility and notes appear exactly when needed, without turning the experience into a dense dashboard.",
    accent: "#E978D4",
  },
];

const featureItems = [
  { title: "Live component states", description: "Preview loading, error, empty and responsive states in the same visual surface.", icon: Play, accent: "#6366F1" },
  { title: "Interactive prop controls", description: "Tune component behavior and content with immediate visual feedback.", icon: SlidersHorizontal, accent: "#51C89B" },
  { title: "Code that stays connected", description: "Keep implementation, usage and documentation beside the component.", icon: Code2, accent: "#E978D4" },
];

export function LandingExperience() {
  const pricing = demoComponents.find((component) => component.slug === "pricing-card") ?? demoComponents[0];
  const table = demoComponents.find((component) => component.slug === "table-data-grid") ?? demoComponents[0];
  const motionExperience = demoComponents.find((component) => component.slug === "card-stack-navigator") ?? pricing;
  const storyRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: storyRef, offset: ["start start", "end end"] });
  const railX = useTransform(scrollYProgress, [0, 1], ["0%", "-66%"]);
  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <main className="relative isolate min-h-dvh overflow-x-clip bg-[#F7F8FC] text-[#171A2B]">
      <SiteMotionLayer tone="landing" />
      <RouteProgress />

      <div className="relative z-10">
        <motion.header
          className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5"
          initial={reduceMotion ? false : { opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: motionEase }}
        >
          <Link href="/" className="group flex items-center gap-3">
            <motion.span
              className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#9A78FF] text-white shadow-lg shadow-indigo-200"
              whileHover={reduceMotion ? undefined : { rotate: -7, scale: 1.06 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
            >
              <Layers3 size={20} aria-hidden />
            </motion.span>
            <span className="font-bold tracking-[-0.02em]">Component Vault</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/login" className="hidden min-h-10 items-center rounded-2xl px-4 text-sm font-semibold text-[#6D7285] transition hover:text-[#171A2B] sm:inline-flex">
              Login
            </Link>
            <Magnetic>
              <Link href="/vault/components" className="group inline-flex min-h-10 items-center gap-2 rounded-2xl bg-[#171A2B] px-4 text-sm font-semibold text-white shadow-lg shadow-[#171A2B]/10 transition hover:-translate-y-0.5">
                Explore vault
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" size={16} aria-hidden />
              </Link>
            </Magnetic>
          </nav>
        </motion.header>

        <section className="mx-auto grid min-h-[calc(100dvh-80px)] max-w-7xl items-center gap-14 px-5 py-12 lg:grid-cols-[0.88fr_1.12fr] lg:py-20">
          <div>
            <motion.p
              className="inline-flex items-center gap-2 rounded-full border border-[#E4E7EF] bg-white/82 px-3 py-1 text-sm font-medium text-[#6366F1] shadow-sm backdrop-blur"
              initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.08, ease: motionEase }}
            >
              <Sparkles size={15} aria-hidden />
              Visual Component Playground
            </motion.p>
            <motion.h1
              className="mt-6 max-w-3xl text-5xl font-bold tracking-[-0.06em] md:text-7xl"
              initial={reduceMotion ? false : { opacity: 0, y: 28, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.72, delay: 0.12, ease: motionEase }}
            >
              Build once.
              <span className="relative block w-fit text-[#6366F1]">
                Reuse everywhere.
                <motion.span
                  className="absolute -bottom-2 left-0 h-1.5 w-full origin-left rounded-full bg-gradient-to-r from-[#6366F1] via-[#9A78FF] to-[#E978D4]"
                  initial={reduceMotion ? false : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.75, delay: 0.55, ease: motionEase }}
                />
              </span>
            </motion.h1>
            <motion.p
              className="mt-7 max-w-2xl text-lg leading-8 text-[#6D7285]"
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.58, delay: 0.24, ease: motionEase }}
            >
              A living workspace to save, test, document and reuse the interface pieces behind your products.
            </motion.p>
            <motion.div
              className="mt-8 flex flex-wrap gap-3"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.32, ease: motionEase }}
            >
              <Magnetic>
                <Link href="/vault/components" className="group inline-flex min-h-12 items-center gap-2 rounded-2xl bg-[#6366F1] px-5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:shadow-xl hover:shadow-indigo-200">
                  Start exploring <ArrowRight className="transition-transform group-hover:translate-x-1" size={17} aria-hidden />
                </Link>
              </Magnetic>
              <Link href="/vault/components/card-stack-navigator" className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-[#E4E7EF] bg-white/84 px-5 text-sm font-bold text-[#171A2B] shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-[#D4D8E3]">
                See motion experiences
              </Link>
            </motion.div>
            <motion.div
              className="mt-8 flex flex-wrap gap-4 text-sm text-[#6D7285]"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.42 }}
            >
              {["Live previews", "Motion patterns", "Props editor"].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <Check size={15} className="text-[#51C89B]" aria-hidden />
                  {item}
                </span>
              ))}
            </motion.div>
          </div>

          <motion.div
            className="relative [perspective:1400px]"
            initial={reduceMotion ? false : { opacity: 0, x: 34, rotateY: -7 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.18, ease: motionEase }}
          >
            <motion.div
              className="absolute -left-5 top-20 z-20 hidden items-center rounded-2xl border border-[#E4E7EF] bg-white/92 px-4 py-3 text-sm font-semibold shadow-2xl shadow-[#171A2B]/12 backdrop-blur md:flex"
              animate={reduceMotion ? undefined : { y: [0, -7, 0] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <MousePointer2 size={16} className="mr-2 text-[#6366F1]" aria-hidden />
              Selected: Card Stack
            </motion.div>
            <motion.div
              className="absolute -right-5 bottom-16 z-20 hidden rounded-2xl border border-[#E4E7EF] bg-[#171A2B] px-4 py-3 text-xs font-medium text-white shadow-2xl md:block"
              animate={reduceMotion ? undefined : { y: [0, 8, 0], rotate: [0, 1, 0] }}
              transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
            >
              Props updated in real time
            </motion.div>

            <motion.div
              className="rounded-[38px] border border-white/70 bg-white/72 p-4 shadow-[0_45px_120px_rgba(23,26,43,0.16)] backdrop-blur-xl"
              whileHover={reduceMotion ? undefined : { rotateX: 1.2, rotateY: -1.2, y: -4 }}
              transition={{ type: "spring", stiffness: 180, damping: 22 }}
            >
              <div className="mb-4 flex items-center gap-2 rounded-2xl border border-[#E4E7EF] bg-white px-4 py-3">
                <span className="size-2.5 rounded-full bg-[#FF7664]" />
                <span className="size-2.5 rounded-full bg-[#F1BE48]" />
                <span className="size-2.5 rounded-full bg-[#51C89B]" />
                <span className="ml-3 text-xs font-medium text-[#9A9FB1]">component-vault / playground</span>
              </div>
              <div className="grid gap-4 lg:grid-cols-[1fr_230px]">
                <div className="space-y-4">
                  <ComponentPreview component={motionExperience} compact />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <ComponentPreview component={pricing} compact />
                    <ComponentPreview component={table} compact />
                  </div>
                </div>
                <div className="rounded-[28px] border border-[#E4E7EF] bg-white p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold">Properties</h3>
                    <span className="rounded-full bg-[#EEF0FF] px-2 py-1 text-xs font-bold text-[#6366F1]">Live</span>
                  </div>
                  <div className="mt-5 space-y-4">
                    {["motion", "depth", "snap", "reducedMotion"].map((item, index) => (
                      <motion.div
                        key={item}
                        className="rounded-2xl border border-[#E4E7EF] bg-[#F7F8FC] p-3"
                        animate={reduceMotion ? undefined : { borderColor: index === 1 ? ["#E4E7EF", "#9A78FF", "#E4E7EF"] : "#E4E7EF" }}
                        transition={{ duration: 3.4, repeat: Infinity, delay: index * 0.2 }}
                      >
                        <span className="text-xs font-medium text-[#9A9FB1]">{item}</span>
                        <div className="mt-2 h-2 rounded-full bg-white shadow-inner">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-[#6366F1] to-[#E978D4]"
                            initial={{ width: `${38 + index * 11}%` }}
                            animate={reduceMotion ? undefined : { width: [`${38 + index * 11}%`, `${62 + index * 7}%`, `${38 + index * 11}%`] }}
                            transition={{ duration: 4.4, repeat: Infinity, delay: index * 0.28, ease: "easeInOut" }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        <section ref={storyRef} className="relative hidden h-[310vh] lg:block">
          <div className="sticky top-0 flex h-dvh items-center overflow-hidden">
            <div className="absolute left-8 top-8 z-20 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#9A9FB1]">
              <span>Scroll through the workflow</span>
              <span className="h-px w-24 bg-[#D4D8E3]">
                <motion.span className="block h-full origin-left bg-[#6366F1]" style={{ scaleX: progressScale }} />
              </span>
            </div>
            <motion.div className="flex w-[300vw] gap-8 px-[8vw]" style={{ x: railX }}>
              {storyCards.map((card, index) => {
                const preview = index === 0 ? motionExperience : index === 1 ? table : pricing;
                return (
                  <article key={card.index} className="grid h-[72vh] w-[84vw] shrink-0 grid-cols-[0.78fr_1.22fr] items-center gap-12 rounded-[44px] border border-white/70 bg-white/74 p-10 shadow-[0_38px_110px_rgba(23,26,43,0.1)] backdrop-blur-xl">
                    <div>
                      <span className="font-mono text-sm font-bold" style={{ color: card.accent }}>{card.index}</span>
                      <p className="mt-5 text-sm font-semibold uppercase tracking-[0.15em] text-[#9A9FB1]">{card.eyebrow}</p>
                      <h2 className="mt-4 max-w-xl text-5xl font-bold tracking-[-0.055em]">{card.title}</h2>
                      <p className="mt-5 max-w-xl text-lg leading-8 text-[#6D7285]">{card.description}</p>
                      <div className="mt-8 inline-flex items-center gap-2 text-sm font-bold" style={{ color: card.accent }}>
                        Explore the pattern <ArrowRight size={16} aria-hidden />
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute -inset-10 rounded-full opacity-40 blur-3xl" style={{ background: card.accent }} />
                      <div className="relative rounded-[36px] border border-[#E4E7EF] bg-white p-5 shadow-2xl shadow-[#171A2B]/10">
                        <ComponentPreview component={preview} />
                      </div>
                    </div>
                  </article>
                );
              })}
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 lg:hidden">
          <StaggerGroup className="space-y-5">
            {storyCards.map((card, index) => (
              <StaggerItem key={card.index}>
                <article className="rounded-[32px] border border-[#E4E7EF] bg-white/82 p-6 shadow-lg shadow-[#171A2B]/5 backdrop-blur">
                  <span className="font-mono text-sm font-bold" style={{ color: card.accent }}>{card.index}</span>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.15em] text-[#9A9FB1]">{card.eyebrow}</p>
                  <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">{card.title}</h2>
                  <p className="mt-3 leading-7 text-[#6D7285]">{card.description}</p>
                  <div className="mt-6"><ComponentPreview component={index === 0 ? motionExperience : index === 1 ? table : pricing} compact /></div>
                </article>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-24">
          <Reveal>
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6366F1]">A system with a pulse</p>
                <h2 className="mt-3 max-w-3xl text-4xl font-bold tracking-[-0.045em] md:text-6xl">Motion that explains, guides and rewards interaction.</h2>
              </div>
              <WandSparkles className="hidden text-[#9A78FF] md:block" size={42} aria-hidden />
            </div>
          </Reveal>
          <StaggerGroup className="grid gap-5 md:grid-cols-3">
            {featureItems.map((feature) => {
              const Icon = feature.icon;
              return (
                <StaggerItem key={feature.title}>
                  <motion.article
                    className="group relative min-h-[260px] overflow-hidden rounded-[32px] border border-[#E4E7EF] bg-white/82 p-6 shadow-[0_22px_80px_rgba(23,26,43,0.06)] backdrop-blur"
                    whileHover={reduceMotion ? undefined : { y: -7, rotate: -0.35 }}
                    transition={{ type: "spring", stiffness: 250, damping: 21 }}
                  >
                    <div className="absolute -right-14 -top-14 size-40 rounded-full opacity-10 blur-2xl transition-transform duration-500 group-hover:scale-125" style={{ background: feature.accent }} />
                    <span className="relative grid size-12 place-items-center rounded-2xl text-white shadow-lg" style={{ background: feature.accent }}>
                      <Icon size={21} aria-hidden />
                    </span>
                    <h3 className="relative mt-8 text-xl font-bold tracking-[-0.025em]">{feature.title}</h3>
                    <p className="relative mt-3 leading-7 text-[#6D7285]">{feature.description}</p>
                    <motion.div className="relative mt-7 h-1.5 overflow-hidden rounded-full bg-[#F2F4FA]" whileHover="hover">
                      <motion.span className="block h-full origin-left rounded-full" style={{ background: feature.accent }} initial={{ scaleX: 0.28 }} whileInView={{ scaleX: 0.78 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: motionEase }} />
                    </motion.div>
                  </motion.article>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-16">
          <Reveal>
            <div className="relative overflow-hidden rounded-[42px] bg-[#171A2B] p-8 text-white shadow-[0_45px_120px_rgba(23,26,43,0.25)] md:p-14">
              <div className="absolute -right-24 -top-28 size-80 rounded-full bg-[#6366F1]/40 blur-3xl" />
              <div className="absolute -bottom-28 left-[35%] size-72 rounded-full bg-[#E978D4]/20 blur-3xl" />
              <div className="relative max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#A8ABFF]">Your component system, alive</p>
                <h2 className="mt-4 text-4xl font-bold tracking-[-0.045em] md:text-6xl">Stop browsing static cards. Start exploring behavior.</h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/65">Open the vault, interact with motion experiences and shape reusable interfaces without losing visual context.</p>
                <Magnetic className="mt-8 w-fit">
                  <Link href="/vault/components" className="group inline-flex min-h-12 items-center gap-2 rounded-2xl bg-white px-5 text-sm font-bold text-[#171A2B]">
                    Open Component Vault <ArrowRight className="transition-transform group-hover:translate-x-1" size={17} aria-hidden />
                  </Link>
                </Magnetic>
              </div>
            </div>
          </Reveal>
        </section>
      </div>
    </main>
  );
}
