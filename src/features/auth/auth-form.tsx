"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, CheckCircle2, LockKeyhole, LogIn, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { BrandMark } from "@/components/brand/brand-mark";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import { localLogin, localRegister, requestLocalPasswordReset } from "@/services/vault-service";
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "./auth-schema";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
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

    try {
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
      } else if (mode === "login") {
        await localLogin({ email: values.email, password: values.password });
      } else {
        await localRegister({
          name: "name" in values ? values.name : "Vault User",
          email: values.email,
          password: values.password,
        });
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to authenticate.");
      return;
    }

    router.push("/vault");
  }

  async function handlePasswordReset() {
    setMessage(null);
    const email = form.getValues("email");
    if (!email) {
      setMessage("Enter your email before requesting a password reset.");
      return;
    }

    setIsResetting(true);
    try {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const result = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (result.error) {
          setMessage(result.error.message);
        } else {
          setMessage("Password reset email sent.");
        }
        return;
      }

      const result = await requestLocalPasswordReset(email);
      if (result.resetUrl) {
        const resetUrl = new URL(result.resetUrl);
        router.push(`${resetUrl.pathname}${resetUrl.search}`);
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to request a password reset.");
    } finally {
      setIsResetting(false);
    }
  }

  const Icon = mode === "login" ? LogIn : UserPlus;

  return (
    <main className="min-h-dvh bg-[#F7F8FC] px-4 py-6 text-[#171A2B] md:px-7">
      <section className="mx-auto grid min-h-[calc(100dvh-48px)] max-w-6xl place-items-center">
        <div className="grid w-full overflow-hidden rounded-[34px] border border-[#E4E7EF] bg-white shadow-[0_30px_120px_rgba(23,26,43,0.09)] lg:grid-cols-[1fr_440px]">
          <div className="relative overflow-hidden bg-[#171A2B] p-7 text-white md:p-10">
            <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-tr from-[#6366F1]/60 via-[#9A78FF]/35 to-[#E978D4]/45 blur-3xl" />
            <div className="relative">
              <Link href="/" className="inline-flex items-center gap-3">
                <BrandMark size="lg" className="shadow-lg shadow-indigo-950/30" />
                <span>
                  <span className="block text-sm font-semibold">Component Vault</span>
                  <span className="text-xs text-white/55">Visual component workspace</span>
                </span>
              </Link>

              <h1 className="mt-16 max-w-xl text-5xl font-bold tracking-[-0.055em] md:text-6xl">
                Build, preview and ship reusable UI.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-white/72">
                Access your clean component library with previews, props, code, usage notes and design tokens in one workspace.
              </p>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {[
                  ["342", "Components"],
                  ["18", "Collections"],
                  ["96%", "Token coverage"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-3xl border border-white/10 bg-white/8 p-4 backdrop-blur">
                    <p className="text-2xl font-bold tracking-[-0.03em]">{value}</p>
                    <p className="mt-1 text-xs font-medium text-white/58">{label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {["Preview", "Code", "Accessibility", "Changelog"].map((item) => (
                  <span key={item} className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-semibold text-white/76">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
            <div className="flex items-start gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-[#EEF0FF] text-[#6366F1]">
                <Icon size={20} aria-hidden />
              </span>
              <div>
                <h2 className="text-2xl font-bold tracking-[-0.03em] text-[#171A2B]">{mode === "login" ? "Welcome back" : "Create account"}</h2>
                <p className="mt-1 text-sm leading-6 text-[#6D7285]">{mode === "login" ? "Open your component workspace." : "Start a new component workspace."}</p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {mode === "register" ? (
                <label className="block text-sm font-semibold text-[#171A2B]">
                  Name
                  <input className="mt-2 min-h-12 w-full rounded-2xl border border-[#E4E7EF] bg-[#F7F8FC] px-4 text-sm outline-none transition focus:border-[#6366F1] focus:bg-white" {...form.register("name" as keyof RegisterInput)} />
                  {"name" in form.formState.errors ? <span className="mt-1 block text-xs text-[#EF4444]">{form.formState.errors.name?.message}</span> : null}
                </label>
              ) : null}

              <label className="block text-sm font-semibold text-[#171A2B]">
                Email
                <input className="mt-2 min-h-12 w-full rounded-2xl border border-[#E4E7EF] bg-[#F7F8FC] px-4 text-sm outline-none transition focus:border-[#6366F1] focus:bg-white" type="email" {...form.register("email")} />
                <span className="mt-1 block text-xs text-[#EF4444]">{form.formState.errors.email?.message}</span>
              </label>

              <label className="block text-sm font-semibold text-[#171A2B]">
                Password
                <input className="mt-2 min-h-12 w-full rounded-2xl border border-[#E4E7EF] bg-[#F7F8FC] px-4 text-sm outline-none transition focus:border-[#6366F1] focus:bg-white" type="password" {...form.register("password")} />
                <span className="mt-1 block text-xs text-[#EF4444]">{form.formState.errors.password?.message}</span>
              </label>
            </div>

            <div className="mt-5 rounded-3xl border border-[#E4E7EF] bg-[#F7F8FC] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#171A2B]">
                <LockKeyhole size={16} aria-hidden />
                {isSupabaseConfigured ? "Supabase connected" : "Local backend session"}
              </div>
              <p className="mt-2 text-sm leading-6 text-[#6D7285]">
                {isSupabaseConfigured ? "Authentication is handled by the configured Supabase project." : "The Next backend creates a httpOnly session cookie for this workspace."}
              </p>
            </div>

            {message ? (
              <p className="mt-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#B42318]">
                <AlertTriangle size={16} aria-hidden /> {message}
              </p>
            ) : null}

            <button disabled={form.formState.isSubmitting} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#6366F1] px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-[#5558E8] disabled:cursor-not-allowed disabled:opacity-60">
              <CheckCircle2 size={17} aria-hidden />
              {form.formState.isSubmitting ? "Checking..." : mode === "login" ? "Enter workspace" : "Create workspace"}
            </button>

            <div className="mt-5 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <Link className="font-semibold text-[#6366F1] hover:text-[#4F46E5]" href={mode === "login" ? "/register" : "/login"}>
                {mode === "login" ? "Create account" : "Already registered"}
              </Link>
              <button type="button" className="w-fit text-[#6D7285] hover:text-[#171A2B] disabled:cursor-not-allowed disabled:opacity-50" disabled={isResetting} onClick={handlePasswordReset}>
                {isResetting ? "Preparing reset..." : "Forgot password?"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
