import { Database } from "lucide-react";
import { ProductPageShell } from "@/components/desktop/product-page-shell";
import { demoComponents } from "@/services/demo-data";

export function TokensView() {
  const tokens = Array.from(new Map(demoComponents.flatMap((component) => component.tokens).map((token) => [token.id, token])).values());

  return (
    <ProductPageShell activeSection="Tokens">
      <header className="window-titlebar flex h-8 items-center px-3 font-tech text-xs font-bold uppercase">TOKENS.DB</header>
      <div className="p-4">
        <div className="mb-4 border-b border-surface-dark pb-4">
          <h1 className="flex items-center gap-2 font-tech text-2xl font-bold uppercase">
            <Database size={24} aria-hidden /> Design Tokens
          </h1>
          <p className="mt-1 text-sm text-text-secondary">Shared values for color, spacing, borders, radius, typography and physical panel shadows.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {tokens.map((token) => (
            <article key={token.id} className="retro-panel bg-surface p-4">
              <div className="flex items-center justify-between">
                <span className="font-tech text-xs font-bold uppercase">{token.type}</span>
                {token.type === "color" ? <span className="size-8 border border-border-dark" style={{ background: token.value }} /> : null}
              </div>
              <h2 className="mt-5 font-tech text-sm font-bold">{token.name}</h2>
              <p className="mt-2 break-all text-sm text-text-secondary">{token.value}</p>
            </article>
          ))}
        </div>
      </div>
    </ProductPageShell>
  );
}
