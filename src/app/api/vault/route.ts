import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getFavoriteComponentIds, readVaultDb } from "@/lib/vault-db";

export async function GET() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("component-vault-session")?.value;
  const [database, favoriteComponentIds] = await Promise.all([
    readVaultDb(),
    getFavoriteComponentIds(sessionId),
  ]);

  const favoriteSet = new Set(favoriteComponentIds);
  return NextResponse.json({
    components: database.components.map((component) => ({
      ...component,
      isFavorite: favoriteSet.has(component.id),
    })),
    collections: database.collections,
  });
}
