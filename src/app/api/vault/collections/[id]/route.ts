import { cookies } from "next/headers";
import { apiError, apiJson, assertTrustedOrigin, parseJson, requestFingerprint } from "@/lib/api-security";
import { patchCollectionSchema } from "@/lib/api-schemas";
import { readSessionCookie } from "@/lib/auth-cookie";
import { consumeApiRateLimit, deleteVaultCollection, getUserBySession, getVaultCollection, updateVaultCollection } from "@/lib/vault-db";
import type { Collection } from "@/types/vault";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const cookieStore = await cookies();
    const sessionId = readSessionCookie(cookieStore);
    const { id } = await context.params;
    const collection = await getVaultCollection(id, sessionId);
    if (!collection) return apiJson({ error: { code: "NOT_FOUND", message: "Collection not found." } }, { status: 404 });
    return apiJson({ collection });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    assertTrustedOrigin(request);
    const cookieStore = await cookies();
    const sessionId = readSessionCookie(cookieStore);
    if (sessionId) await consumeApiRateLimit(`collection-update:${requestFingerprint(request, sessionId)}`, 60, 60 * 1000);
    const user = await getUserBySession(sessionId);
    if (!sessionId || !user) return apiJson({ error: { code: "AUTHENTICATION_REQUIRED", message: "Authentication required." } }, { status: 401 });
    const { id } = await context.params;
    const patch = await parseJson(request, patchCollectionSchema, 64 * 1024) as Partial<Collection>;
    const current = await getVaultCollection(id, sessionId);
    if (!current) return apiJson({ error: { code: "NOT_FOUND", message: "Collection not found." } }, { status: 404 });
    const collection = await updateVaultCollection(sessionId, id, { ...patch, updatedAt: new Date().toISOString() });
    if (!collection) return apiJson({ error: { code: "NOT_FOUND", message: "Collection not found." } }, { status: 404 });
    return apiJson({ collection });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    assertTrustedOrigin(request);
    const cookieStore = await cookies();
    const sessionId = readSessionCookie(cookieStore);
    if (sessionId) await consumeApiRateLimit(`collection-delete:${requestFingerprint(request, sessionId)}`, 30, 60 * 1000);
    const user = await getUserBySession(sessionId);
    if (!sessionId || !user) return apiJson({ error: { code: "AUTHENTICATION_REQUIRED", message: "Authentication required." } }, { status: 401 });
    const { id } = await context.params;
    const removed = await getVaultCollection(id, sessionId);
    if (!removed) return apiJson({ error: { code: "NOT_FOUND", message: "Collection not found." } }, { status: 404 });
    const result = await deleteVaultCollection(sessionId, id);
    if (!result.deleted) return apiJson({ error: { code: "FORBIDDEN", message: "You cannot delete this collection." } }, { status: 403 });
    return apiJson({ collection: removed });
  } catch (error) {
    return apiError(error);
  }
}
