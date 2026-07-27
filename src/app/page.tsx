import Link from "next/link";
import { ArrowRight, Check, Code2, Layers3, MousePointer2, Palette, Play, SlidersHorizontal, Sparkles } from "lucide-react";
import { ComponentPreview } from "@/components/detail/component-preview";
import { demoComponents } from "@/services/demo-data";

const features = [
  { title: "Explore components visually", description: "Editorial cards surface real previews, states, metadata and usage signals.", icon: Layers3 },
  { title: "Preview every state", description: "Inspect desktop, tablet and mobile behavior without leaving the workspace.", icon: Play },
  { title: "Customize props in real time", description: "Tune density, variants, loading states, colors and content from a live editor.", icon: SlidersHorizontal },
  { title: "Keep code and documentation together", description: "Pair snippets, usage notes, accessibility guidance and changelogs.", icon: Code2 },
  { title: "Organize reusable collections", description: "Group production-ready building blocks by system, product and team.", icon: Palette },
];

export default function Home() {
  const pricing = demoComponents.find((component) => component.slug === "pricing-card") ?? demoComponents[0];
  const table = demoComponents.find((component) => component.slug === "table-data-grid") ?? demoComponents[0];

  return (
    <main className="min-h-dvh overflow-hidden bg-[#F7F8FC] text-[#171A2B]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#9A78FF] text-white shadow-lg shadow-indigo-200">
            <Layers3 size={20} aria-hidden />
          </span>
          <span className="font-bold tracking-[-0.02em]">Component Vault</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/login" className="hidden min-h-10 items-center rounded-2xl px-4 text-sm font-semibold text-[#6D7285] hover:text-[#171A2B] sm:inline-flex">
            Login
          </Link>
          <Link href="/vault/components" className="inline-flex min-h-10 items-center gap-2 rounded-2xl bg-[#171A2B] px-4 text-sm font-semibold text-white">
            Explore components
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#E4E7EF] bg-white px-3 py-1 text-sm font-medium text-[#6366F1] shadow-sm">
            <Sparkles size={15} aria-hidden />
            Visual Component Playground
          </p>
          <h1 className="mt-6 max-w-3xl text-5xl font-bold tracking-[-0.055em] md:text-7xl">
            Build once.
            <span className="block text-[#6366F1]">Reuse everywhere.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6D7285]">
            A visual workspace to save, test, document and reuse the components behind your products.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/vault/components" className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-[#6366F1] px-5 text-sm font-bold text-white shadow-lg shadow-indigo-200">
              Start building <ArrowRight size={17} aria-hidden />
            </Link>
            <Link href="/vault/components/table-data-grid" className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-[#E4E7EF] bg-white px-5 text-sm font-bold text-[#171A2B] shadow-sm">
              Explore components
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-4 text-sm text-[#6D7285]">
            {["Live previews", "Props editor", "Code docs"].map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <Check size={15} className="text-[#51C89B]" aria-hidden />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-6 top-20 z-10 hidden rounded-2xl border border-[#E4E7EF] bg-white px-4 py-3 text-sm font-semibold shadow-2xl shadow-[#171A2B]/12 md:flex">
            <MousePointer2 size={16} className="mr-2 text-[#6366F1]" aria-hidden />
            Selected: Pricing Card
          </div>
          <div className="rounded-[36px] border border-[#E4E7EF] bg-white/80 p-4 shadow-2xl shadow-[#171A2B]/10 backdrop-blur">
            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <ComponentPreview component={pricing} compact />
                  <ComponentPreview component={table} compact />
                </div>
                <div className="rounded-[28px] bg-[#171A2B] p-5 text-sm leading-6 text-[#EEF0FF]">
                  <pre><code>{`<PricingCard
  tier="Pro"
  price={29}
  highlighted
/>`}</code></pre>
                </div>
              </div>
              <div className="rounded-[28px] border border-[#E4E7EF] bg-white p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">Properties</h3>
                  <span className="rounded-full bg-[#EEF0FF] px-2 py-1 text-xs font-bold text-[#6366F1]">Live</span>
                </div>
                <div className="mt-5 space-y-4">
                  {["tier", "price", "features", "accentColor"].map((item) => (
                    <label key={item} className="block">
                      <span className="text-xs font-medium text-[#9A9FB1]">{item}</span>
                      <div className="mt-2 h-10 rounded-2xl border border-[#E4E7EF] bg-[#F7F8FC]" />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="rounded-[28px] border border-[#E4E7EF] bg-white p-5 shadow-[0_18px_70px_rgba(23,26,43,0.045)]">
                <span className="grid size-11 place-items-center rounded-2xl bg-[#EEF0FF] text-[#6366F1]">
                  <Icon size={20} aria-hidden />
                </span>
                <h2 className="mt-5 font-bold tracking-[-0.02em]">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#6D7285]">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14">
        <div className="rounded-[36px] bg-gradient-to-br from-[#171A2B] to-[#323757] p-8 text-white md:p-12">
          <h2 className="max-w-2xl text-4xl font-bold tracking-[-0.04em]">Bring your interface system into one visual workspace.</h2>
          <p className="mt-4 max-w-2xl text-white/70">Save components, inspect states, edit props and keep implementation details close to the UI your team actually reuses.</p>
          <Link href="/vault/components" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-white px-5 text-sm font-bold text-[#171A2B]">
            Open Component Vault <ArrowRight size={17} aria-hidden />
          </Link>
        </div>
      </section>
    </main>
  );
}
