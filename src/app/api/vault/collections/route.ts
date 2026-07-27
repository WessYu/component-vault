import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { mutateVaultDb, readVaultDb } from "@/lib/vault-db";
import type { Collection } from "@/types/vault";

export async function GET() {
  const database = await readVaultDb();
  return NextResponse.json({ collections: database.collections });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<Collection>;
  const now = new Date().toISOString();
  const collection = await mutateVaultDb((database) => {
    const next: Collection = {
      id: randomUUID(),
      name: body.name?.trim() || "Untitled Collection",
      description: body.description?.trim() || "New reusable component group.",
      componentIds: body.componentIds ?? [],
      updatedAt: now,
    };
    database.collections.unshift(next);
    return next;
  });

  return NextResponse.json({ collection }, { status: 201 });
}
