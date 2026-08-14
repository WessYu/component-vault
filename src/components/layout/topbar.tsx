"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Command, Heart, LogIn, LogOut, Plus, Search, Settings, ShieldCheck, SlidersHorizontal, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useVaultStore } from "@/stores/vault-store";
import { cn } from "@/lib/utils";
import { fastMotion, motionEase } from "@/components/motion/site-motion";
import { getLocalSession, localLogout } from "@/services/vault-service";

type SessionUser = { id: string; name: string; email: string; role?: "admin" | "user"; favoriteComponentIds?: string[] };

export function Topbar({ onCreate }: { onCreate?: () => void }) {
  const router = useRouter();
  const components = useVaultStore((state) => state.components);
  const collections = useVaultStore((state) => state.collections);
  const createComponent = useVaultStore((state) => state.createComponent);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => { void getLocalSession().then((payload) => setUser(payload.user)).catch(() => setUser(null)); }, []);
  useEffect(() => { let frame = 0; function handleScroll() { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => { const next = window.scrollY > 18; setScrolled((current) => current === next ? current : next); }); } handleScroll(); window.addEventListener("scroll", handleScroll, { passive: true }); return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", handleScroll); }; }, []);
  useEffect(() => { function handleKeyDown(event: KeyboardEvent) { const isCommand = event.ctrlKey || event.metaKey; if (isCommand && event.key.toLowerCase() === "k") { event.preventDefault(); setPaletteOpen(true); } if (event.key === "Escape") { setPaletteOpen(false); setAccountOpen(false); } } window.addEventListener("keydown", handleKeyDown); return () => window.removeEventListener("keydown", handleKeyDown); }, []);
  useEffect(() => { if (paletteOpen) window.setTimeout(() => inputRef.current?.focus(), 20); }, [paletteOpen]);

  const initial = user?.name?.trim().charAt(0).toUpperCase() || "?";
  const favoriteCount = components.filter((component) => component.isFavorite).length;
  const isAdmin = user?.role === "admin";
  const results = useMemo(() => {
    const term = query.toLowerCase();
    const componentResults = components.filter((component) => [component.name, component.category, ...component.tags].join(" ").toLowerCase().includes(term)).slice(0, 6).map((component) => ({ label: component.name, meta: component.category, href: `/vault/components/${component.slug}` }));
    const collectionResults = collections.filter((collection) => collection.name.toLowerCase().includes(term)).slice(0, 3).map((collection) => ({ label: collection.name, meta: "Collection", href: `/vault/collections/${collection.id}` }));
    const adminResult = isAdmin && "admin workspace painel".includes(term) ? [{ label: "Admin Studio", meta: "Owner workspace", href: "/vault/admin" }] : [];
    return [...adminResult, ...componentResults, ...collectionResults];
  }, [collections, components, isAdmin, query]);

  async function handleCreate() { if (!user) { router.push("/login"); return; } if (onCreate) { onCreate(); return; } const component = await createComponent({ name: "Untitled Component", description: "New backend-backed component ready for implementation.", tags: ["draft", "backend"] }); router.push(component ? `/vault/components/${component.slug}` : "/vault/components"); }
  function handleFilters() { setAccountOpen(false); if (window.location.pathname !== "/vault/components" && window.location.pathname !== "/vault/favorites") { router.push("/vault/components#component-filters"); return; } document.getElementById("component-filters")?.scrollIntoView({ behavior: "smooth", block: "center" }); }
  async function handleLogout() { await localLogout(); setUser(null); setAccountOpen(false); router.push("/login"); router.refresh(); }

  return (
    <>
      <motion.header className={cn("sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#E4E7EF]/75 px-4 transition-[background-color,box-shadow] duration-150 md:px-6", scrolled ? "bg-[#F7F8FC]/95 shadow-[0_8px_24px_rgba(23,26,43,0.045)] backdrop-blur-lg" : "bg-[#F7F8FC]/86 backdrop-blur-md")} initial={reduceMotion ? false : { opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: motionEase }}>
        <motion.button className="group flex h-10 min-w-0 flex-1 items-center gap-3 rounded-2xl border border-[#E4E7EF] bg-white px-4 text-left text-sm text-[#9A9FB1] shadow-sm transition-colors duration-150 hover:border-[#C9CDDA] md:max-w-xl" onClick={() => setPaletteOpen(true)} whileHover={reduceMotion ? undefined : { y: -1 }} whileTap={reduceMotion ? undefined : { scale: 0.99 }} transition={fastMotion}>
          <Search size={17} aria-hidden /><span className="truncate transition-colors group-hover:text-[#6D7285]">Search components, categories, or tags...</span><span className="ml-auto hidden rounded-md border border-[#E4E7EF] bg-[#F7F8FC] px-1.5 py-0.5 text-[11px] font-medium text-[#6D7285] sm:inline">Ctrl K</span>
        </motion.button>
        <motion.button className="grid size-10 place-items-center rounded-2xl border border-[#E4E7EF] bg-white text-[#6D7285] shadow-sm" aria-label="Jump to filters" onClick={handleFilters} whileHover={reduceMotion ? undefined : { y: -1 }} whileTap={reduceMotion ? undefined : { scale: 0.94 }} transition={fastMotion}><SlidersHorizontal size={17} aria-hidden /></motion.button>
        <Link href="/vault/settings" aria-label="Settings" title="Settings" className="grid size-10 place-items-center rounded-2xl border border-[#E4E7EF] bg-white text-[#6D7285] shadow-sm transition hover:-translate-y-0.5 hover:border-[#C9CDDA] hover:text-[#6366F1]"><Settings size={17} aria-hidden /></Link>
        {isAdmin ? <Link href="/vault/admin" className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-[#C9C7FF] bg-[#F7F7FF] px-3 text-sm font-semibold text-[#6366F1] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#EEF0FF]"><ShieldCheck size={16} aria-hidden /><span className="hidden md:inline">Admin</span></Link> : null}
        <motion.button className="group inline-flex min-h-10 items-center gap-2 rounded-2xl bg-[#6366F1] px-4 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-colors duration-150 hover:bg-[#5558e8]" onClick={() => void handleCreate()} whileHover={reduceMotion ? undefined : { y: -1, scale: 1.006 }} whileTap={reduceMotion ? undefined : { scale: 0.975 }} transition={fastMotion}><Plus size={17} aria-hidden /><span className="hidden sm:inline">New Component</span></motion.button>
        <div className="relative"><motion.button className={cn("flex min-h-10 items-center gap-2 rounded-2xl border bg-white px-2 shadow-sm", isAdmin ? "border-[#C9C7FF] ring-2 ring-[#6366F1]/10" : "border-[#E4E7EF]")} aria-label="Account menu" aria-expanded={accountOpen} onClick={() => setAccountOpen((value) => !value)} whileHover={reduceMotion ? undefined : { y: -1 }} whileTap={reduceMotion ? undefined : { scale: 0.96 }} transition={fastMotion}><span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-[#F1BE48] to-[#FF7664] text-xs font-semibold text-white">{initial}</span>{isAdmin ? <ShieldCheck size={15} className="mr-1 text-[#6366F1]" aria-hidden /> : null}</motion.button>
          <AnimatePresence>{accountOpen ? <motion.div className="absolute right-0 top-12 w-72 overflow-hidden rounded-3xl border border-[#E4E7EF] bg-white shadow-[0_24px_70px_rgba(23,26,43,0.14)]" initial={{ opacity: 0, y: 6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4 }}>{user ? <><div className="border-b border-[#E4E7EF] p-4"><div className="flex items-center gap-2"><p className="min-w-0 flex-1 truncate font-bold text-text-primary">{user.name}</p>{isAdmin ? <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF0FF] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6366F1]"><ShieldCheck size={11} aria-hidden /> Admin</span> : null}</div><p className="mt-1 truncate text-xs text-[#6D7285]">{user.email}</p></div><div className="p-2">{isAdmin ? <Link href="/vault/admin" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 rounded-2xl bg-[#F7F7FF] px-3 py-2.5 text-sm font-semibold text-[#6366F1] hover:bg-[#EEF0FF]"><ShieldCheck size={16} /> Admin panel</Link> : null}<Link href="/vault/favorites" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-text-primary hover:bg-[#F7F8FC]"><Heart size={16} /> My favorites <span className="ml-auto rounded-full bg-[#EEF0FF] px-2 py-0.5 text-xs font-semibold text-[#6366F1]">{favoriteCount}</span></Link><Link href="/vault/settings" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-text-primary hover:bg-[#F7F8FC]"><Settings size={16} /> Settings</Link><button onClick={() => void handleLogout()} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"><LogOut size={16} /> Sign out</button></div></> : <div className="p-3"><p className="px-2 pb-3 text-sm text-[#6D7285]">Sign in to save favorites and create components.</p><Link href="/login" className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-[#6366F1] hover:bg-[#F7F8FC]"><LogIn size={16} /> Sign in</Link><Link href="/register" className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-text-primary hover:bg-[#F7F8FC]"><UserPlus size={16} /> Create account</Link></div>}</motion.div> : null}</AnimatePresence>
        </div>
      </motion.header>
    </>
  );
}
