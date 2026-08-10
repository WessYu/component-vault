"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, KeyRound, Sparkles } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { confirmLocalPasswordReset } from "@/services/vault-service";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!token) {
      setMessage("Password reset token is missing.");
      return;
    }

    if (password.length < 8) {
      setMessage("Use at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await confirmLocalPasswordReset({ token, password });
      router.push("/login");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-dvh bg-[#F7F8FC] px-4 py-6 text-text-primary md:px-7">
      <section className="mx-auto grid min-h-[calc(100dvh-48px)] max-w-3xl place-items-center">
        <form onSubmit={onSubmit} className="w-full rounded-[34px] border border-[#E4E7EF] bg-white p-6 shadow-[0_30px_120px_rgba(23,26,43,0.09)] md:p-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#9A78FF] text-white shadow-lg shadow-indigo-200">
              <Sparkles size={20} aria-hidden />
            </span>
            <span>
              <span className="block text-sm font-semibold">Component Vault</span>
              <span className="text-xs text-[#6D7285]">Local backend account recovery</span>
            </span>
          </Link>

          <div className="mt-10 flex items-start gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-[#EEF0FF] text-[#6366F1]">
              <KeyRound size={20} aria-hidden />
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-[-0.04em]">Reset password</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#6D7285]">Create a new password for your local Component Vault backend session.</p>
            </div>
          </div>

          <label className="mt-8 block text-sm font-semibold text-text-primary">
            New password
            <input
              className="mt-2 min-h-12 w-full rounded-2xl border border-[#E4E7EF] bg-[#F7F8FC] px-4 text-sm outline-none transition focus:border-[#6366F1] focus:bg-white"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {message ? <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#B42318]">{message}</p> : null}

          <button disabled={isSubmitting} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#6366F1] px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-[#5558E8] disabled:cursor-not-allowed disabled:opacity-60">
            <CheckCircle2 size={17} aria-hidden />
            {isSubmitting ? "Saving..." : "Save new password"}
          </button>

          <Link href="/login" className="mt-5 inline-flex text-sm font-semibold text-[#6366F1] hover:text-[#4F46E5]">
            Back to login
          </Link>
        </form>
      </section>
    </main>
  );
}
