"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, CheckCircle2, LockKeyhole, LogIn, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/brand/brand-mark";
import { Text } from "@/components/ui/text";
import { localLogin, localRegister, requestLocalPasswordReset } from "@/services/vault-service";
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "./auth-schema";

const rememberedEmailKey = "component-vault-login-email";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(true);
  const schema = mode === "login" ? loginSchema : registerSchema;
  const form = useForm<LoginInput | RegisterInput>({
    resolver: zodResolver(schema),
    defaultValues:
      mode === "login"
        ? { email: "", password: "" }
        : { name: "", email: "", password: "" },
  });

  useEffect(() => {
    if (mode !== "login") return;
    const rememberedEmail = window.localStorage.getItem(rememberedEmailKey);
    if (rememberedEmail) {
      form.setValue("email", rememberedEmail, { shouldValidate: false });
    }
  }, [form, mode]);

  async function onSubmit(values: LoginInput | RegisterInput) {
    setMessage(null);
    try {
      if (mode === "login") {
        await localLogin({ email: values.email, password: values.password, remember: rememberLogin });
      } else {
        await localRegister({
          name: "name" in values ? values.name : "Vault User",
          email: values.email,
          password: values.password,
        });
      }

      if (mode === "login") {
        if (rememberLogin) {
          window.localStorage.setItem(rememberedEmailKey, values.email.trim().toLowerCase());
        } else {
          window.localStorage.removeItem(rememberedEmailKey);
        }
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
    <main className="min-h-dvh bg-surface-light px-4 py-6 text-text-primary md:px-7">
      <section className="mx-auto grid min-h-[calc(100dvh-48px)] max-w-6xl place-items-center">
        <div className="grid w-full overflow-hidden rounded-[34px] border border-[#E4E7EF] bg-white shadow-[0_30px_120px_rgba(23,26,43,0.09)] lg:grid-cols-[1fr_440px]">
          <div className="relative overflow-hidden bg-navy p-7 text-white md:p-10">
            <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-tr from-[#6366F1]/60 via-[#9A78FF]/35 to-[#E978D4]/45 blur-3xl" />
            <div className="relative">
              <Link href="/" className="inline-flex items-center gap-3">
                <BrandMark size="lg" className="shadow-lg shadow-indigo-950/30" />
                <span>
                  <span className="block text-sm font-semibold">Component Vault</span>
                  <span className="text-xs text-white/55">Visual component workspace</span>
                </span>
              </Link>

              <Text.H1 className="mt-16 max-w-xl text-5xl text-white md:text-6xl">
                Build, preview and ship reusable UI.
              </Text.H1>
              <Text.Paragraph className="mt-5 max-w-lg text-base leading-7 text-white/72">
                Access your clean component library with previews, props, code, usage notes and design tokens in one workspace.
              </Text.Paragraph>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {[
                  ["342", "Components"],
                  ["18", "Collections"],
                  ["96%", "Token coverage"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-3xl border border-white/10 bg-white/8 p-4 backdrop-blur">
                    <Text.Paragraph className="text-2xl font-bold leading-none text-white">{value}</Text.Paragraph>
                    <Text.Paragraph className="mt-1 text-xs font-medium leading-5 text-white/58">{label}</Text.Paragraph>
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

          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8" autoComplete="on">
            <div className="flex items-start gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-500">
                <Icon size={20} aria-hidden />
              </span>
              <div>
                <Text.H2>{mode === "login" ? "Welcome back" : "Create account"}</Text.H2>
                <Text.Paragraph className="mt-1 text-sm leading-6">{mode === "login" ? "Open your component workspace." : "Start a new component workspace."}</Text.Paragraph>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {mode === "register" ? (
                <label className="block text-sm font-semibold text-text-primary">
                  Name
                  <input autoComplete="name" className="mt-2 min-h-12 w-full rounded-2xl border border-[#E4E7EF] bg-surface-light px-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white" {...form.register("name" as keyof RegisterInput)} />
                  {"name" in form.formState.errors ? <span className="mt-1 block text-xs text-red-500">{form.formState.errors.name?.message}</span> : null}
                </label>
              ) : null}

              <label className="block text-sm font-semibold text-text-primary">
                Email
                <input autoComplete="username" className="mt-2 min-h-12 w-full rounded-2xl border border-[#E4E7EF] bg-surface-light px-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white" type="email" {...form.register("email")} />
                <span className="mt-1 block text-xs text-red-500">{form.formState.errors.email?.message}</span>
              </label>

              <label className="block text-sm font-semibold text-text-primary">
                Password
                <input autoComplete={mode === "login" ? "current-password" : "new-password"} className="mt-2 min-h-12 w-full rounded-2xl border border-[#E4E7EF] bg-surface-light px-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white" type="password" {...form.register("password")} />
                <span className="mt-1 block text-xs text-red-500">{form.formState.errors.password?.message}</span>
              </label>
            </div>

            {mode === "login" ? (
              <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl border border-[#E4E7EF] bg-white px-4 py-3 text-sm text-text-primary transition hover:bg-surface-light">
                <input
                  type="checkbox"
                  checked={rememberLogin}
                  onChange={(event) => setRememberLogin(event.target.checked)}
                  className="size-4 accent-indigo-500"
                />
                <span>
                  <span className="block font-semibold">Lembrar de mim</span>
                  <span className="mt-0.5 block text-xs font-normal text-text-secondary">Mantém sua sessão e lembra seu e-mail neste dispositivo.</span>
                </span>
              </label>
            ) : null}

            <div className="mt-5 rounded-3xl border border-[#E4E7EF] bg-surface-light p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                <LockKeyhole size={16} aria-hidden />
                Secure Convex session
              </div>
              <Text.Paragraph className="mt-2 text-sm leading-6">
                A senha nunca é salva no navegador pelo Component Vault. A sessão usa um cookie httpOnly e o navegador pode oferecer o próprio gerenciador de senhas.
              </Text.Paragraph>
            </div>

            {message ? (
              <Text.Paragraph role="alert" className="mt-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertTriangle size={16} aria-hidden /> {message}
              </Text.Paragraph>
            ) : null}

            <button disabled={form.formState.isSubmitting} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60">
              <CheckCircle2 size={17} aria-hidden />
              {form.formState.isSubmitting ? "Checking..." : mode === "login" ? "Enter workspace" : "Create workspace"}
            </button>

            <div className="mt-5 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <Link className="font-semibold text-indigo-500 hover:text-indigo-600" href={mode === "login" ? "/register" : "/login"}>
                {mode === "login" ? "Create account" : "Already registered"}
              </Link>
              <button type="button" className="w-fit text-text-secondary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50" disabled={isResetting} onClick={handlePasswordReset}>
                {isResetting ? "Preparing reset..." : "Forgot password?"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
