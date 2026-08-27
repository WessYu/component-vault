export const sessionCookieName = process.env.NODE_ENV === "production"
  ? "__Host-component-vault-session"
  : "component-vault-session";

export function sessionCookieOptions(expires?: Date) {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    priority: "high" as const,
    ...(expires ? { expires } : {}),
  };
}

export function readSessionCookie(cookieStore: { get(name: string): { value: string } | undefined }) {
  return cookieStore.get(sessionCookieName)?.value;
}
