import { NextResponse } from "next/server";
import { mutateVaultDb, readVaultDb } from "@/lib/vault-db";
import type { Collection } from "@/types/vault";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const { id } = await context.params;
  const database = await readVaultDb();
  const collection = database.collections.find((item) => item.id === id);
  if (!collection) return NextResponse.json({ error: "Collection not found." }, { status: 404 });
  return NextResponse.json({ collection });
}

export async function PATCH(request: Request, context: Context) {
  const { id } = await context.params;
  const body = (await request.json()) as Partial<Collection>;

  const collection = await mutateVaultDb((database) => {
    const index = database.collections.findIndex((item) => item.id === id);
    if (index === -1) return null;
    database.collections[index] = {
      ...database.collections[index],
      ...body,
      id: database.collections[index].id,
      updatedAt: new Date().toISOString(),
    };
    return database.collections[index];
  });

  if (!collection) return NextResponse.json({ error: "Collection not found." }, { status: 404 });
  return NextResponse.json({ collection });
}

export async function DELETE(_request: Request, context: Context) {
  const { id } = await context.params;
  const removed = await mutateVaultDb((database) => {
    const collection = database.collections.find((item) => item.id === id);
    if (!collection) return null;
    database.collections = database.collections.filter((item) => item.id !== id);
    return collection;
  });

  if (!removed) return NextResponse.json({ error: "Collection not found." }, { status: 404 });
  return NextResponse.json({ collection: removed });
}
