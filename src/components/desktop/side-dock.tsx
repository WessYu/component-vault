"use client";

import Link from "next/link";
import { Boxes, ChartNoAxesColumn, Database, FolderOpen, Heart, LayoutDashboard, Settings, ShieldCheck, Star, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";

const dockItems = [
  { label: "Dashboard", href: "/vault", icon: LayoutDashboard },
  { label: "Browser", href: "/vault/components", icon: Boxes },
  { label: "Collections", href: "/vault/collections", icon: FolderOpen },
  { label: "Favorites", href: "/vault/favorites", icon: Heart },
  { label: "Tokens", href: "/vault/tokens", icon: Database },
  { label: "Team", href: "/vault/settings", icon: UsersRound },
  { label: "Settings", href: "/vault/settings", icon: Settings },
];

export function SideDock({ active = "Dashboard" }: { active?: string }) {
  return (
    <aside className="retro-panel hidden w-24 shrink-0 flex-col overflow-hidden md:flex" aria-label="Vault dock">
      <div className="p-2">
        <div className="retro-panel-inset grid h-12 place-items-center bg-surface-dark/35">
          <ChartNoAxesColumn size={28} aria-hidden />
        </div>
      </div>
      <nav className="flex-1">
        {dockItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.label;
          return (
            <Link
              key={item.label}
              href={item.href}
              title={item.label}
              className={cn(
                "group flex h-[66px] flex-col items-center justify-center gap-1 border-y border-border-light/60 px-1 text-[10px] font-semibold uppercase hover:bg-surface-light",
                isActive && "bg-surface-light text-navy",
              )}
            >
              <Icon size={24} aria-hidden />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border-dark p-2">
        <p className="font-tech text-[10px] font-bold uppercase">System</p>
        {[
          ["Memory", 62],
          ["CPU", 24],
          ["Storage", 58],
        ].map(([label, value]) => (
          <div key={label} className="mt-2">
            <div className="flex justify-between text-[9px] uppercase">
              <span>{label}</span>
              <span>{value}%</span>
            </div>
            <div className="retro-panel-inset h-2 bg-surface-light">
              <div className="h-full bg-olive" style={{ width: `${value}%` }} />
            </div>
          </div>
        ))}
        <div className="retro-panel-inset mt-3 grid h-16 place-items-center bg-terminal text-green">
          <ShieldCheck size={24} aria-hidden />
        </div>
        <div className="mt-2 flex justify-center gap-1 text-olive">
          <Star size={12} fill="currentColor" aria-hidden />
          <Star size={12} fill="currentColor" aria-hidden />
          <Star size={12} fill="currentColor" aria-hidden />
        </div>
      </div>
    </aside>
  );
}
