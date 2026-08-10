"use client";

import Link from "next/link";
import { Archive, ArrowRight, Check, FolderKanban, Plus, Save, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AppShell } from "@/components/layout/app-shell";
import { useVaultStore } from "@/stores/vault-store";

export function CollectionView({ collectionId }: { collectionId?: string }) {
  const router = useRouter();
  const components = useVaultStore((state) => state.components);
  const allCollections = useVaultStore((state) => state.collections);
  const createCollection = useVaultStore((state) => state.createCollection);
  const updateCollection = useVaultStore((state) => state.updateCollection);
  const deleteCollection = useVaultStore((state) => state.deleteCollection);
  const toggleCollectionComponent = useVaultStore((state) => state.toggleCollectionComponent);
  const selected = collectionId ? allCollections.find((collection) => collection.id === collectionId) : null;
  const collections = useMemo(() => (selected ? [selected] : allCollections), [allCollections, selected]);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function handleCreate() {
    if (!name.trim()) return;
    setSaving(true);
    const collection = await createCollection({ name: name.trim(), description: description.trim() || "Reusable component collection.", componentIds: [] });
    setSaving(false);
    if (!collection) return;
    setCreateOpen(false);
    setName("");
    setDescription("");
    router.push(`/vault/collections/${collection.id}`);
  }

  async function handleDelete() {
    if (!selected || !window.confirm(`Delete “${selected.name}” permanently?`)) return;
    const deleted = await deleteCollection(selected.id);
    if (deleted) router.push("/vault/collections");
  }

  return (
    <AppShell active="Collections">
      <section className="px-4 py-6 md:px-7">
        <div className="mx-auto max-w-[1460px]">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-[#E4E7EF] bg-white px-3 py-1 text-sm font-medium text-[#6366F1] shadow-sm">
                <Archive size={15} aria-hidden /> Component collections
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-text-primary md:text-5xl">{selected ? selected.name : "Collections"}</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[#6D7285]">{selected ? selected.description : "Organize reusable interface building blocks by system, product and workflow."}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {selected ? <Link href="/vault/collections" className="inline-flex min-h-11 items-center rounded-2xl border border-[#E4E7EF] bg-white px-4 text-sm font-semibold">All collections</Link> : null}
              <button className="inline-flex min-h-11 w-fit items-center gap-2 rounded-2xl bg-[#6366F1] px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200" onClick={() => setCreateOpen(true)}>
                <Plus size={17} aria-hidden /> New Collection
              </button>
            </div>
          </div>

          {selected ? (
            <CollectionManager
              collection={selected}
              components={components}
              onUpdate={(patch) => updateCollection(selected.id, patch)}
              onToggle={(componentId) => toggleCollectionComponent(selected.id, componentId)}
              onDelete={handleDelete}
            />
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {collections.map((collection) => {
                const collectionComponents = components.filter((component) => collection.componentIds.includes(component.id));
                return (
                  <Link key={collection.id} href={`/vault/collections/${collection.id}`} className="group rounded-[30px] border border-[#E4E7EF] bg-white p-5 shadow-[0_18px_70px_rgba(23,26,43,0.045)] transition hover:-translate-y-1 hover:shadow-[0_22px_90px_rgba(23,26,43,0.09)]">
                    <div className="flex items-start justify-between gap-4">
                      <span className="grid size-12 place-items-center rounded-2xl bg-[#EEF0FF] text-[#6366F1]"><FolderKanban size={22} aria-hidden /></span>
                      <span className="rounded-full bg-[#F2F4FA] px-3 py-1 text-xs font-semibold text-[#6D7285]">{collectionComponents.length} items</span>
                    </div>
                    <h2 className="mt-5 text-xl font-bold tracking-[-0.02em]">{collection.name}</h2>
                    <p className="mt-2 text-sm leading-6 text-[#6D7285]">{collection.description}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {collectionComponents.slice(0, 4).map((component) => <span key={component.id} className="rounded-full border border-[#E4E7EF] px-2.5 py-1 text-xs text-[#6D7285]">{component.name}</span>)}
                    </div>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#6366F1]">Open collection <ArrowRight size={15} className="transition group-hover:translate-x-1" aria-hidden /></span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {createOpen ? (
          <motion.div className="fixed inset-0 z-[70] grid place-items-center bg-[#171A2B]/28 px-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={() => setCreateOpen(false)}>
            <motion.div className="w-full max-w-lg rounded-[32px] bg-white p-6 shadow-2xl" initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }} onMouseDown={(event) => event.stopPropagation()}>
              <div className="flex items-center justify-between"><div><h2 className="text-xl font-bold">New collection</h2><p className="mt-1 text-sm text-[#6D7285]">It will be stored in Convex immediately.</p></div><button className="grid size-10 place-items-center rounded-2xl bg-[#F2F4FA]" onClick={() => setCreateOpen(false)}><X size={18} aria-hidden /></button></div>
              <label className="mt-6 block text-sm font-medium">Name<input className="mt-2 h-11 w-full rounded-2xl border border-[#E4E7EF] px-4 outline-none focus:border-[#6366F1]" value={name} onChange={(event) => setName(event.target.value)} autoFocus /></label>
              <label className="mt-4 block text-sm font-medium">Description<textarea className="mt-2 min-h-24 w-full rounded-2xl border border-[#E4E7EF] p-4 outline-none focus:border-[#6366F1]" value={description} onChange={(event) => setDescription(event.target.value)} /></label>
              <div className="mt-6 flex justify-end gap-2"><button className="min-h-11 rounded-2xl border border-[#E4E7EF] px-4 text-sm font-semibold" onClick={() => setCreateOpen(false)}>Cancel</button><button className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[#6366F1] px-5 text-sm font-semibold text-white disabled:opacity-60" disabled={saving || !name.trim()} onClick={() => void handleCreate()}><Plus size={16} aria-hidden /> {saving ? "Creating..." : "Create collection"}</button></div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </AppShell>
  );
}

function CollectionManager({
  collection,
  components,
  onUpdate,
  onToggle,
  onDelete,
}: {
  collection: { id: string; name: string; description: string; componentIds: string[] };
  components: ReturnType<typeof useVaultStore.getState>["components"];
  onUpdate: (patch: { name?: string; description?: string }) => Promise<unknown>;
  onToggle: (componentId: string) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [name, setName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = components.filter((component) => [component.name, component.category, ...component.tags].join(" ").toLowerCase().includes(query.toLowerCase()));

  async function save() {
    setSaving(true);
    await onUpdate({ name: name.trim() || collection.name, description: description.trim() });
    setSaving(false);
  }

  return (
    <div className="mt-8 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="h-fit rounded-[30px] border border-[#E4E7EF] bg-white p-5 shadow-[0_18px_70px_rgba(23,26,43,0.045)]">
        <h2 className="text-lg font-bold">Collection details</h2>
        <label className="mt-5 block text-sm font-medium">Name<input className="mt-2 h-11 w-full rounded-2xl border border-[#E4E7EF] px-4 outline-none focus:border-[#6366F1]" value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label className="mt-4 block text-sm font-medium">Description<textarea className="mt-2 min-h-28 w-full rounded-2xl border border-[#E4E7EF] p-4 outline-none focus:border-[#6366F1]" value={description} onChange={(event) => setDescription(event.target.value)} /></label>
        <button className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#6366F1] px-4 text-sm font-semibold text-white disabled:opacity-60" onClick={() => void save()} disabled={saving}><Save size={16} aria-hidden /> {saving ? "Saving..." : "Save details"}</button>
        <button className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-600" onClick={() => void onDelete()}><Trash2 size={16} aria-hidden /> Delete collection</button>
      </aside>

      <section className="rounded-[30px] border border-[#E4E7EF] bg-white p-5 shadow-[0_18px_70px_rgba(23,26,43,0.045)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-xl font-bold">Components</h2><p className="mt-1 text-sm text-[#6D7285]">Click an item to add or remove it. Changes sync to Convex.</p></div><span className="rounded-full bg-[#EEF0FF] px-3 py-1 text-xs font-semibold text-[#6366F1]">{collection.componentIds.length} selected</span></div>
        <input className="mt-5 h-11 w-full rounded-2xl border border-[#E4E7EF] px-4 text-sm outline-none focus:border-[#6366F1]" placeholder="Search components..." value={query} onChange={(event) => setQuery(event.target.value)} />
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {filtered.map((component) => {
            const active = collection.componentIds.includes(component.id);
            return (
              <button key={component.id} className={active ? "flex items-center gap-3 rounded-2xl border border-[#A8ABFF] bg-[#F4F4FF] p-4 text-left" : "flex items-center gap-3 rounded-2xl border border-[#E4E7EF] bg-[#F9FAFD] p-4 text-left hover:border-[#C9CDDA]"} onClick={() => void onToggle(component.id)}>
                <span className={active ? "grid size-9 shrink-0 place-items-center rounded-xl bg-[#6366F1] text-white" : "grid size-9 shrink-0 place-items-center rounded-xl bg-white text-[#9A9FB1]"}>{active ? <Check size={16} aria-hidden /> : <Plus size={16} aria-hidden />}</span>
                <span className="min-w-0"><strong className="block truncate text-sm">{component.name}</strong><span className="text-xs text-[#6D7285]">{component.category}</span></span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
