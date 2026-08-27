import { cookies } from "next/headers";
import { apiError, apiJson, assertTrustedOrigin, parseJson, requestFingerprint } from "@/lib/api-security";
import { patchComponentSchema } from "@/lib/api-schemas";
import { readSessionCookie } from "@/lib/auth-cookie";
import { consumeApiRateLimit, deleteVaultComponent, getUserBySession, getVaultComponent, updateVaultComponent } from "@/lib/vault-db";
import type { VaultComponent } from "@/types/vault";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const cookieStore = await cookies();
    const sessionId = readSessionCookie(cookieStore);
    const { id } = await context.params;
    const component = await getVaultComponent(id, sessionId);
    if (!component) return apiJson({ error: { code: "NOT_FOUND", message: "Component not found." } }, { status: 404 });
    return apiJson({ component });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    assertTrustedOrigin(request);
    const cookieStore = await cookies();
    const sessionId = readSessionCookie(cookieStore);
    if (sessionId) await consumeApiRateLimit(`component-update:${requestFingerprint(request, sessionId)}`, 120, 60 * 1000);
    const user = await getUserBySession(sessionId);
    if (!sessionId || !user) return apiJson({ error: { code: "AUTHENTICATION_REQUIRED", message: "Authentication required." } }, { status: 401 });
    const { id } = await context.params;
    const patch = await parseJson(request, patchComponentSchema, 1024 * 1024) as Partial<VaultComponent>;
    const current = await getVaultComponent(id, sessionId);
    if (!current) return apiJson({ error: { code: "NOT_FOUND", message: "Component not found." } }, { status: 404 });
    const component = await updateVaultComponent(sessionId, id, { ...patch, slug: patch.slug ?? current.slug, updatedAt: new Date().toISOString() });
    if (!component) return apiJson({ error: { code: "NOT_FOUND", message: "Component not found." } }, { status: 404 });
    return apiJson({ component });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    assertTrustedOrigin(request);
    const cookieStore = await cookies();
    const sessionId = readSessionCookie(cookieStore);
    if (sessionId) await consumeApiRateLimit(`component-delete:${requestFingerprint(request, sessionId)}`, 30, 60 * 1000);
    const user = await getUserBySession(sessionId);
    if (!sessionId || !user) return apiJson({ error: { code: "AUTHENTICATION_REQUIRED", message: "Authentication required." } }, { status: 401 });
    const { id } = await context.params;
    const removed = await getVaultComponent(id, sessionId);
    if (!removed) return apiJson({ error: { code: "NOT_FOUND", message: "Component not found." } }, { status: 404 });
    const result = await deleteVaultComponent(sessionId, id);
    if (!result.deleted) return apiJson({ error: { code: "FORBIDDEN", message: "You cannot delete this component." } }, { status: 403 });
    return apiJson({ component: removed });
  } catch (error) {
    return apiError(error);
  }
}
