"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

export function EmergingTrendPreview({ slug }: { slug: string }) {
  if (slug === "trend-cursor-lens") return <CursorLensPreview />;
  if (slug === "trend-variable-type-reactor") return <VariableTypePreview />;
  if (slug === "trend-liquid-morph-cta") return <LiquidMorphPreview />;
  if (slug === "trend-deconstructed-hero") return <DeconstructedHeroPreview />;
  if (slug === "trend-proximity-dock") return <ProximityDockPreview />;
  if (slug === "trend-spatial-depth-selector") return <SpatialDepthPreview />;
  if (slug === "trend-physics-card-toss") return <PhysicsCardPreview />;
  if (slug === "trend-scroll-layer-peel") return <LayerPeelPreview />;
  if (slug === "trend-morphing-command-capsule") return <MorphingCommandPreview />;
  return <AmbientLightPreview />;
}

function CursorLensPreview() {
  const [point, setPoint] = useState({ x: 50, y: 50 });
  return (
    <div
      className="relative h-64 overflow-hidden rounded-[30px] bg-[#121421] p-6 text-white"
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setPoint({ x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 });
      }}
    >
      <div className="grid h-full content-between">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Cursor lens</span>
        <div>
          <h3 className="max-w-xs text-4xl font-bold tracking-[-0.05em]">Reveal what is underneath.</h3>
          <p className="mt-3 text-sm text-white/50">Move the pointer across the surface.</p>
        </div>
      </div>
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          backgroundImage: `radial-gradient(circle 74px at ${point.x}% ${point.y}%, rgba(119,106,244,.34), rgba(66,211,255,.10) 46%, transparent 70%), linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)`,
          backgroundSize: "auto, 24px 24px, 24px 24px",
        }}
      />
      <motion.div className="pointer-events-none absolute size-7 rounded-full border border-white/65" animate={{ left: `calc(${point.x}% - 14px)`, top: `calc(${point.y}% - 14px)` }} transition={{ type: "spring", stiffness: 420, damping: 34 }} />
    </div>
  );
}

function VariableTypePreview() {
  const [amount, setAmount] = useState(0.5);
  const weight = Math.round(430 + amount * 420);
  return (
    <div
      className="grid h-64 cursor-ew-resize content-between overflow-hidden rounded-[30px] border border-[#E4E7EF] bg-[#F7F4EC] p-6"
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setAmount(Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)));
      }}
    >
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-[#8B8476]"><span>Variable type reactor</span><span>{weight}</span></div>
      <div>
        <motion.div
          className="origin-left text-[54px] leading-[0.86] tracking-[-0.075em] text-[#171A2B]"
          animate={{ scaleX: 0.86 + amount * 0.22, x: amount * 10 }}
          style={{ fontWeight: weight }}
          transition={{ type: "spring", stiffness: 360, damping: 30 }}
        >
          Shape<br />the voice.
        </motion.div>
        <div className="mt-5 h-1.5 rounded-full bg-[#DED8CA]"><motion.div className="h-full rounded-full bg-[#171A2B]" animate={{ width: `${amount * 100}%` }} /></div>
      </div>
    </div>
  );
}

function LiquidMorphPreview() {
  const [active, setActive] = useState(false);
  return (
    <div className="grid h-64 place-items-center overflow-hidden rounded-[30px] bg-[#EAFBF6] p-6">
      <motion.button
        className="relative isolate min-h-16 overflow-hidden bg-[#171A2B] px-8 font-bold text-white shadow-[0_20px_50px_rgba(23,26,43,.18)]"
        animate={{ borderRadius: active ? 38 : 18, scale: active ? 1.08 : 1 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setActive((value) => !value)}
      >
        <motion.span className="absolute -left-6 -top-10 size-24 rounded-full bg-[#51C89B]" animate={{ x: active ? 88 : 0, y: active ? 38 : 0, scale: active ? 1.35 : 1 }} transition={{ type: "spring", stiffness: 220, damping: 18 }} />
        <motion.span className="absolute -bottom-12 -right-4 size-28 rounded-full bg-[#6366F1]" animate={{ x: active ? -66 : 0, y: active ? -28 : 0, scale: active ? 1.2 : 1 }} transition={{ type: "spring", stiffness: 190, damping: 17 }} />
        <span className="relative z-10">{active ? "Motion locked in" : "Trigger morph"}</span>
      </motion.button>
    </div>
  );
}

function DeconstructedHeroPreview() {
  return (
    <div className="relative h-64 overflow-hidden rounded-[30px] bg-[#F4F0FF] p-5">
      <motion.div className="absolute left-5 top-5 w-40 rotate-[-4deg] rounded-2xl bg-white p-4 shadow-lg" whileHover={{ rotate: 0, y: -5 }}>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9A78FF]">Fragment 01</span><strong className="mt-8 block text-2xl tracking-[-0.05em]">Break the grid.</strong>
      </motion.div>
      <motion.div className="absolute right-5 top-10 w-32 rotate-[6deg] rounded-[26px] bg-[#171A2B] p-4 text-white shadow-xl" whileHover={{ rotate: 1, x: -4 }}><span className="text-xs text-white/50">signal</span><div className="mt-8 text-4xl">↗</div></motion.div>
      <motion.div className="absolute bottom-5 left-[28%] w-44 rotate-[2deg] rounded-2xl border border-[#DCD5F4] bg-[#EEE8FF] p-4" whileHover={{ rotate: -2, y: -4 }}><p className="text-xs leading-5 text-[#655E76]">Asymmetric fragments stay readable while the composition feels deliberately unfinished.</p></motion.div>
    </div>
  );
}

function ProximityDockPreview() {
  const [pointer, setPointer] = useState(2);
  const items = ["⌁", "◫", "✦", "↗", "◎"];
  return (
    <div className="grid h-64 place-items-center rounded-[30px] bg-[#F7F8FC] p-6" onPointerMove={(event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      setPointer(((event.clientX - rect.left) / rect.width) * (items.length - 1));
    }}>
      <div className="flex items-end gap-2 rounded-[28px] border border-[#E4E7EF] bg-white/90 p-3 shadow-[0_18px_50px_rgba(23,26,43,.10)] backdrop-blur">
        {items.map((item, index) => {
          const distance = Math.abs(pointer - index);
          const scale = Math.max(1, 1.55 - distance * 0.28);
          return <motion.button key={item} className="grid size-11 place-items-center rounded-2xl bg-[#F2F4FA] text-lg font-bold text-[#171A2B]" animate={{ scale, y: -(scale - 1) * 12 }} transition={{ type: "spring", stiffness: 420, damping: 27 }}>{item}</motion.button>;
        })}
      </div>
    </div>
  );
}

function SpatialDepthPreview() {
  const [active, setActive] = useState(1);
  const labels = ["Explore", "Focus", "Ship"];
  return (
    <div className="relative h-64 overflow-hidden rounded-[30px] bg-[#10131E] p-6 [perspective:900px]">
      {labels.map((label, index) => {
        const offset = index - active;
        return (
          <motion.button key={label} className="absolute left-1/2 top-1/2 h-36 w-52 rounded-[28px] border border-white/10 bg-white/10 p-5 text-left text-white backdrop-blur-md" onClick={() => setActive(index)} animate={{ x: `calc(-50% + ${offset * 88}px)`, y: `calc(-50% + ${Math.abs(offset) * 12}px)`, rotateY: offset * -24, scale: offset === 0 ? 1 : 0.86, opacity: offset === 0 ? 1 : 0.58, zIndex: 10 - Math.abs(offset) }} transition={{ type: "spring", stiffness: 250, damping: 26 }}>
            <span className="text-xs text-white/45">0{index + 1}</span><strong className="mt-12 block text-2xl tracking-[-0.04em]">{label}</strong>
          </motion.button>
        );
      })}
    </div>
  );
}

function PhysicsCardPreview() {
  return (
    <div className="relative grid h-64 place-items-center overflow-hidden rounded-[30px] bg-[#FFF6EA] p-6">
      <div className="absolute inset-x-8 top-1/2 border-t border-dashed border-[#E5CFAE]" />
      <motion.div drag dragConstraints={{ left: -90, right: 90, top: -50, bottom: 50 }} dragElastic={0.16} whileDrag={{ scale: 1.06, rotate: 4, cursor: "grabbing" }} className="relative z-10 w-52 cursor-grab rounded-[26px] border border-[#EBD8BA] bg-white p-5 shadow-[0_24px_60px_rgba(104,76,32,.14)]">
        <span className="text-xs font-semibold text-[#A77839]">Physics UI</span><strong className="mt-8 block text-2xl tracking-[-0.04em]">Drag with weight.</strong><p className="mt-2 text-xs leading-5 text-[#7C6D58]">Direct manipulation with bounded, tactile motion.</p>
      </motion.div>
    </div>
  );
}

function LayerPeelPreview() {
  const [active, setActive] = useState(0);
  const layers = ["Story", "System", "Detail"];
  return (
    <div className="relative h-64 overflow-hidden rounded-[30px] bg-[#EDF3FF] p-5" onWheel={(event) => { event.preventDefault(); setActive((current) => Math.max(0, Math.min(layers.length - 1, current + (event.deltaY > 0 ? 1 : -1)))); }}>
      <div className="mb-4 flex items-center justify-between text-xs font-semibold text-[#6D7285]"><span>Wheel to peel</span><span>{active + 1}/{layers.length}</span></div>
      {layers.map((layer, index) => {
        const distance = index - active;
        return <motion.div key={layer} className="absolute inset-x-5 bottom-5 h-44 rounded-[26px] border border-white/70 p-5 shadow-xl" animate={{ y: distance < 0 ? 150 : distance * 22, scale: 1 - Math.max(distance, 0) * 0.055, opacity: distance < 0 ? 0 : 1 - distance * 0.18, rotate: distance * -1.5 }} style={{ background: ["#FFFFFF", "#EAFBF6", "#F4F0FF"][index], zIndex: 10 - index }}><span className="text-xs text-[#6D7285]">Layer 0{index + 1}</span><strong className="mt-12 block text-3xl tracking-[-0.05em]">{layer}</strong></motion.div>;
      })}
    </div>
  );
}

function MorphingCommandPreview() {
  const [open, setOpen] = useState(false);
  return (
    <div className="grid h-64 place-items-center rounded-[30px] bg-[#F7F8FC] p-5">
      <motion.div layout className="overflow-hidden border border-[#E4E7EF] bg-white shadow-[0_20px_60px_rgba(23,26,43,.12)]" animate={{ width: open ? 360 : 180, borderRadius: open ? 26 : 999 }}>
        <button className="flex min-h-14 w-full items-center gap-3 px-5 text-left text-sm font-semibold text-[#171A2B]" onClick={() => setOpen((value) => !value)}><span className="text-[#6366F1]">⌘</span><span>{open ? "Search actions" : "Quick command"}</span><span className="ml-auto text-xs text-[#9A9FB1]">K</span></button>
        <AnimatePresence>{open ? <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="border-t border-[#EEF0F6] p-2">{["Create component", "Open recent", "Switch collection"].map((item) => <button key={item} className="block w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-[#6D7285] hover:bg-[#F7F8FC]">{item}</button>)}</motion.div> : null}</AnimatePresence>
      </motion.div>
    </div>
  );
}

function AmbientLightPreview() {
  const [point, setPoint] = useState({ x: 50, y: 50 });
  const gradient = useMemo(() => `radial-gradient(circle 150px at ${point.x}% ${point.y}%, rgba(255,255,255,.9), rgba(226,236,255,.5) 38%, transparent 70%)`, [point]);
  return (
    <div className="relative h-64 overflow-hidden rounded-[30px] bg-[#DDE5F3] p-5" onPointerMove={(event) => { const rect = event.currentTarget.getBoundingClientRect(); setPoint({ x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 }); }}>
      <div className="absolute inset-0" style={{ background: gradient }} />
      <div className="relative grid h-full content-between rounded-[24px] border border-white/70 bg-white/45 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.8),0_24px_70px_rgba(48,67,97,.12)] backdrop-blur-sm">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6D7285]">Ambient light window</span>
        <div><strong className="text-3xl tracking-[-0.05em] text-[#171A2B]">Light as feedback.</strong><p className="mt-2 max-w-xs text-xs leading-5 text-[#6D7285]">Pointer position shifts illumination without turning the whole UI into glass.</p></div>
      </div>
    </div>
  );
}
