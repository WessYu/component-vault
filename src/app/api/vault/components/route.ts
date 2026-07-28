import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createVaultComponent, getFavoriteComponentIds, getUserBySession, listVaultComponents } from "@/lib/vault-db";
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
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("component-vault-session")?.value;
  const [components, favoriteComponentIds] = await Promise.all([
    listVaultComponents(),
    getFavoriteComponentIds(sessionId),
  ]);
  const favoriteSet = new Set(favoriteComponentIds);
  return NextResponse.json({
    components: components.map((component) => ({ ...component, isFavorite: favoriteSet.has(component.id) })),
  });
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("component-vault-session")?.value;
  const user = await getUserBySession(sessionId);
  if (!user) return NextResponse.json({ error: "Sign in to create components." }, { status: 401 });

  const body = (await request.json()) as Partial<VaultComponent>;
  const template = demoComponents.find((component) => component.slug === "button-primary") ?? demoComponents[0];
  const now = new Date().toISOString();
  const name = body.name?.trim() || "Untitled Component";
  const baseSlug = slugify(body.slug || name) || "untitled-component";

  const components = await listVaultComponents();
  let slug = baseSlug;
  let suffix = 2;
  while (components.some((item) => item.slug === slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const component = await createVaultComponent({
    ...template,
    ...body,
    id: randomUUID(),
    userId: user.id,
    name,
    slug,
    updatedAt: now,
    version: body.version || "v1.0.0",
    isFavorite: false,
  });

  return NextResponse.json({ component }, { status: 201 });
}
