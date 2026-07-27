"use client";

import { RefObject, useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function useScrollProgress(ref: RefObject<HTMLElement | null>) {
  const prefersReducedMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion) {
      setProgress(0);
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const travel = Math.max(1, rect.height - window.innerHeight);
      const next = Math.min(1, Math.max(0, -rect.top / travel));
      setProgress(next);
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [prefersReducedMotion, ref]);

  return progress;
}
