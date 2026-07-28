"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Code2, Layers, MousePointer2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { getExperience, type ExperienceSlug, type MotionExperience } from "@/components/experiences/experience-data";
import { useActiveChapter } from "@/hooks/use-active-chapter";
import { useDragNavigation } from "@/hooks/use-drag-navigation";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useSharedComponentTransition } from "@/hooks/use-shared-component-transition";
import { useWheelNavigation } from "@/hooks/use-wheel-navigation";

const cards = ["Navigation", "Pricing", "Data Grid", "Profile", "Analytics"];

export function ExperiencePreview({ slug }: { slug: ExperienceSlug }) {
  const experience = getExperience(slug);
  if (!experience) return null;

  return (
    <button
      className="group block w-full text-left"
      aria-label={`Preview ${experience.name}`}
    >
      <div className="relative min-h-32 overflow-hidden rounded-[26px] border border-white/60 bg-white/80 p-4 shadow-[0_18px_60px_rgba(23,26,43,0.08)]">
        <MiniDemo experience={experience} />
      </div>
    </button>
  );
}

export function ExperienceWorkspace({ slug }: { slug: ExperienceSlug }) {
  const experience = getExperience(slug);
  if (!experience) return null;

  return (
    <div className="space-y-6">
      <ExperienceDemo experience={experience} />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <ExperienceDocumentation experience={experience} />
        <ExperienceProperties experience={experience} />
      </div>
    </div>
  );
}

export function ExperienceDemo({ experience }: { experience: MotionExperience }) {
  if (experience.slug === "project-chapter-scroll") return <ProjectChapterScroll experience={experience} />;
  if (experience.slug === "card-stack-navigator") return <CardStackNavigator experience={experience} />;
  if (experience.slug === "grid-to-detail-morph") return <GridToDetailMorph experience={experience} />;
  if (experience.slug === "scroll-anatomy") return <ScrollAnatomy experience={experience} />;
  if (experience.slug === "magnetic-component-rail") return <MagneticRail experience={experience} />;
  if (experience.slug === "split-story-scroll") return <SplitStoryScroll experience={experience} />;
  if (experience.slug === "component-depth-gallery") return <ComponentDepthGallery experience={experience} />;
  return <BeforeAfterScrubber experience={experience} />;
}

export function ExperienceProperties({ experience }: { experience: MotionExperience }) {
  return (
    <aside className="rounded-[32px] border border-[#E4E7EF] bg-white p-5 shadow-[0_18px_70px_rgba(23,26,43,0.05)]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-[#171A2B]">Properties</h2>
          <p className="text-sm text-[#6D7285]">Motion controls and API surface.</p>
        </div>
        <span className="rounded-full bg-[#EEF0FF] px-3 py-1 text-xs font-semibold text-[#6366F1]">Live</span>
      </div>
      <div className="mt-5 space-y-3">
        {experience.props.map((prop) => (
          <label key={prop} className="flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-[#E4E7EF] bg-[#F7F8FC] px-4 text-sm">
            <span className="font-medium text-[#171A2B]">{prop}</span>
            <input className="size-4 accent-[#6366F1]" type="checkbox" defaultChecked />
          </label>
        ))}
      </div>
    </aside>
  );
}

export function ExperienceDocumentation({ experience }: { experience: MotionExperience }) {
  return (
    <section className="overflow-hidden rounded-[32px] border border-[#E4E7EF] bg-white shadow-[0_18px_70px_rgba(23,26,43,0.05)]">
      <div className="grid gap-0 lg:grid-cols-2">
        <div className="p-5">
          <h2 className="flex items-center gap-2 font-bold text-[#171A2B]"><Layers size={18} aria-hidden /> Documentation</h2>
          <div className="mt-4 space-y-3">
            {experience.docs.map((item) => (
              <p key={item} className="rounded-2xl bg-[#F7F8FC] p-4 text-sm leading-6 text-[#6D7285]">{item}</p>
            ))}
          </div>
        </div>
        <div className="border-t border-[#E4E7EF] bg-[#171A2B] p-5 text-white lg:border-l lg:border-t-0">
          <h2 className="flex items-center gap-2 font-bold"><Code2 size={18} aria-hidden /> Code</h2>
          <pre className="mt-4 max-h-[360px] overflow-auto rounded-2xl bg-black/22 p-4 text-xs leading-6 text-white/86"><code>{experience.code}</code></pre>
        </div>
      </div>
    </section>
  );
}

export function ExperienceMobile({ slug }: { slug: ExperienceSlug }) {
  const experience = getExperience(slug);
  if (!experience) return null;
  return (
    <div className="mx-auto max-w-[390px] rounded-[32px] border border-[#E4E7EF] bg-white p-3 shadow-[0_18px_70px_rgba(23,26,43,0.08)]">
      <ExperienceDemo experience={experience} />
    </div>
  );
}

export function ExperienceReducedMotionFallback({ slug }: { slug: ExperienceSlug }) {
  const experience = getExperience(slug);
  if (!experience) return null;
  return (
    <div className="grid gap-3 rounded-[32px] border border-[#E4E7EF] bg-white p-5">
      {experience.chapters.map((chapter) => (
        <article key={chapter.label} className="rounded-2xl bg-[#F7F8FC] p-4">
          <p className="text-xs font-bold" style={{ color: experience.accent }}>{chapter.label}</p>
          <h3 className="mt-2 font-bold">{chapter.title}</h3>
          <p className="mt-1 text-sm leading-6 text-[#6D7285]">{chapter.description}</p>
        </article>
      ))}
    </div>
  );
}

function ProjectChapterScroll({ experience }: { experience: MotionExperience }) {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const { activeIndex, progress } = useActiveChapter(ref, experience.chapters.length);
  const active = experience.chapters[activeIndex];
  const [manualIndex, setManualIndex] = useState(0);
  const index = reduced ? manualIndex : activeIndex;
  const chapter = experience.chapters[index];

  return (
    <section ref={ref} className="relative min-h-[220vh] rounded-[32px] border border-[#E4E7EF] bg-white p-4 shadow-[0_18px_70px_rgba(23,26,43,0.05)]">
      <div className="sticky top-20 grid min-h-[64dvh] place-items-center overflow-hidden rounded-[28px] p-5 transition-colors" style={{ background: chapter.color }}>
        <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_420px]">
          <motion.div key={chapter.title} initial={false} animate={{ y: 0, opacity: 1, scale: 1 }} className="grid min-h-[280px] content-between rounded-[32px] p-6 text-white shadow-2xl" style={{ background: `linear-gradient(135deg, ${experience.accent}, ${experience.secondary})` }}>
            <span className="rounded-full bg-white/18 px-3 py-1 text-sm font-semibold">Chapter {chapter.label}</span>
            <h3 className="text-5xl font-bold tracking-[-0.05em]">{chapter.title}</h3>
          </motion.div>
          <div className="self-center overflow-hidden">
            <motion.p key={active?.label} initial={false} animate={{ y: 0, opacity: 1 }} className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: experience.accent }}>{chapter.label}</motion.p>
            <motion.h2 key={chapter.title} initial={false} animate={{ y: 0, opacity: 1 }} className="mt-3 text-4xl font-bold tracking-[-0.04em] text-[#171A2B]">{chapter.title}</motion.h2>
            <p className="mt-4 text-base leading-7 text-[#6D7285]">{chapter.description}</p>
            <div className="mt-8 h-2 overflow-hidden rounded-full bg-white/70">
              <motion.div className="h-full rounded-full" style={{ background: experience.accent }} animate={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
            <KeyboardButtons index={index} count={experience.chapters.length} onChange={setManualIndex} />
          </div>
        </div>
      </div>
    </section>
  );
}

function CardStackNavigator({ experience }: { experience: MotionExperience }) {
  const [index, setIndex] = useState(0);
  const onWheel = useWheelNavigation({ index, count: cards.length, onChange: setIndex });
  const drag = useDragNavigation({ index, count: cards.length, onChange: setIndex });

  return (
    <section className="rounded-[32px] border border-[#E4E7EF] bg-white p-5 shadow-[0_18px_70px_rgba(23,26,43,0.05)]">
      <div className="relative mx-auto min-h-[470px] max-w-2xl touch-pan-y outline-none" onWheel={onWheel} onPointerDown={drag.onPointerDown} onPointerMove={drag.onPointerMove} onPointerUp={drag.onPointerUp} onKeyDown={(event) => handleKey(event, index, cards.length, setIndex)} tabIndex={0}>
        {cards.map((card, itemIndex) => {
          const depth = itemIndex - index;
          if (depth < 0 || depth > 4) return null;
          return (
            <motion.article key={card} className="absolute inset-x-0 top-8 mx-auto max-w-md rounded-[32px] border border-[#E4E7EF] bg-white p-6 shadow-2xl" animate={{ y: depth * 24, scale: 1 - depth * 0.05, opacity: 1 - depth * 0.13, rotate: depth === 0 ? drag.dragOffset / 26 : 0 }} style={{ zIndex: 20 - depth, borderColor: depth === 0 ? experience.accent : "#E4E7EF" }}>
              <p className="text-sm font-semibold" style={{ color: experience.accent }}>{itemIndex + 1} of {cards.length}</p>
              <h2 className="mt-12 text-4xl font-bold tracking-[-0.04em]">{card}</h2>
              <p className="mt-3 text-sm leading-6 text-[#6D7285]">Generic content navigation with depth, bounded movement and accessible controls.</p>
              <div className="mt-8 flex gap-2">
                <button className="rounded-2xl bg-[#F7F8FC] px-4 py-2 text-sm font-semibold">Inspect</button>
                <button className="rounded-2xl px-4 py-2 text-sm font-semibold text-white" style={{ background: experience.accent }}>Use pattern</button>
              </div>
            </motion.article>
          );
        })}
      </div>
      <KeyboardButtons index={index} count={cards.length} onChange={setIndex} />
    </section>
  );
}

function GridToDetailMorph({ experience }: { experience: MotionExperience }) {
  const transition = useSharedComponentTransition();
  const selected = transition.activeId ?? "pricing";
  const items = ["button", "pricing", "table", "profile"];

  return (
    <section className="rounded-[32px] border border-[#E4E7EF] bg-white p-5 shadow-[0_18px_70px_rgba(23,26,43,0.05)]">
      <div className="grid gap-4 md:grid-cols-4">
        {items.map((item) => (
          <motion.button key={item} layoutId={`morph-${item}`} className="min-h-36 rounded-[26px] border border-[#E4E7EF] bg-[#F7F8FC] p-4 text-left" onClick={() => transition.open(item)}>
            <span className="text-xs font-bold" style={{ color: experience.accent }}>{item}</span>
            <strong className="mt-8 block text-xl capitalize">{item}</strong>
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {transition.isOpen ? (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-[#171A2B]/28 p-4 backdrop-blur-sm" onMouseDown={transition.close} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.section layoutId={`morph-${selected}`} className="w-full max-w-3xl rounded-[34px] bg-white p-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
              <p className="text-sm font-semibold" style={{ color: experience.accent }}>Shared layout detail</p>
              <h2 className="mt-3 text-4xl font-bold capitalize tracking-[-0.04em]">{selected}</h2>
              <p className="mt-3 text-[#6D7285]">The preview, title and metadata expand in place while the URL can update without a page reload.</p>
              <button className="mt-8 rounded-2xl bg-[#171A2B] px-4 py-3 text-sm font-semibold text-white" onClick={transition.close}>Close detail</button>
            </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function ScrollAnatomy({ experience }: { experience: MotionExperience }) {
  const ref = useRef<HTMLElement | null>(null);
  const { activeIndex, progress } = useActiveChapter(ref, 8);
  const layers = ["Container", "Primary nav", "User menu", "States", "Tokens", "Props"];

  return (
    <section ref={ref} className="relative min-h-[240vh] rounded-[32px] border border-[#E4E7EF] bg-white p-5">
      <div className="sticky top-20 min-h-[72dvh] rounded-[28px] bg-[#F7F8FC] p-5">
        <p className="text-sm font-semibold" style={{ color: experience.accent }}>Step {activeIndex + 1} of 8</p>
        <div className="relative mt-10 min-h-[360px]">
          {layers.map((layer, index) => (
            <motion.div key={layer} className="absolute left-1/2 top-1/2 w-[min(560px,90%)] -translate-x-1/2 rounded-3xl border border-[#E4E7EF] bg-white p-4 shadow-xl" animate={{ y: (index - 2) * activeIndex * 4, x: index % 2 ? activeIndex * 8 : -activeIndex * 8, opacity: activeIndex > index ? 1 : 0.78 }}>
              <span className="text-xs font-bold" style={{ color: experience.accent }}>{layer}</span>
              <code className="mt-2 block text-xs text-[#6D7285]">{`<AdaptiveNavigation ${layer.toLowerCase().replaceAll(" ", "")} />`}</code>
            </motion.div>
          ))}
        </div>
        <ProgressBar value={progress} color={experience.accent} />
      </div>
    </section>
  );
}

function MagneticRail({ experience }: { experience: MotionExperience }) {
  const [index, setIndex] = useState(0);
  const onWheel = useWheelNavigation({ index, count: cards.length, onChange: setIndex });
  const drag = useDragNavigation({ index, count: cards.length, onChange: setIndex });

  return (
    <section className="rounded-[32px] border border-[#E4E7EF] bg-white p-5" onWheel={onWheel}>
      <div className="overflow-hidden rounded-[28px] bg-[#F7F8FC] p-6 outline-none" tabIndex={0} onKeyDown={(event) => handleKey(event, index, cards.length, setIndex)} onPointerDown={drag.onPointerDown} onPointerMove={drag.onPointerMove} onPointerUp={drag.onPointerUp}>
        <motion.div className="flex gap-5" animate={{ x: `calc(50% - ${index * 300 + 150}px)` }} transition={{ type: "spring", stiffness: 180, damping: 28 }}>
          {cards.map((card, itemIndex) => {
            const distance = Math.abs(itemIndex - index);
            return (
              <motion.article key={card} className="h-72 w-[280px] shrink-0 rounded-[32px] border bg-white p-5 shadow-xl" animate={{ scale: itemIndex === index ? 1 : 0.86, opacity: Math.max(0.45, 1 - distance * 0.2) }} style={{ borderColor: itemIndex === index ? experience.accent : "#E4E7EF" }}>
                <p className="text-sm font-semibold" style={{ color: experience.accent }}>Magnetic item</p>
                <h3 className="mt-28 text-3xl font-bold">{card}</h3>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
      <ProgressBar value={(index + 1) / cards.length} color={experience.accent} />
      <KeyboardButtons index={index} count={cards.length} onChange={setIndex} />
    </section>
  );
}

function SplitStoryScroll({ experience }: { experience: MotionExperience }) {
  const states = ["Idle", "Loading", "Progress", "Success", "Error", "Retry"];
  const ref = useRef<HTMLElement | null>(null);
  const { activeIndex, progress } = useActiveChapter(ref, states.length);
  const active = states[activeIndex];

  return (
    <section ref={ref} className="relative min-h-[260vh] rounded-[32px] border border-[#E4E7EF] bg-white p-5">
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="sticky top-20 h-fit rounded-[28px] bg-[#171A2B] p-6 text-white">
          <p className="text-sm text-white/60">Async Action Lifecycle</p>
          <h2 className="mt-3 text-4xl font-bold">{active}</h2>
          <p className="mt-4 text-sm leading-6 text-white/70">The sticky story tracks the active visual state as examples scroll on the right.</p>
          <ProgressBar value={progress} color={experience.accent} />
        </div>
        <div className="space-y-5">
          {states.map((state) => (
            <motion.article key={state} className="grid min-h-56 place-items-center rounded-[28px] border border-[#E4E7EF] bg-[#F7F8FC] p-5" animate={{ opacity: active === state ? 1 : 0.55, scale: active === state ? 1 : 0.97 }}>
              <button className="rounded-2xl px-5 py-3 text-sm font-semibold text-white" style={{ background: state === "Error" ? "#EF4444" : experience.accent }}>{state}</button>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComponentDepthGallery({ experience }: { experience: MotionExperience }) {
  const ref = useRef<HTMLElement | null>(null);
  const { activeIndex } = useActiveChapter(ref, 5);
  return (
    <section ref={ref} className="relative min-h-[220vh] rounded-[32px] border border-[#E4E7EF] bg-white p-5">
      <div className="sticky top-20 min-h-[72dvh] overflow-hidden rounded-[28px] bg-[#F7F8FC] p-6">
        <h2 className="text-4xl font-bold tracking-[-0.04em]">Depth level {activeIndex + 1}</h2>
        {cards.slice(0, 5).map((card, index) => {
          const distance = index - activeIndex;
          return (
            <motion.article key={card} className="absolute left-1/2 top-1/2 w-[min(520px,82%)] rounded-[32px] border border-[#E4E7EF] bg-white p-6 shadow-2xl" animate={{ x: "-50%", y: `calc(-50% + ${distance * 82}px)`, scale: 1 - Math.abs(distance) * 0.08, opacity: Math.max(0, 1 - Math.abs(distance) * 0.28) }}>
              <p className="text-sm font-semibold" style={{ color: experience.accent }}>{card}</p>
              <h3 className="mt-16 text-3xl font-bold">Component depth gallery</h3>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

function BeforeAfterScrubber({ experience }: { experience: MotionExperience }) {
  const [position, setPosition] = useState(56);
  const setFromPointer = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPosition(Math.min(96, Math.max(4, ((event.clientX - rect.left) / rect.width) * 100)));
  }, []);

  return (
    <section className="rounded-[32px] border border-[#E4E7EF] bg-white p-5">
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <div className="flex gap-2">
          {["Desktop", "Mobile", "Light", "Dark"].map((item) => <span key={item} className="rounded-full bg-[#F7F8FC] px-3 py-1 text-xs font-semibold text-[#6D7285]">{item}</span>)}
        </div>
        <span className="text-sm font-semibold" style={{ color: experience.accent }}>{Math.round(position)}%</span>
      </div>
      <div className="relative mt-5 h-[430px] overflow-hidden rounded-[28px] bg-[#F7F8FC]" onPointerDown={setFromPointer} onPointerMove={(event) => event.buttons === 1 && setFromPointer(event)} onKeyDown={(event) => event.key === "ArrowRight" ? setPosition((v) => Math.min(96, v + 4)) : event.key === "ArrowLeft" ? setPosition((v) => Math.max(4, v - 4)) : undefined} tabIndex={0}>
        <div className="absolute inset-0 grid place-items-center bg-[#171A2B] text-white"><strong className="text-4xl">Before</strong></div>
        <div className="absolute inset-0 grid place-items-center bg-white text-[#171A2B]" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}><strong className="text-4xl">After</strong></div>
        <div className="absolute inset-y-0 w-1 bg-white shadow-xl" style={{ left: `${position}%` }} />
      </div>
    </section>
  );
}

function MiniDemo({ experience }: { experience: MotionExperience }) {
  const loop = { duration: 2.4, repeat: Infinity, ease: "easeInOut" } as const;

  if (experience.slug === "card-stack-navigator") {
    return <div className="relative h-28">{[0, 1, 2].map((i) => <motion.div key={i} className="absolute inset-x-4 rounded-3xl bg-white shadow-xl" style={{ top: 8 + i * 15, height: 70, border: "1px solid #E4E7EF" }} animate={{ y: i === 0 ? [0, -10, 0] : [0, i * -5, 0], rotate: i === 0 ? [0, -5, 0] : 0 }} transition={{ ...loop, delay: i * 0.08 }} />)}</div>;
  }
  if (experience.slug === "grid-to-detail-morph") {
    return <motion.div className="mx-auto mt-2 h-24 w-32 rounded-3xl bg-white shadow-xl" animate={{ width: [128, 210, 128], height: [96, 108, 96] }} transition={loop} />;
  }
  if (experience.slug === "scroll-anatomy") {
    return <div className="relative h-28">{["Container", "Nav", "User"].map((item, i) => <motion.div key={item} className="absolute left-8 right-8 top-6 rounded-2xl bg-white p-3 text-xs shadow-lg" animate={{ x: [0, (i - 1) * 28, 0], y: [i * 8, i * 16, i * 8] }} transition={{ ...loop, delay: i * 0.08 }}>{item}</motion.div>)}</div>;
  }
  if (experience.slug === "magnetic-component-rail") {
    return <motion.div className="mt-5 flex gap-3" animate={{ x: [0, -58, 0] }} transition={loop}>{[1, 2, 3].map((item) => <div key={item} className="h-20 w-28 shrink-0 rounded-3xl bg-white shadow-lg" />)}</motion.div>;
  }
  if (experience.slug === "split-story-scroll") {
    return <motion.div className="mt-5 rounded-3xl bg-white p-5 shadow-lg" animate={{ scale: [1, 0.96, 1] }} transition={loop}><motion.span className="text-sm font-bold" style={{ color: experience.accent }} animate={{ opacity: [0.62, 1, 0.62] }} transition={loop}>Live state</motion.span></motion.div>;
  }
  return <motion.div className="mt-5 h-24 rounded-3xl shadow-xl" style={{ background: `linear-gradient(135deg, ${experience.accent}, ${experience.secondary})` }} animate={{ y: [-4, 12, -4], scale: [1, 0.96, 1] }} transition={loop} />;
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#E4E7EF]"><motion.div className="h-full rounded-full" style={{ background: color }} animate={{ width: `${Math.round(value * 100)}%` }} /></div>;
}

function KeyboardButtons({ index, count, onChange }: { index: number; count: number; onChange: (index: number) => void }) {
  return (
    <div className="mt-5 flex items-center gap-2">
      <button className="grid size-10 place-items-center rounded-2xl border border-[#E4E7EF] bg-white disabled:opacity-45" disabled={index === 0} onClick={() => onChange(Math.max(0, index - 1))} aria-label="Previous item"><ArrowLeft size={16} aria-hidden /></button>
      <span className="text-sm text-[#6D7285]">{index + 1} / {count}</span>
      <button className="grid size-10 place-items-center rounded-2xl border border-[#E4E7EF] bg-white disabled:opacity-45" disabled={index === count - 1} onClick={() => onChange(Math.min(count - 1, index + 1))} aria-label="Next item"><ArrowRight size={16} aria-hidden /></button>
    </div>
  );
}

function handleKey(event: React.KeyboardEvent, index: number, count: number, onChange: (index: number) => void) {
  if (event.key === "ArrowRight" || event.key === "ArrowDown") onChange(Math.min(count - 1, index + 1));
  if (event.key === "ArrowLeft" || event.key === "ArrowUp") onChange(Math.max(0, index - 1));
}

export function ExperienceChecklist() {
  return (
    <div className="flex flex-wrap gap-2">
      {["Wheel", "Trackpad", "Drag", "Touch", "Keyboard", "Reduced motion"].map((item) => (
        <span key={item} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"><Check size={12} aria-hidden /> {item}</span>
      ))}
      <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF0FF] px-3 py-1 text-xs font-semibold text-[#6366F1]"><MousePointer2 size={12} aria-hidden /> Bounded scroll</span>
    </div>
  );
}
