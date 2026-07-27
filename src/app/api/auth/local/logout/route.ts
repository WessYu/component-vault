import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { destroyLocalSession } from "@/lib/vault-db";

export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("component-vault-session")?.value;
  if (sessionId) await destroyLocalSession(sessionId);

  const response = NextResponse.json({ ok: true });
  response.cookies.delete("component-vault-session");
  return response;
}
