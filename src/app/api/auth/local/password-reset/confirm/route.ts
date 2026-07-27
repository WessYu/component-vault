import { NextResponse } from "next/server";
import { resetLocalPassword } from "@/lib/vault-db";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { token?: string; password?: string } | null;
  const token = body?.token?.trim();
  const password = body?.password ?? "";

  if (!token || password.length < 8) {
    return NextResponse.json({ message: "Valid token and password with at least 8 characters are required." }, { status: 400 });
  }

  try {
    await resetLocalPassword({ token, password });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unable to reset password." }, { status: 400 });
  }
}
