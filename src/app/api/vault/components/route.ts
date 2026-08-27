import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { apiError, apiJson, assertTrustedOrigin, parseJson, requestFingerprint } from "@/lib/api-security";
import { createComponentSchema } from "@/lib/api-schemas";
import { readSessionCookie } from "@/lib/auth-cookie";
import { consumeApiRateLimit, createVaultComponent, getFavoriteComponentIds, getUserBySession, listVaultComponents } from "@/lib/vault-db";
import { demoComponents } from "@/services/demo-data";
import type { VaultComponent } from "@/types/vault";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = readSessionCookie(cookieStore);
    const [components, favoriteComponentIds] = await Promise.all([
      listVaultComponents(sessionId),
      getFavoriteComponentIds(sessionId),
    ]);
    const favoriteSet = new Set(favoriteComponentIds);
    return apiJson({
      components: components.map((component) => ({ ...component, isFavorite: favoriteSet.has(component.id) })),
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request);
    const cookieStore = await cookies();
    const sessionId = readSessionCookie(cookieStore);
    if (sessionId) await consumeApiRateLimit(`component-create:${requestFingerprint(request, sessionId)}`, 60, 60 * 1000);
    const user = await getUserBySession(sessionId);
    if (!sessionId || !user) return apiJson({ error: { code: "AUTHENTICATION_REQUIRED", message: "Sign in to create components." } }, { status: 401 });

    const body = await parseJson(request, createComponentSchema, 1024 * 1024) as Partial<VaultComponent>;
    const template = demoComponents.find((component) => component.slug === "button-primary") ?? demoComponents[0];
    const now = new Date().toISOString();
    const name = body.name?.trim() || "Untitled Component";
    const baseSlug = slugify(body.slug || name) || "untitled-component";

    const components = await listVaultComponents(sessionId);
    let slug = baseSlug;
    let suffix = 2;
    while (components.some((item) => item.slug === slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const component = await createVaultComponent(sessionId, { ...template, ...body, id: randomUUID(), userId: user.id, name, slug, updatedAt: now, version: body.version || "v1.0.0", isFavorite: false });
    return apiJson({ component }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
