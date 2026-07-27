"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import { getLocalSession } from "@/services/vault-service";

export function ProtectedVault({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function checkSession() {
      try {
        if (!isSupabaseConfigured) {
          await getLocalSession();
          if (!mounted) return;
          setReady(true);
          return;
        }

        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase!.auth.getSession();
        if (!mounted) return;
        if (!data.session) {
          router.replace("/login");
          return;
        }
        setReady(true);
      } catch {
        if (mounted) {
          router.replace("/login");
        }
      }
    }

    checkSession();
    return () => {
      mounted = false;
    };
  }, [router]);

  if (!ready) {
    return (
      <main className="grid min-h-dvh place-items-center bg-background p-4">
        <div className="rounded-3xl border border-[#E4E7EF] bg-white p-5 text-sm font-semibold text-[#6366F1] shadow-xl shadow-indigo-100">Checking vault credentials...</div>
      </main>
    );
  }

  return children;
}
