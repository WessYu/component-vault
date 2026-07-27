"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export function AnimatedPanel({ children, open = true, className = "" }: { children: React.ReactNode; open?: boolean; className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className={className}
          initial={reduceMotion ? false : { opacity: 0, x: 24, scale: 0.98 }}
          animate={reduceMotion ? undefined : { opacity: 1, x: 0, scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0, x: 24, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
