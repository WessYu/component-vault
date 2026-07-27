"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

export function ProtectedVault({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(!isSupabaseConfigured);

  useEffect(() => {
    let mounted = true;
    async function checkSession() {
      if (!isSupabaseConfigured) {
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
    }

    checkSession();
    return () => {
      mounted = false;
    };
  }, [router]);

  if (!ready) {
    return (
      <main className="grid min-h-dvh place-items-center bg-background p-4">
        <div className="retro-panel-inset bg-terminal p-5 font-tech text-green">Checking vault credentials...</div>
      </main>
    );
  }

  return children;
}
