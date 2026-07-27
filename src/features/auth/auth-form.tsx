"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, LogIn, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "./auth-schema";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const schema = mode === "login" ? loginSchema : registerSchema;
  const form = useForm<LoginInput | RegisterInput>({
    resolver: zodResolver(schema),
    defaultValues:
      mode === "login"
        ? { email: "demo@componentvault.dev", password: "vault-demo" }
        : { name: "", email: "", password: "" },
  });

  async function onSubmit(values: LoginInput | RegisterInput) {
    setMessage(null);
    const supabase = getSupabaseBrowserClient();

    if (supabase) {
      const result =
        mode === "login"
          ? await supabase.auth.signInWithPassword(values)
          : await supabase.auth.signUp({
              email: values.email,
              password: values.password,
              options: { data: { name: "name" in values ? values.name : "" } },
            });

      if (result.error) {
        setMessage(result.error.message);
        return;
      }
    } else {
      window.localStorage.setItem(
        "component-vault-demo-session",
        JSON.stringify({
          email: values.email,
          name: "name" in values ? values.name : "Demo Operator",
          createdAt: new Date().toISOString(),
        }),
      );
    }

    router.push("/vault");
  }

  const Icon = mode === "login" ? LogIn : UserPlus;

  return (
    <main className="min-h-dvh bg-background p-3 text-text-primary md:p-6">
      <section className="mx-auto grid min-h-[calc(100dvh-48px)] max-w-5xl place-items-center">
        <div className="retro-panel grid w-full max-w-4xl overflow-hidden md:grid-cols-[1fr_420px]">
          <div className="scanline bg-terminal p-6 text-surface-light md:p-8">
            <div className="font-tech text-xs text-green">AUTH_GATEWAY.EXE</div>
            <h1 className="mt-8 font-tech text-4xl font-bold uppercase leading-tight text-orange">Component Vault</h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-surface-light/80">
              Secure access to your personal component workstation. Sessions persist through Supabase Auth when credentials are configured.
            </p>
            <div className="mt-8 retro-panel-inset border-green/60 bg-terminal/80 p-4 font-tech text-xs text-green">
              <p>BOOT CHECK: OK</p>
              <p>WORKSPACE: PRIVATE</p>
              <p>SUPABASE: {isSupabaseConfigured ? "CONNECTED" : "DEMO FALLBACK"}</p>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="bg-surface-light p-5 md:p-7">
            <div className="mb-5 flex items-center gap-3 border-b border-surface-dark pb-4">
              <span className="grid size-10 place-items-center bg-navy text-surface-light">
                <Icon size={18} aria-hidden />
              </span>
              <div>
                <h2 className="font-tech text-xl font-bold uppercase">{mode === "login" ? "LOGIN" : "REGISTER"}</h2>
                <p className="text-sm text-text-secondary">{mode === "login" ? "Open your vault session." : "Create a new vault profile."}</p>
              </div>
            </div>

            {mode === "register" ? (
              <label className="mb-4 block text-sm font-semibold">
                Name
                <input className="retro-panel-inset mt-1 w-full bg-surface-light px-3 py-2" {...form.register("name" as keyof RegisterInput)} />
                {"name" in form.formState.errors ? <span className="mt-1 block text-xs text-danger">{form.formState.errors.name?.message}</span> : null}
              </label>
            ) : null}

            <label className="mb-4 block text-sm font-semibold">
              Email
              <input className="retro-panel-inset mt-1 w-full bg-surface-light px-3 py-2" type="email" {...form.register("email")} />
              <span className="mt-1 block text-xs text-danger">{form.formState.errors.email?.message}</span>
            </label>

            <label className="mb-4 block text-sm font-semibold">
              Password
              <input className="retro-panel-inset mt-1 w-full bg-surface-light px-3 py-2" type="password" {...form.register("password")} />
              <span className="mt-1 block text-xs text-danger">{form.formState.errors.password?.message}</span>
            </label>

            {message ? (
              <p className="mb-4 flex items-center gap-2 border border-danger bg-danger/10 px-3 py-2 text-sm text-danger">
                <AlertTriangle size={16} aria-hidden /> {message}
              </p>
            ) : null}

            <button disabled={form.formState.isSubmitting} className="pressable w-full bg-orange px-4 py-3 font-tech text-sm font-bold uppercase text-surface-light">
              {form.formState.isSubmitting ? "Checking..." : mode === "login" ? "Enter the Vault" : "Create Account"}
            </button>

            <div className="mt-5 flex items-center justify-between text-sm">
              <Link className="font-semibold text-navy hover:underline" href={mode === "login" ? "/register" : "/login"}>
                {mode === "login" ? "Create account" : "Already registered"}
              </Link>
              <button type="button" className="text-text-secondary hover:text-navy" onClick={() => setMessage("Password reset link would be sent by Supabase Auth when configured.")}>
                Forgot password?
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
