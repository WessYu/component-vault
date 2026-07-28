import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { resolveVaultRole } from "@/lib/admin";
import { getUserBySession, publicUser } from "@/lib/vault-db";

export async function GET() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("component-vault-session")?.value;
  const user = await getUserBySession(sessionId);

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      ...publicUser(user),
      role: resolveVaultRole(user),
    },
  });
}
