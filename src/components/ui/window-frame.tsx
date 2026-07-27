"use client";

import { Minus, Square, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVaultStore } from "@/stores/vault-store";
import type { WindowKey } from "@/types/vault";

type WindowFrameProps = {
  id: WindowKey;
  title: string;
  className?: string;
  children: React.ReactNode;
  closeable?: boolean;
};

export function WindowFrame({ id, title, className, children, closeable = true }: WindowFrameProps) {
  const activeWindow = useVaultStore((state) => state.activeWindow);
  const windowState = useVaultStore((state) => state.windows[id]);
  const setActiveWindow = useVaultStore((state) => state.setActiveWindow);
  const toggleWindow = useVaultStore((state) => state.toggleWindow);

  if (windowState.closed || windowState.minimized) {
    return null;
  }

  return (
    <section
      onMouseDown={() => setActiveWindow(id)}
      className={cn(
        "retro-panel min-h-0 overflow-hidden transition-[transform,box-shadow] duration-150",
        activeWindow === id ? "relative z-20 shadow-[3px_3px_0_rgba(62,59,52,.48)]" : "relative z-10 opacity-[.96]",
        windowState.maximized && "fixed inset-[42px_8px_56px_8px] z-40",
        className,
      )}
      aria-label={title}
    >
      <header className={cn("window-titlebar flex h-7 items-center justify-between px-2 font-tech text-[11px] font-bold uppercase", activeWindow !== id && "brightness-90")}>
        <button className="flex items-center gap-1 text-left" onClick={() => setActiveWindow(id)}>
          <span className="grid size-4 place-items-center border border-surface-light/70 text-[9px]">▣</span>
          {title}
        </button>
        <div className="flex items-center gap-1">
          <button className="pressable grid size-5 place-items-center bg-surface text-text-primary" aria-label={`Minimize ${title}`} onClick={() => toggleWindow(id, "minimize")}>
            <Minus size={12} aria-hidden />
          </button>
          <button className="pressable grid size-5 place-items-center bg-surface text-text-primary" aria-label={`Maximize ${title}`} onClick={() => toggleWindow(id, "maximize")}>
            <Square size={10} aria-hidden />
          </button>
          {closeable ? (
            <button className="pressable grid size-5 place-items-center bg-surface text-text-primary" aria-label={`Close ${title}`} onClick={() => toggleWindow(id, "close")}>
              <X size={12} aria-hidden />
            </button>
          ) : null}
        </div>
      </header>
      <div className="h-[calc(100%-1.75rem)] min-h-0">{children}</div>
    </section>
  );
}
