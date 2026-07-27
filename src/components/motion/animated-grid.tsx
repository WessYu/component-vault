"use client";

import { motion, useReducedMotion } from "framer-motion";

export function AnimatedGrid({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : "hidden"}
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.045,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedGridItem({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      layout
      variants={{
        hidden: reduceMotion ? {} : { opacity: 0, y: 12 },
        show: reduceMotion ? {} : { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
