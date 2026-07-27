import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createVaultCollection, listVaultCollections } from "@/lib/vault-db";
import type { Collection } from "@/types/vault";

export async function GET() {
  const collections = await listVaultCollections();
  return NextResponse.json({ collections });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<Collection>;
  const now = new Date().toISOString();
  const collection = await createVaultCollection({
    id: randomUUID(),
    name: body.name?.trim() || "Untitled Collection",
    description: body.description?.trim() || "New reusable component group.",
    componentIds: body.componentIds ?? [],
    updatedAt: now,
  });

  return NextResponse.json({ collection }, { status: 201 });
}
