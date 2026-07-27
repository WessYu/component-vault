import Link from "next/link";
import { Archive, ArrowRight, FolderKanban, Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { demoCollections, demoComponents } from "@/services/demo-data";

export function CollectionView({ collectionId }: { collectionId?: string }) {
  const selected = collectionId ? demoCollections.find((collection) => collection.id === collectionId) : null;
  const collections = selected ? [selected] : demoCollections;

  return (
    <AppShell active="Collections">
      <section className="px-4 py-6 md:px-7">
        <div className="mx-auto max-w-[1460px]">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-[#E4E7EF] bg-white px-3 py-1 text-sm font-medium text-[#6366F1] shadow-sm">
                <Archive size={15} aria-hidden />
                Component collections
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-[#171A2B] md:text-5xl">{selected ? selected.name : "Collections"}</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[#6D7285]">{selected ? selected.description : "Organize reusable interface building blocks by system, product and workflow."}</p>
            </div>
            <Link href="/vault/components" className="inline-flex min-h-11 w-fit items-center gap-2 rounded-2xl bg-[#6366F1] px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200">
              <Plus size={17} aria-hidden />
              New Collection
            </Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {collections.map((collection) => {
              const components = demoComponents.filter((component) => collection.componentIds.includes(component.id));
              return (
                <Link key={collection.id} href={`/vault/collections/${collection.id}`} className="group rounded-[30px] border border-[#E4E7EF] bg-white p-5 shadow-[0_18px_70px_rgba(23,26,43,0.045)] transition hover:-translate-y-1 hover:shadow-[0_22px_90px_rgba(23,26,43,0.09)]">
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid size-12 place-items-center rounded-2xl bg-[#EEF0FF] text-[#6366F1]">
                      <FolderKanban size={22} aria-hidden />
                    </span>
                    <span className="rounded-full bg-[#F2F4FA] px-3 py-1 text-xs font-semibold text-[#6D7285]">{components.length} items</span>
                  </div>
                  <h2 className="mt-5 text-xl font-bold tracking-[-0.02em]">{collection.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#6D7285]">{collection.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {components.slice(0, 4).map((component) => (
                      <span key={component.id} className="rounded-full border border-[#E4E7EF] px-2.5 py-1 text-xs text-[#6D7285]">{component.name}</span>
                    ))}
                  </div>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#6366F1]">
                    Open collection <ArrowRight size={15} className="transition group-hover:translate-x-1" aria-hidden />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
