"use client";

import { RefObject, useMemo } from "react";
import { useScrollProgress } from "@/hooks/use-scroll-progress";

export function useActiveChapter(ref: RefObject<HTMLElement | null>, count: number) {
  const progress = useScrollProgress(ref);

  return useMemo(() => {
    const activeIndex = Math.min(count - 1, Math.max(0, Math.round(progress * (count - 1))));
    return { activeIndex, progress };
  }, [count, progress]);
}
