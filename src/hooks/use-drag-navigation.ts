"use client";

import { useCallback, useRef, useState } from "react";

export function useDragNavigation({
  index,
  count,
  onChange,
  axis = "x",
  threshold = 54,
}: {
  index: number;
  count: number;
  onChange: (index: number) => void;
  axis?: "x" | "y";
  threshold?: number;
}) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  const onPointerDown = useCallback((event: React.PointerEvent) => {
    start.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!start.current) return;
      const delta = axis === "x" ? event.clientX - start.current.x : event.clientY - start.current.y;
      setDragOffset(delta);
    },
    [axis],
  );

  const onPointerUp = useCallback(
    (event: React.PointerEvent) => {
      if (!start.current) return;
      const delta = axis === "x" ? event.clientX - start.current.x : event.clientY - start.current.y;
      const direction = delta < 0 ? 1 : -1;
      if (Math.abs(delta) > threshold) {
        onChange(Math.min(count - 1, Math.max(0, index + direction)));
      }
      start.current = null;
      setDragOffset(0);
    },
    [axis, count, index, onChange, threshold],
  );

  return { dragOffset, onPointerDown, onPointerMove, onPointerUp };
}
