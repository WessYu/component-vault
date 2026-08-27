import { apiError, apiJson, assertTrustedOrigin, parseJson, requestFingerprint } from "@/lib/api-security";
import { loginRequestSchema } from "@/lib/api-schemas";
import { sessionCookieName, sessionCookieOptions } from "@/lib/auth-cookie";
import { consumeApiRateLimit, createLocalSession, getUserByEmail, publicUser, verifyPassword } from "@/lib/vault-db";

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request);
    const body = await parseJson(request, loginRequestSchema, 16 * 1024);
    await consumeApiRateLimit(`login:${requestFingerprint(request, body.email)}`, 8, 15 * 60 * 1000);

    const user = await getUserByEmail(body.email);
    const passwordMatches = await verifyPassword(body.password, user?.passwordHash);
    if (!user || !passwordMatches) {
      return apiJson({ error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." } }, { status: 401 });
    }

    const session = await createLocalSession(user.id);
    const response = apiJson({ user: publicUser(user) });
    response.cookies.set(sessionCookieName, session.id, sessionCookieOptions(body.remember ? new Date(session.expiresAt) : undefined));
    return response;
  } catch (error) {
    return apiError(error);
  }
}
