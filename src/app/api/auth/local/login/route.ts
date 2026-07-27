import { NextResponse } from "next/server";
import { createLocalSession, publicUser, readVaultDb, verifyPassword } from "@/lib/vault-db";

const cookieName = "component-vault-session";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const database = await readVaultDb();
  const user = database.users.find((item) => item.email === email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const session = await createLocalSession(user.id);
  const response = NextResponse.json({ user: publicUser(user) });
  response.cookies.set(cookieName, session.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(session.expiresAt),
  });
  return response;
}
