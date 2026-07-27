"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export const motionEase = [0.22, 1, 0.36, 1] as const;
export const fastMotion = { duration: 0.16, ease: motionEase } as const;
export const mediumMotion = { duration: 0.28, ease: motionEase } as const;

export function SiteMotionLayer({ tone = "app" }: { tone?: "app" | "landing" }) {
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 190, damping: 32, mass: 0.35 });
  const springY = useSpring(pointerY, { stiffness: 190, damping: 32, mass: 0.35 });
  const orbX = useTransform(springX, (value) => value - 210);
  const orbY = useTransform(springY, (value) => value - 210);
  const [canTrackPointer, setCanTrackPointer] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;

    const media = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
    const updateCapability = () => setCanTrackPointer(media.matches);
    updateCapability();
    media.addEventListener("change", updateCapability);

    return () => media.removeEventListener("change", updateCapability);
  }, [reduceMotion]);

  useEffect(() => {
    if (!canTrackPointer || reduceMotion) return;

    let frame = 0;
    function handlePointerMove(event: PointerEvent) {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        pointerX.set(event.clientX);
        pointerY.set(event.clientY);
      });
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [canTrackPointer, pointerX, pointerY, reduceMotion]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div
        className={cn(
          "absolute inset-0",
          tone === "landing"
            ? "bg-[radial-gradient(circle_at_18%_8%,rgba(99,102,241,0.14),transparent_29%),radial-gradient(circle_at_82%_18%,rgba(233,120,212,0.1),transparent_27%),linear-gradient(180deg,#F8F9FF_0%,#F7F8FC_48%,#F4F6FB_100%)]"
            : "bg-[radial-gradient(circle_at_8%_12%,rgba(99,102,241,0.07),transparent_27%),radial-gradient(circle_at_88%_24%,rgba(81,200,155,0.065),transparent_25%),linear-gradient(180deg,#F8F9FD_0%,#F7F8FC_100%)]",
        )}
      />
      <div className="absolute inset-0 hidden opacity-[0.32] [background-image:linear-gradient(rgba(99,102,241,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.04)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)] md:block" />
      {canTrackPointer && !reduceMotion ? (
        <motion.div
          className="absolute size-[420px] will-change-transform rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.11),rgba(154,120,255,0.04)_42%,transparent_70%)] blur-xl"
          style={{ x: orbX, y: orbY }}
        />
      ) : null}
      <div className="absolute -right-24 top-[34%] hidden size-[300px] rounded-full bg-[#E978D4]/[0.045] blur-2xl md:block" />
      <div className="absolute -left-24 bottom-[-110px] hidden size-[340px] rounded-full bg-[#51C89B]/[0.055] blur-2xl md:block" />
    </div>
  );
}

export function RouteProgress() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return null;

  return (
    <motion.div
      key={pathname}
      className="fixed left-0 top-0 z-[100] h-0.5 w-full origin-left bg-gradient-to-r from-[#6366F1] via-[#9A78FF] to-[#E978D4]"
      initial={{ scaleX: 0, opacity: 1 }}
      animate={{ scaleX: [0, 0.82, 1], opacity: [1, 1, 0] }}
      transition={{ duration: 0.38, times: [0, 0.7, 1], ease: motionEase }}
    />
  );
}

export function PageFade({ children, className }: { children: ReactNode; className?: string }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="sync" initial={false}>
      <motion.div
        key={pathname}
        className={className}
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={reduceMotion ? undefined : { opacity: 0 }}
        transition={{ duration: 0.12, ease: motionEase }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function Reveal({
  children,
  className,
  delay = 0,
  amount = 0.16,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.3, delay, ease: motionEase }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGroup({ children, className }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.035 } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={{
        hidden: reduceMotion ? {} : { opacity: 0, y: 10, scale: 0.992 },
        show: reduceMotion ? {} : { opacity: 1, y: 0, scale: 1 },
      }}
      transition={{ duration: 0.24, ease: motionEase }}
    >
      {children}
    </motion.div>
  );
}

export function Magnetic({ children, className }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 430, damping: 34, mass: 0.25 });
  const springY = useSpring(y, { stiffness: 430, damping: 34, mass: 0.25 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(pointer: fine)");
    const updateCapability = () => setEnabled(media.matches && !reduceMotion);
    updateCapability();
    media.addEventListener("change", updateCapability);
    return () => media.removeEventListener("change", updateCapability);
  }, [reduceMotion]);

  return (
    <motion.div
      className={className}
      style={enabled ? { x: springX, y: springY } : undefined}
      onPointerMove={(event) => {
        if (!enabled) return;
        const rect = event.currentTarget.getBoundingClientRect();
        x.set((event.clientX - rect.left - rect.width / 2) * 0.07);
        y.set((event.clientY - rect.top - rect.height / 2) * 0.08);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
