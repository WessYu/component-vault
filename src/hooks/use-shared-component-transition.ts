"use client";

import { useCallback, useRef, useState } from "react";

export function useSharedComponentTransition() {
  const scrollTop = useRef(0);
  const [activeId, setActiveId] = useState<string | null>(null);

  const open = useCallback((id: string) => {
    scrollTop.current = window.scrollY;
    setActiveId(id);
  }, []);

  const close = useCallback(() => {
    setActiveId(null);
    window.requestAnimationFrame(() => window.scrollTo({ top: scrollTop.current, behavior: "auto" }));
  }, []);

  return { activeId, open, close, isOpen: Boolean(activeId) };
}
