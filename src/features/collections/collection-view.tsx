import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { ProductPageShell } from "@/components/desktop/product-page-shell";
import { demoCollections, demoComponents } from "@/services/demo-data";

export function CollectionView({ collectionId }: { collectionId?: string }) {
  const selected = collectionId ? demoCollections.find((collection) => collection.id === collectionId) : null;
  const collections = selected ? [selected] : demoCollections;

  return (
    <ProductPageShell activeSection="Collections">
      <header className="window-titlebar flex h-8 items-center px-3 font-tech text-xs font-bold uppercase">COLLECTIONS.VAULT</header>
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between border-b border-surface-dark pb-4">
          <div>
            <h1 className="font-tech text-2xl font-bold uppercase">{selected ? selected.name : "Collections"}</h1>
            <p className="mt-1 text-sm text-text-secondary">{selected ? selected.description : "Curated groups for shipping consistent UI faster."}</p>
          </div>
          <button className="pressable bg-orange px-4 py-2 font-tech text-xs font-bold uppercase text-surface-light">New Collection</button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {collections.map((collection) => {
            const components = demoComponents.filter((component) => collection.componentIds.includes(component.id));
            return (
              <Link key={collection.id} href={`/vault/collections/${collection.id}`} className="retro-panel bg-surface p-4 hover:bg-surface-light">
                <FolderOpen size={24} aria-hidden />
                <h2 className="mt-4 font-tech text-lg font-bold">{collection.name}</h2>
                <p className="mt-2 text-sm text-text-secondary">{collection.description}</p>
                <div className="mt-4 flex flex-wrap gap-1">
                  {components.map((component) => (
                    <span key={component.id} className="border border-surface-dark bg-surface-light px-2 py-1 text-xs">
                      {component.name}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </ProductPageShell>
  );
}
