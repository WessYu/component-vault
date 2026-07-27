"use client";

import { useVaultStore } from "@/stores/vault-store";

export function TerminalWindow() {
  const logs = useVaultStore((state) => state.terminalLogs);

  return (
    <div className="scanline h-full bg-terminal p-3 font-tech text-xs text-green">
      <div className="mb-2 flex items-center justify-between border-b border-green/30 pb-2 text-surface-light">
        <span>TERMINAL.LOG</span>
        <span>live</span>
      </div>
      <div className="space-y-1">
        {logs.map((log, index) => (
          <p key={`${log}-${index}`}>
            <span className="text-surface-light/60">&gt;</span> {log}
          </p>
        ))}
      </div>
    </div>
  );
}
