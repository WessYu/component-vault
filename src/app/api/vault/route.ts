import { cookies } from "next/headers";
import { apiError, apiJson } from "@/lib/api-security";
import { readSessionCookie } from "@/lib/auth-cookie";
import { getFavoriteComponentIds, readVaultDb } from "@/lib/vault-db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = readSessionCookie(cookieStore);
    const [database, favoriteComponentIds] = await Promise.all([
      readVaultDb(sessionId),
      getFavoriteComponentIds(sessionId),
    ]);

    const favoriteSet = new Set(favoriteComponentIds);
    return apiJson({
      components: database.components.map((component) => ({
        ...component,
        isFavorite: favoriteSet.has(component.id),
      })),
      collections: database.collections,
    });
  } catch (error) {
    return apiError(error);
  }
}
