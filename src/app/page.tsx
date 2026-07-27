import Link from "next/link";
import { ArrowRight, Boxes, Code2, Eye, FolderKanban, Layers3 } from "lucide-react";
import { MiniWorkstation } from "@/components/vault/mini-workstation";

const bootLines = ["BOOTING COMPONENT VAULT...", "Loading components...", "Connecting workspace...", "Vault ready."];
const features = [
  { label: "Organize reusable UI", icon: Boxes },
  { label: "Preview components live", icon: Eye },
  { label: "Store code and documentation", icon: Code2 },
  { label: "Build collections", icon: FolderKanban },
  { label: "Keep systems consistent", icon: Layers3 },
];

export default function Home() {
  return (
    <main className="min-h-dvh bg-background text-text-primary">
      <section className="mx-auto grid min-h-dvh max-w-7xl grid-rows-[auto_1fr] p-3">
        <header className="retro-panel flex h-12 items-center justify-between px-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="pressable grid size-8 place-items-center bg-surface-light font-tech text-lg font-bold">CV</span>
            <span className="font-tech text-lg font-bold uppercase">Component Vault</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/login" className="hidden px-3 py-2 text-sm font-semibold hover:underline sm:inline">
              Login
            </Link>
            <Link href="/vault" className="pressable bg-orange px-3 py-2 font-tech text-xs font-bold uppercase text-surface-light">
              Enter the Vault
            </Link>
          </nav>
        </header>

        <div className="grid items-center gap-5 py-5 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <div className="retro-panel-inset mb-5 inline-block bg-terminal p-3 font-tech text-xs text-green">
              {bootLines.map((line) => (
                <p key={line}>&gt; {line}</p>
              ))}
            </div>
            <h1 className="font-tech text-5xl font-bold uppercase leading-none md:text-7xl">Component Vault</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-text-secondary">Your structured library of reusable interface building blocks, designed like a focused retro developer workstation rather than another generic SaaS dashboard.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/vault" className="pressable inline-flex items-center gap-2 bg-navy px-5 py-3 font-tech text-sm font-bold uppercase text-surface-light">
                Enter the Vault <ArrowRight size={16} aria-hidden />
              </Link>
              <Link href="/vault/components" className="pressable inline-flex items-center gap-2 bg-surface-light px-5 py-3 font-tech text-sm font-bold uppercase">
                View Demo <Eye size={16} aria-hidden />
              </Link>
            </div>
          </div>

          <MiniWorkstation />
        </div>
      </section>

      <section className="border-y border-border-dark bg-surface py-10">
        <div className="mx-auto grid max-w-7xl gap-3 px-3 sm:grid-cols-2 lg:grid-cols-5">
          {features.map(({ label, icon: Icon }) => (
            <article key={label} className="retro-panel bg-surface-light p-4">
              <Icon size={22} aria-hidden />
              <h2 className="mt-5 font-tech text-sm font-bold uppercase">{label}</h2>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
