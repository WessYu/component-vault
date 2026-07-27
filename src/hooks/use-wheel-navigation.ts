"use client";

import { useCallback, useRef } from "react";

export function useWheelNavigation({
  index,
  count,
  onChange,
  threshold = 42,
}: {
  index: number;
  count: number;
  onChange: (index: number) => void;
  threshold?: number;
}) {
  const locked = useRef(false);

  return useCallback(
    (event: React.WheelEvent) => {
      if (locked.current || Math.abs(event.deltaY) < threshold) return;
      const direction = event.deltaY > 0 ? 1 : -1;
      const next = Math.min(count - 1, Math.max(0, index + direction));
      if (next === index) return;
      event.preventDefault();
      locked.current = true;
      onChange(next);
      window.setTimeout(() => {
        locked.current = false;
      }, 360);
    },
    [count, index, onChange, threshold],
  );
}
