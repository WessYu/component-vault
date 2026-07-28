"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bell, Check, Command, Heart, LogIn, LogOut, Plus, Search, Settings, SlidersHorizontal, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useVaultStore } from "@/stores/vault-store";
import { cn } from "@/lib/utils";
import { fastMotion, motionEase } from "@/components/motion/site-motion";
import { getLocalSession, localLogout } from "@/services/vault-service";

type SessionUser = { id: string; name: string; email: string; favoriteComponentIds?: string[] };

export function Topbar({ onCreate }: { onCreate?: () => void }) {
  const router = useRouter();
  const components = useVaultStore((state) => state.components);
  const collections = useVaultStore((state) => state.collections);
  const createComponent = useVaultStore((state) => state.createComponent);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    void getLocalSession()
      .then((payload) => setUser(payload.user))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    let frame = 0;
    function handleScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = window.scrollY > 18;
        setScrolled((current) => (current === next ? current : next));
      });
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isCommand = event.ctrlKey || event.metaKey;
      if (isCommand && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(true);
      }
      if (event.key === "Escape") {
        setPaletteOpen(false);
        setNotificationsOpen(false);
        setAccountOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (paletteOpen) window.setTimeout(() => inputRef.current?.focus(), 20);
  }, [paletteOpen]);

  const results = useMemo(() => {
    const term = query.toLowerCase();
    const componentResults = components
      .filter((component) => [component.name, component.category, ...component.tags].join(" ").toLowerCase().includes(term))
      .slice(0, 6)
      .map((component) => ({ label: component.name, meta: component.category, href: `/vault/components/${component.slug}` }));
    const collectionResults = collections
      .filter((collection) => collection.name.toLowerCase().includes(term))
      .slice(0, 3)
      .map((collection) => ({ label: collection.name, meta: "Collection", href: `/vault/collections/${collection.id}` }));
    return [...componentResults, ...collectionResults];
  }, [collections, components, query]);

  async function handleCreate() {
    if (!user) {
      router.push("/login");
      return;
    }
    if (onCreate) {
      onCreate();
      return;
    }

    const component = await createComponent({
      name: "Untitled Component",
      description: "New backend-backed component ready for implementation.",
      tags: ["draft", "backend"],
    });
    router.push(component ? `/vault/components/${component.slug}` : "/vault/components");
  }

  function handleFilters() {
    setAccountOpen(false);
    setNotificationsOpen(false);
    if (window.location.pathname !== "/vault/components" && window.location.pathname !== "/vault/favorites") {
      router.push("/vault/components#component-filters");
      return;
    }
    document.getElementById("component-filters")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function handleLogout() {
    await localLogout();
    setUser(null);
    setAccountOpen(false);
    router.push("/login");
    router.refresh();
  }

  const initial = user?.name?.trim().charAt(0).toUpperCase() || "?";
  const favoriteCount = components.filter((component) => component.isFavorite).length;

  return (
    <>
      <motion.header
        className={cn(
          "sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#E4E7EF]/75 px-4 transition-[background-color,box-shadow] duration-150 md:px-6",
          scrolled ? "bg-[#F7F8FC]/95 shadow-[0_8px_24px_rgba(23,26,43,0.045)] backdrop-blur-lg" : "bg-[#F7F8FC]/86 backdrop-blur-md",
        )}
        initial={reduceMotion ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: motionEase }}
      >
        <motion.button
          className="group flex h-10 min-w-0 flex-1 items-center gap-3 rounded-2xl border border-[#E4E7EF] bg-white px-4 text-left text-sm text-[#9A9FB1] shadow-sm transition-colors duration-150 hover:border-[#C9CDDA] md:max-w-xl"
          onClick={() => setPaletteOpen(true)}
          whileHover={reduceMotion ? undefined : { y: -1 }}
          whileTap={reduceMotion ? undefined : { scale: 0.99 }}
          transition={fastMotion}
        >
          <Search size={17} aria-hidden />
          <span className="truncate transition-colors group-hover:text-[#6D7285]">Search components, categories, or tags...</span>
          <span className="ml-auto hidden rounded-md border border-[#E4E7EF] bg-[#F7F8FC] px-1.5 py-0.5 text-[11px] font-medium text-[#6D7285] sm:inline">Ctrl K</span>
        </motion.button>

        <motion.button
          className="grid size-10 place-items-center rounded-2xl border border-[#E4E7EF] bg-white text-[#6D7285] shadow-sm"
          aria-label="Jump to filters"
          onClick={handleFilters}
          whileHover={reduceMotion ? undefined : { y: -1 }}
          whileTap={reduceMotion ? undefined : { scale: 0.94 }}
          transition={fastMotion}
        >
          <SlidersHorizontal size={17} aria-hidden />
        </motion.button>

        <motion.button
          className="group inline-flex min-h-10 items-center gap-2 rounded-2xl bg-[#6366F1] px-4 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-colors duration-150 hover:bg-[#5558e8]"
          onClick={() => void handleCreate()}
          whileHover={reduceMotion ? undefined : { y: -1, scale: 1.006 }}
          whileTap={reduceMotion ? undefined : { scale: 0.975 }}
          transition={fastMotion}
        >
          <Plus size={17} aria-hidden />
          <span className="hidden sm:inline">New Component</span>
        </motion.button>

        <div className="relative">
          <motion.button
            className="relative grid size-10 place-items-center rounded-2xl border border-[#E4E7EF] bg-white text-[#6D7285] shadow-sm"
            aria-label="Open updates"
            aria-expanded={notificationsOpen}
            onClick={() => {
              setNotificationsOpen((value) => !value);
              setAccountOpen(false);
            }}
            whileHover={reduceMotion ? undefined : { y: -1 }}
            whileTap={reduceMotion ? undefined : { scale: 0.94 }}
            transition={fastMotion}
          >
            <Bell size={17} aria-hidden />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-[#51C89B]" />
          </motion.button>
          <AnimatePresence>
            {notificationsOpen ? (
              <motion.div className="absolute right-0 top-12 w-80 rounded-3xl border border-[#E4E7EF] bg-white p-3 shadow-[0_24px_70px_rgba(23,26,43,0.14)]" initial={{ opacity: 0, y: 6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4 }}>
                <p className="px-2 py-2 text-sm font-bold text-[#171A2B]">Workspace updates</p>
                <div className="rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-800"><strong>Backend connected.</strong><p className="mt-1 text-xs leading-5 text-emerald-700">Convex is ready and account data can be persisted.</p></div>
                <div className="mt-2 rounded-2xl bg-[#F7F8FC] p-3 text-sm text-[#6D7285]"><strong className="text-[#171A2B]">Favorites</strong><p className="mt-1 text-xs leading-5">{user ? `${favoriteCount} saved to your account.` : "Sign in to keep favorites across devices."}</p></div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="relative">
          <motion.button
            className="flex min-h-10 items-center gap-2 rounded-2xl border border-[#E4E7EF] bg-white px-2 shadow-sm"
            aria-label="Account menu"
            aria-expanded={accountOpen}
            onClick={() => {
              setAccountOpen((value) => !value);
              setNotificationsOpen(false);
            }}
            whileHover={reduceMotion ? undefined : { y: -1 }}
            whileTap={reduceMotion ? undefined : { scale: 0.96 }}
            transition={fastMotion}
          >
            <span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-[#F1BE48] to-[#FF7664] text-xs font-semibold text-white">{initial}</span>
          </motion.button>
          <AnimatePresence>
            {accountOpen ? (
              <motion.div className="absolute right-0 top-12 w-72 overflow-hidden rounded-3xl border border-[#E4E7EF] bg-white shadow-[0_24px_70px_rgba(23,26,43,0.14)]" initial={{ opacity: 0, y: 6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4 }}>
                {user ? (
                  <>
                    <div className="border-b border-[#E4E7EF] p-4"><p className="font-bold text-[#171A2B]">{user.name}</p><p className="mt-1 truncate text-xs text-[#6D7285]">{user.email}</p></div>
                    <div className="p-2">
                      <Link href="/vault/favorites" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-[#171A2B] hover:bg-[#F7F8FC]"><Heart size={16} /> My favorites <span className="ml-auto rounded-full bg-[#EEF0FF] px-2 py-0.5 text-xs font-semibold text-[#6366F1]">{favoriteCount}</span></Link>
                      <Link href="/vault/settings" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-[#171A2B] hover:bg-[#F7F8FC]"><Settings size={16} /> Settings</Link>
                      <button onClick={() => void handleLogout()} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"><LogOut size={16} /> Sign out</button>
                    </div>
                  </>
                ) : (
                  <div className="p-3">
                    <p className="px-2 pb-3 text-sm text-[#6D7285]">Sign in to save favorites and create components.</p>
                    <Link href="/login" className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-[#6366F1] hover:bg-[#F7F8FC]"><LogIn size={16} /> Sign in</Link>
                    <Link href="/register" className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-[#171A2B] hover:bg-[#F7F8FC]"><UserPlus size={16} /> Create account</Link>
                  </div>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.header>

      <AnimatePresence>
        {paletteOpen ? (
          <motion.div className="fixed inset-0 z-50 grid place-items-start bg-[#171A2B]/26 px-4 py-24 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} onMouseDown={() => setPaletteOpen(false)}>
            <motion.div className="mx-auto w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_24px_72px_rgba(23,26,43,0.18)]" initial={reduceMotion ? false : { opacity: 0, scale: 0.985, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, scale: 0.99, y: 4 }} transition={{ duration: 0.16, ease: motionEase }} onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Command palette">
              <div className="flex items-center gap-3 border-b border-[#E4E7EF] px-4 py-3">
                <Command size={18} className="text-[#6366F1]" aria-hidden />
                <input ref={inputRef} className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Jump to a component, collection or command..." value={query} onChange={(event) => setQuery(event.target.value)} />
                <button className="grid size-8 place-items-center rounded-xl text-[#9A9FB1] transition-colors hover:bg-[#F2F4FA] hover:text-[#171A2B]" onClick={() => setPaletteOpen(false)} aria-label="Close command palette"><X size={17} aria-hidden /></button>
              </div>
              <div className="max-h-[420px] overflow-auto p-2">
                <AnimatePresence initial={false}>
                  {results.map((result) => (
                    <motion.div key={`${result.href}-${result.label}`} initial={reduceMotion ? false : { opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0 }} transition={{ duration: 0.1 }}>
                      <Link href={result.href} className="group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-colors duration-100 hover:bg-[#F2F4FA]" onClick={() => setPaletteOpen(false)}>
                        <span className="grid size-9 place-items-center rounded-2xl bg-[#EEF0FF] text-[#6366F1]"><Check size={16} aria-hidden /></span>
                        <span className="min-w-0 flex-1"><span className="block truncate font-medium text-[#171A2B]">{result.label}</span><span className="text-xs text-[#9A9FB1]">{result.meta}</span></span>
                      </Link>
                    </motion.div>
                  ))}
                  {results.length === 0 ? <p className="px-4 py-8 text-center text-sm text-[#9A9FB1]">No matching commands.</p> : null}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
