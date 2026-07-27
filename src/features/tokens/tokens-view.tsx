"use client";

import { ArrowRight, Database, Palette, Ruler, Sparkles, Type } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { useVaultStore } from "@/stores/vault-store";

const tokenIcons = {
  color: Palette,
  spacing: Ruler,
  radius: Sparkles,
  shadow: Sparkles,
  typography: Type,
  border: Ruler,
};

export function TokensView() {
  const components = useVaultStore((state) => state.components);
  const tokens = Array.from(new Map(components.flatMap((component) => component.tokens).map((token) => [token.id, token])).values());
  const groupedTokens = Object.entries(
    tokens.reduce<Record<string, typeof tokens>>((groups, token) => {
      groups[token.type] = [...(groups[token.type] ?? []), token];
      return groups;
    }, {}),
  );

  return (
    <AppShell active="Tokens">
      <section className="px-4 py-6 md:px-7">
        <div className="mx-auto max-w-[1460px]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-[#E4E7EF] bg-white px-3 py-1 text-sm font-medium text-[#6366F1] shadow-sm">
                <Database size={15} aria-hidden />
                Design system tokens
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-[#171A2B] md:text-5xl">Tokens</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[#6D7285]">
                Shared visual decisions for color, spacing, type, borders, shadows and component rhythm.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Families", groupedTokens.length.toString()],
                ["Tokens", tokens.length.toString()],
                ["Components", components.length.toString()],
              ].map(([label, value]) => (
                <div key={label} className="rounded-3xl border border-[#E4E7EF] bg-white px-5 py-4 shadow-[0_18px_70px_rgba(23,26,43,0.045)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9A9FB1]">{label}</p>
                  <p className="mt-1 text-2xl font-bold tracking-[-0.03em] text-[#171A2B]">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-5 xl:grid-cols-[1fr_360px]">
            <div className="grid gap-5 md:grid-cols-2">
              {groupedTokens.map(([type, items]) => {
                const Icon = tokenIcons[type as keyof typeof tokenIcons] ?? Sparkles;

                return (
                  <section key={type} className="rounded-[30px] border border-[#E4E7EF] bg-white p-5 shadow-[0_18px_70px_rgba(23,26,43,0.045)]">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-11 place-items-center rounded-2xl bg-[#EEF0FF] text-[#6366F1]">
                          <Icon size={20} aria-hidden />
                        </span>
                        <div>
                          <h2 className="text-lg font-bold capitalize tracking-[-0.02em] text-[#171A2B]">{type}</h2>
                          <p className="text-sm text-[#9A9FB1]">{items.length} tokens</p>
                        </div>
                      </div>
                      <ArrowRight size={18} className="text-[#C4C8D4]" aria-hidden />
                    </div>

                    <div className="mt-5 space-y-3">
                      {items.map((token) => (
                        <article key={token.id} className="flex min-h-16 items-center justify-between gap-4 rounded-3xl border border-[#E4E7EF] bg-[#F7F8FC] px-4 py-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-[#171A2B]">{token.name}</h3>
                            <p className="mt-1 break-all text-xs text-[#6D7285]">{token.value}</p>
                          </div>
                          {token.type === "color" ? (
                            <span className="size-10 shrink-0 rounded-2xl border border-white shadow-[0_8px_24px_rgba(23,26,43,0.16)]" style={{ background: token.value }} />
                          ) : (
                            <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#6D7285] shadow-sm">{token.type}</span>
                          )}
                        </article>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>

            <aside className="rounded-[30px] border border-[#E4E7EF] bg-white p-5 shadow-[0_18px_70px_rgba(23,26,43,0.045)]">
              <div className="rounded-[26px] bg-gradient-to-br from-[#6366F1] via-[#8B7CFF] to-[#E978D4] p-5 text-white">
                <Sparkles size={22} aria-hidden />
                <h2 className="mt-5 text-2xl font-bold tracking-[-0.03em]">Token health</h2>
                <p className="mt-2 text-sm leading-6 text-white/82">Core decisions are connected to reusable component previews.</p>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  ["Coverage", "96%"],
                  ["Contrast checks", "Passing"],
                  ["Last update", "Jul 23"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-2xl bg-[#F7F8FC] px-4 py-3">
                    <span className="text-sm text-[#6D7285]">{label}</span>
                    <span className="text-sm font-semibold text-[#171A2B]">{value}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
