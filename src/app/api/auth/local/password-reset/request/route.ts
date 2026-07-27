import { NextResponse } from "next/server";
import { createPasswordReset } from "@/lib/vault-db";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string } | null;
  const email = body?.email?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ message: "Email is required." }, { status: 400 });
  }

  const token = await createPasswordReset(email);
  const origin = new URL(request.url).origin;

  return NextResponse.json({
    message: "If the email exists, a reset link is ready.",
    resetUrl: token ? `${origin}/reset-password?token=${token}` : null,
  });
}
