import { NextResponse } from "next/server";
import { mutateVaultDb, readVaultDb } from "@/lib/vault-db";
import type { VaultComponent } from "@/types/vault";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const { id } = await context.params;
  const database = await readVaultDb();
  const component = database.components.find((item) => item.id === id || item.slug === id);
  if (!component) return NextResponse.json({ error: "Component not found." }, { status: 404 });
  return NextResponse.json({ component });
}

export async function PATCH(request: Request, context: Context) {
  const { id } = await context.params;
  const body = (await request.json()) as Partial<VaultComponent>;

  const component = await mutateVaultDb((database) => {
    const index = database.components.findIndex((item) => item.id === id || item.slug === id);
    if (index === -1) return null;
    database.components[index] = {
      ...database.components[index],
      ...body,
      id: database.components[index].id,
      slug: body.slug ?? database.components[index].slug,
      updatedAt: new Date().toISOString(),
    };
    return database.components[index];
  });

  if (!component) return NextResponse.json({ error: "Component not found." }, { status: 404 });
  return NextResponse.json({ component });
}

export async function DELETE(_request: Request, context: Context) {
  const { id } = await context.params;
  const removed = await mutateVaultDb((database) => {
    const component = database.components.find((item) => item.id === id || item.slug === id);
    if (!component) return null;
    database.components = database.components.filter((item) => item.id !== component.id);
    database.collections = database.collections.map((collection) => ({
      ...collection,
      componentIds: collection.componentIds.filter((componentId) => componentId !== component.id),
    }));
    return component;
  });

  if (!removed) return NextResponse.json({ error: "Component not found." }, { status: 404 });
  return NextResponse.json({ component: removed });
}
