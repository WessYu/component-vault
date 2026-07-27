"use client";

import Link from "next/link";
import { ChevronDown, MonitorCog, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { useVaultStore } from "@/stores/vault-store";

const menus = {
  FILE: ["New Component", "New Collection", "Import", "Export"],
  EDIT: ["Copy", "Format Code", "Duplicate", "Delete"],
  VIEW: ["Toggle Grid", "Toggle Guides", "Compact Mode", "Fullscreen Preview"],
  VAULT: ["All Components", "Favorites", "Collections", "Recently Updated"],
  TOOLS: ["Token Audit", "Usage Scanner", "Preview Compile"],
  WINDOW: ["Restore Layout", "Minimize All", "Focus Editor"],
  HELP: ["Keyboard Map", "Documentation", "System Report"],
};

export function TopBar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const addLog = useVaultStore((state) => state.addLog);
  const time = useMemo(
    () =>
      new Intl.DateTimeFormat("en", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date()),
    [],
  );

  return (
    <header className="retro-panel flex h-10 shrink-0 items-center justify-between gap-3 px-2">
      <div className="flex h-full items-center gap-3">
        <Link href="/" className="pressable grid size-8 place-items-center bg-surface-light font-tech text-lg font-bold">
          CV
        </Link>
        <Link href="/vault" className="font-tech text-lg font-bold uppercase tracking-wide">
          Component Vault
        </Link>
        <nav className="hidden h-full items-center md:flex" aria-label="System menu">
          {Object.entries(menus).map(([label, items]) => (
            <div key={label} className="relative h-full">
              <button
                className="h-full px-3 font-tech text-xs font-semibold hover:bg-surface-light"
                aria-expanded={openMenu === label}
                onClick={() => setOpenMenu(openMenu === label ? null : label)}
              >
                {label}
              </button>
              {openMenu === label ? (
                <div className="retro-panel absolute left-0 top-full z-50 min-w-48 bg-surface-light p-1">
                  {items.map((item) => (
                    <button
                      key={item}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-navy hover:text-surface-light"
                      onClick={() => {
                        addLog(`${item} executed.`);
                        setOpenMenu(null);
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2 font-tech text-[11px]">
        <span className="hidden items-center gap-1 md:flex">
          <MonitorCog size={14} aria-hidden />
          SYNC
          <span className="inline-block h-2 w-12 border border-border-dark bg-[repeating-linear-gradient(90deg,#424834_0_4px,#ded9cb_4px_7px)]" />
        </span>
        <span>{time}</span>
        <button className="pressable flex items-center gap-1 bg-surface-light px-2 py-1" aria-label="Account menu">
          <UserRound size={14} aria-hidden />
          <ChevronDown size={12} aria-hidden />
        </button>
      </div>
    </header>
  );
}
