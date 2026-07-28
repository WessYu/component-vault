import Link from "next/link";
import { Boxes, Crown, FolderKanban, Settings, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

export function AdminView({
  user,
  componentCount,
  collectionCount,
}: {
  user: { name: string; email: string };
  componentCount: number;
  collectionCount: number;
}) {
  return (
    <AppShell active="Settings">
      <section className="px-4 py-7 md:px-7">
        <div className="mx-auto max-w-[1320px]">
          <div className="overflow-hidden rounded-[34px] border border-[#E4E7EF] bg-white shadow-[0_24px_90px_rgba(23,26,43,0.07)]">
            <div className="relative overflow-hidden bg-[#171A2B] p-7 text-white md:p-9">
              <div className="absolute -right-20 -top-20 size-72 rounded-full bg-[#6366F1]/30 blur-3xl" />
              <div className="absolute bottom-[-100px] left-[30%] size-64 rounded-full bg-[#E978D4]/20 blur-3xl" />
              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/85">
                  <Crown size={14} aria-hidden /> Administrator
                </span>
                <h1 className="mt-5 text-4xl font-bold tracking-[-0.045em] md:text-5xl">Admin workspace</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65 md:text-base">
                  Global controls for the Component Vault. This route is protected on the server and is only available to configured administrators.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
                  <span className="rounded-2xl bg-white/10 px-4 py-2 font-semibold">{user.name}</span>
                  <span className="rounded-2xl border border-white/10 px-4 py-2 text-white/65">{user.email}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-5 md:grid-cols-2 md:p-7 xl:grid-cols-3">
              <AdminCard icon={Boxes} title="Components" value={componentCount} description="Inspect and manage the shared component catalogue." href="/vault/components" action="Manage components" />
              <AdminCard icon={FolderKanban} title="Collections" value={collectionCount} description="Organize reusable groups and curated component sets." href="/vault/collections" action="Manage collections" />
              <AdminCard icon={Settings} title="Workspace" value="Admin" description="Configure workspace behavior and account preferences." href="/vault/settings" action="Open settings" />
            </div>

            <div className="mx-5 mb-5 rounded-[28px] border border-emerald-200 bg-emerald-50 p-5 md:mx-7 md:mb-7">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white text-emerald-600 shadow-sm"><ShieldCheck size={19} aria-hidden /></span>
                <div>
                  <h2 className="font-bold text-emerald-950">Server-side administrator guard enabled</h2>
                  <p className="mt-1 text-sm leading-6 text-emerald-800">Hiding the Admin link is not the security boundary. The route itself checks the authenticated session and administrator role before rendering.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function AdminCard({
  icon: Icon,
  title,
  value,
  description,
  href,
  action,
}: {
  icon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  title: string;
  value: number | string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <article className="rounded-[28px] border border-[#E4E7EF] bg-[#F8F9FD] p-5">
      <div className="flex items-center justify-between gap-4">
        <span className="grid size-11 place-items-center rounded-2xl bg-white text-[#6366F1] shadow-sm"><Icon size={20} aria-hidden /></span>
        <span className="text-3xl font-bold tracking-[-0.04em] text-[#171A2B]">{value}</span>
      </div>
      <h2 className="mt-5 text-lg font-bold text-[#171A2B]">{title}</h2>
      <p className="mt-2 min-h-12 text-sm leading-6 text-[#6D7285]">{description}</p>
      <Link href={href} className="mt-5 inline-flex min-h-10 items-center rounded-2xl bg-white px-4 text-sm font-semibold text-[#6366F1] shadow-sm ring-1 ring-[#E4E7EF] transition hover:-translate-y-0.5 hover:shadow-md">{action}</Link>
    </article>
  );
}
