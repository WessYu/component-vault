import { Check, Code2, ShieldCheck, Terminal, Wrench, X } from "lucide-react";

export function CliShowcase() {
  return (
    <section id="cli" className="relative overflow-hidden rounded-[28px] border border-[#2b2b31] bg-[#111114] text-white shadow-[0_30px_100px_rgba(15,15,15,0.16)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(255,255,255,0.11),transparent_32%),radial-gradient(circle_at_12%_100%,rgba(255,255,255,0.06),transparent_30%)]" aria-hidden />
      <div className="relative grid gap-10 p-6 md:p-9 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:p-12">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
            <Terminal size={14} aria-hidden />
            Component Vault CLI
          </div>
          <h2 className="mt-5 max-w-xl text-3xl font-semibold tracking-[-0.04em] md:text-5xl md:leading-[1.04]">
            Governance that lives in your workflow.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/65 md:text-lg">
            Take Component Vault beyond the library. Analyze your component system, validate governance rules and surface inconsistencies directly from the terminal — before they become review noise.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Code2, title: "Analyze", text: "Inspect components and their usage." },
              { icon: ShieldCheck, title: "Validate", text: "Enforce rules consistently in CI." },
              { icon: Wrench, title: "Fix", text: "Apply safe, automated corrections." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                <Icon size={17} className="text-white/80" aria-hidden />
                <div className="mt-3 text-sm font-semibold">{title}</div>
                <p className="mt-1 text-xs leading-5 text-white/50">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#09090b] shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex gap-1.5" aria-hidden>
              <span className="size-2.5 rounded-full bg-white/25" />
              <span className="size-2.5 rounded-full bg-white/15" />
              <span className="size-2.5 rounded-full bg-white/10" />
            </div>
            <span className="font-mono text-[11px] text-white/35">component-vault</span>
          </div>
          <div className="p-5 font-mono text-xs leading-6 md:p-6 md:text-sm">
            <div className="text-white/45">$ <span className="text-white/90">component-vault check</span></div>
            <div className="mt-4 text-white/35">Component Vault</div>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center gap-2 text-white/75"><Check size={14} aria-hidden /> Configuration loaded</div>
              <div className="flex items-center gap-2 text-white/75"><Check size={14} aria-hidden /> Components analyzed</div>
              <div className="flex items-center gap-2 text-white/75"><Check size={14} aria-hidden /> Governance rules validated</div>
            </div>
            <div className="mt-5 flex items-center gap-2 text-white/55"><X size={14} aria-hidden /> 2 violations found</div>
            <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-white/85">Button</div>
              <div className="pl-4 text-white/45">└─ Invalid variant usage</div>
              <div className="mt-2 text-white/85">Card</div>
              <div className="pl-4 text-white/45">└─ Missing required token</div>
            </div>
            <div className="mt-5 text-white/30">2 issues found · exit code 1</div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10 px-6 py-4 md:px-9 lg:px-12">
        <div className="flex flex-col gap-3 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono">
            <span><b className="text-white/70">analyze</b> inspect</span>
            <span><b className="text-white/70">check</b> validate</span>
            <span><b className="text-white/70">fix</b> remediate</span>
          </div>
          <span>Built for developers. Designed for consistency.</span>
        </div>
      </div>
    </section>
  );
}
