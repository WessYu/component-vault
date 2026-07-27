"use client";

import { Code2, Eye, FileText, FolderOpen, HardDrive, Monitor, Terminal, Trash2 } from "lucide-react";
import { useVaultStore } from "@/stores/vault-store";
import type { WindowKey } from "@/types/vault";

const tasks: Array<{ id: WindowKey; label: string; icon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }> }> = [
  { id: "browser", label: "BROWSER.EXE", icon: FolderOpen },
  { id: "preview", label: "PREVIEW.LIVE", icon: Eye },
  { id: "editor", label: "CODE_EDITOR.TSX", icon: Code2 },
  { id: "inspector", label: "INSPECTOR.NOTES", icon: FileText },
  { id: "terminal", label: "TERMINAL.LOG", icon: Terminal },
];

export function Taskbar() {
  const windows = useVaultStore((state) => state.windows);
  const activeWindow = useVaultStore((state) => state.activeWindow);
  const toggleWindow = useVaultStore((state) => state.toggleWindow);
  const terminalLogs = useVaultStore((state) => state.terminalLogs);

  return (
    <footer className="retro-panel flex h-14 shrink-0 items-center gap-2 overflow-x-auto px-2">
      <div className="retro-panel-inset hidden min-w-44 items-center gap-2 bg-surface-light p-2 md:flex">
        <HardDrive size={18} aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="font-tech text-[10px] font-bold uppercase">Vault Drive (1/work)</div>
          <div className="mt-1 h-2 border border-border-dark bg-surface">
            <div className="h-full w-[68%] bg-navy" />
          </div>
        </div>
        <span className="font-tech text-[10px]">248 GB free</span>
      </div>
      {tasks.map((task) => {
        const Icon = task.icon;
        const state = windows[task.id];
        return (
          <button
            key={task.id}
            data-active={activeWindow === task.id && !state.minimized && !state.closed}
            className="pressable flex h-10 min-w-36 items-center justify-center gap-2 bg-surface-light px-3 font-tech text-[11px] font-bold"
            onClick={() => toggleWindow(task.id, "restore")}
          >
            <Icon size={16} aria-hidden />
            {task.label}
          </button>
        );
      })}
      <div className="retro-panel-inset ml-auto hidden min-w-56 bg-terminal px-3 py-2 text-green md:block">
        <div className="flex items-center justify-between font-tech text-[10px] text-surface-light">
          <span>TERMINAL.LOG</span>
          <Monitor size={12} aria-hidden />
        </div>
        <p className="truncate font-tech text-xs">{terminalLogs[0]}</p>
      </div>
      <button className="grid h-11 min-w-12 place-items-center" aria-label="Trash">
        <Trash2 size={22} aria-hidden />
      </button>
    </footer>
  );
}
