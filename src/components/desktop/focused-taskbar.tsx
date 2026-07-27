"use client";

import { HardDrive, Terminal } from "lucide-react";
import { useState } from "react";
import { TerminalWindow } from "@/components/desktop/terminal-window";

export function FocusedTaskbar() {
  const [terminalOpen, setTerminalOpen] = useState(false);

  return (
    <footer className="retro-panel relative flex h-10 shrink-0 items-center gap-2 px-2">
      <div className="hidden items-center gap-2 text-[10px] md:flex">
        <HardDrive size={15} aria-hidden />
        <span className="font-tech font-bold uppercase">Vault Drive</span>
        <span className="text-text-secondary">248 GB free</span>
      </div>
      <button className="pressable ml-auto inline-flex h-7 items-center gap-2 bg-surface-light px-3 font-tech text-[10px] font-bold uppercase" onClick={() => setTerminalOpen((value) => !value)}>
        <Terminal size={13} aria-hidden />
        Terminal.log
      </button>
      <span className="hidden font-tech text-[10px] text-text-secondary md:block">Status drawer closed</span>
      {terminalOpen ? (
        <div className="retro-panel absolute bottom-11 right-2 z-50 h-56 w-[min(460px,calc(100vw-24px))] overflow-hidden">
          <TerminalWindow />
        </div>
      ) : null}
    </footer>
  );
}
