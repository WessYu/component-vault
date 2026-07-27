import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createVaultComponent, listVaultComponents } from "@/lib/vault-db";
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
  const components = await listVaultComponents();
  return NextResponse.json({ components });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<VaultComponent>;
  const template = demoComponents.find((component) => component.slug === "button-primary") ?? demoComponents[0];
  const now = new Date().toISOString();
  const name = body.name?.trim() || "Untitled Component";
  const baseSlug = slugify(body.slug || name);

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
    userId: "demo-user",
    name,
    slug,
    updatedAt: now,
    version: body.version || "v1.0.0",
    isFavorite: Boolean(body.isFavorite),
  });

  return NextResponse.json({ component }, { status: 201 });
}
