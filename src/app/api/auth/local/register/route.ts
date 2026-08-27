import { apiError, apiJson, assertTrustedOrigin, parseJson, requestFingerprint } from "@/lib/api-security";
import { registerRequestSchema } from "@/lib/api-schemas";
import { sessionCookieName, sessionCookieOptions } from "@/lib/auth-cookie";
import { consumeApiRateLimit, createLocalSession, createLocalUser, publicUser } from "@/lib/vault-db";

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request);
    const body = await parseJson(request, registerRequestSchema, 16 * 1024);
    await consumeApiRateLimit(`register:${requestFingerprint(request, body.email)}`, 4, 60 * 60 * 1000);
    const user = await createLocalUser(body);
    const session = await createLocalSession(user.id);
    const response = apiJson({ user: publicUser(user) }, { status: 201 });
    response.cookies.set(sessionCookieName, session.id, sessionCookieOptions(new Date(session.expiresAt)));
    return response;
  } catch (error) {
    return apiError(error);
  }
}
