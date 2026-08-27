import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { apiError, apiJson, assertTrustedOrigin, parseJson, requestFingerprint } from "@/lib/api-security";
import { createCollectionSchema } from "@/lib/api-schemas";
import { readSessionCookie } from "@/lib/auth-cookie";
import { consumeApiRateLimit, createVaultCollection, getUserBySession, listVaultCollections } from "@/lib/vault-db";
import type { Collection } from "@/types/vault";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = readSessionCookie(cookieStore);
    const collections = await listVaultCollections(sessionId);
    return apiJson({ collections });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request);
    const cookieStore = await cookies();
    const sessionId = readSessionCookie(cookieStore);
    if (sessionId) await consumeApiRateLimit(`collection-create:${requestFingerprint(request, sessionId)}`, 30, 60 * 1000);
    const user = await getUserBySession(sessionId);
    if (!sessionId || !user) return apiJson({ error: { code: "AUTHENTICATION_REQUIRED", message: "Authentication required." } }, { status: 401 });
    const body = await parseJson(request, createCollectionSchema, 64 * 1024) as Partial<Collection>;
    const collection = await createVaultCollection(sessionId, { id: randomUUID(), name: body.name?.trim() || "Untitled Collection", description: body.description?.trim() || "New reusable component group.", componentIds: body.componentIds ?? [], updatedAt: new Date().toISOString() });
    return apiJson({ collection }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
