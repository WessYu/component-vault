import { NextResponse } from "next/server";
import { deleteVaultCollection, getVaultCollection, updateVaultCollection } from "@/lib/vault-db";
import type { Collection } from "@/types/vault";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const { id } = await context.params;
  const collection = await getVaultCollection(id);
  if (!collection) return NextResponse.json({ error: "Collection not found." }, { status: 404 });
  return NextResponse.json({ collection });
}

export async function PATCH(request: Request, context: Context) {
  const { id } = await context.params;
  const body = (await request.json()) as Partial<Collection>;

  const current = await getVaultCollection(id);
  if (!current) return NextResponse.json({ error: "Collection not found." }, { status: 404 });
  const patch = { ...body };
  delete patch.id;

  const collection = await updateVaultCollection(id, {
    ...patch,
    updatedAt: new Date().toISOString(),
  });

  if (!collection) return NextResponse.json({ error: "Collection not found." }, { status: 404 });
  return NextResponse.json({ collection });
}

export async function DELETE(_request: Request, context: Context) {
  const { id } = await context.params;
  const removed = await getVaultCollection(id);

  if (!removed) return NextResponse.json({ error: "Collection not found." }, { status: 404 });
  await deleteVaultCollection(id);
  return NextResponse.json({ collection: removed });
}
