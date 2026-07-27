"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export const motionEase = [0.22, 1, 0.36, 1] as const;

export function SiteMotionLayer({ tone = "app" }: { tone?: "app" | "landing" }) {
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 65, damping: 24, mass: 0.7 });
  const springY = useSpring(pointerY, { stiffness: 65, damping: 24, mass: 0.7 });
  const orbX = useTransform(springX, (value) => value - 260);
  const orbY = useTransform(springY, (value) => value - 260);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (reduceMotion) return;

    function handlePointerMove(event: PointerEvent) {
      pointerX.set(event.clientX);
      pointerY.set(event.clientY);
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [pointerX, pointerY, reduceMotion]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div
        className={cn(
          "absolute inset-0",
          tone === "landing"
            ? "bg-[radial-gradient(circle_at_18%_8%,rgba(99,102,241,0.16),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(233,120,212,0.13),transparent_28%),linear-gradient(180deg,#F8F9FF_0%,#F7F8FC_48%,#F4F6FB_100%)]"
            : "bg-[radial-gradient(circle_at_8%_12%,rgba(99,102,241,0.08),transparent_28%),radial-gradient(circle_at_88%_24%,rgba(81,200,155,0.08),transparent_26%),linear-gradient(180deg,#F8F9FD_0%,#F7F8FC_100%)]",
        )}
      />
      <div className="absolute inset-0 opacity-[0.44] [background-image:linear-gradient(rgba(99,102,241,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.045)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:linear-gradient(to_bottom,black,transparent_86%)]" />
      {mounted && !reduceMotion ? (
        <motion.div
          className="absolute size-[520px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.13),rgba(154,120,255,0.055)_40%,transparent_72%)] blur-2xl"
          style={{ x: orbX, y: orbY }}
        />
      ) : null}
      <motion.div
        className="absolute -right-28 top-[34%] size-[360px] rounded-full bg-[#E978D4]/[0.055] blur-3xl"
        animate={reduceMotion ? undefined : { y: [0, -22, 0], x: [0, 10, 0], scale: [1, 1.04, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -left-32 bottom-[-130px] size-[420px] rounded-full bg-[#51C89B]/[0.07] blur-3xl"
        animate={reduceMotion ? undefined : { y: [0, 18, 0], x: [0, -8, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
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
      className="fixed left-0 top-0 z-[100] h-[3px] w-full origin-left bg-gradient-to-r from-[#6366F1] via-[#9A78FF] to-[#E978D4] shadow-[0_0_18px_rgba(99,102,241,0.55)]"
      initial={{ scaleX: 0, opacity: 1 }}
      animate={{ scaleX: [0, 0.72, 1], opacity: [1, 1, 0] }}
      transition={{ duration: 0.72, times: [0, 0.68, 1], ease: motionEase }}
    />
  );
}

export function PageFade({ children, className }: { children: ReactNode; className?: string }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        className={className}
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={reduceMotion ? undefined : { opacity: 0 }}
        transition={{ duration: 0.24, ease: motionEase }}
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
  amount = 0.2,
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
      initial={reduceMotion ? false : { opacity: 0, y: 22, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.58, delay, ease: motionEase }}
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
      viewport={{ once: true, amount: 0.14 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.075 } } }}
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
        hidden: reduceMotion ? {} : { opacity: 0, y: 18, scale: 0.985 },
        show: reduceMotion ? {} : { opacity: 1, y: 0, scale: 1 },
      }}
      transition={{ duration: 0.46, ease: motionEase }}
    >
      {children}
    </motion.div>
  );
}

export function Magnetic({ children, className }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 22 });
  const springY = useSpring(y, { stiffness: 260, damping: 22 });

  return (
    <motion.div
      className={className}
      style={reduceMotion ? undefined : { x: springX, y: springY }}
      onPointerMove={(event) => {
        if (reduceMotion) return;
        const rect = event.currentTarget.getBoundingClientRect();
        x.set((event.clientX - rect.left - rect.width / 2) * 0.12);
        y.set((event.clientY - rect.top - rect.height / 2) * 0.16);
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
