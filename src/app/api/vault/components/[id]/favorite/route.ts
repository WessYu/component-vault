import { cookies } from "next/headers";
import { apiError, apiJson, assertTrustedOrigin, requestFingerprint } from "@/lib/api-security";
import { readSessionCookie } from "@/lib/auth-cookie";
import { consumeApiRateLimit, getVaultComponent, toggleUserFavorite } from "@/lib/vault-db";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  try {
    assertTrustedOrigin(request);
    const cookieStore = await cookies();
    const sessionId = readSessionCookie(cookieStore);
    if (!sessionId) return apiJson({ error: { code: "AUTHENTICATION_REQUIRED", message: "Sign in to save favorites." } }, { status: 401 });
    await consumeApiRateLimit(`favorite:${requestFingerprint(request, sessionId)}`, 120, 60 * 1000);
    const { id } = await context.params;
    const component = await getVaultComponent(id, sessionId);
    if (!component) return apiJson({ error: { code: "NOT_FOUND", message: "Component not found." } }, { status: 404 });
    const favoriteComponentIds = await toggleUserFavorite(sessionId, component.id);
    if (!favoriteComponentIds) return apiJson({ error: { code: "SESSION_EXPIRED", message: "Your session expired. Sign in again." } }, { status: 401 });
    return apiJson({ component: { ...component, isFavorite: favoriteComponentIds.includes(component.id) } });
  } catch (error) {
    return apiError(error);
  }
}
