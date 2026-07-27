import { NextResponse } from "next/server";
import { createLocalSession, createLocalUser, publicUser } from "@/lib/vault-db";

const cookieName = "component-vault-session";

export async function POST(request: Request) {
  const body = (await request.json()) as { name?: string; email?: string; password?: string };
  const name = body.name?.trim() || "Vault User";
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || password.length < 6) {
    return NextResponse.json({ error: "A valid email and password with 6+ characters are required." }, { status: 400 });
  }

  try {
    const user = await createLocalUser({ name, email, password });
    const session = await createLocalSession(user.id);
    const response = NextResponse.json({ user: publicUser(user) }, { status: 201 });
    response.cookies.set(cookieName, session.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(session.expiresAt),
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to register user." }, { status: 409 });
  }
}
