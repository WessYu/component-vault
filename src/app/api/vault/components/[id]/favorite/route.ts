import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getVaultComponent, toggleUserFavorite } from "@/lib/vault-db";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Context) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("component-vault-session")?.value;
  if (!sessionId) return NextResponse.json({ error: "Sign in to save favorites." }, { status: 401 });

  const { id } = await context.params;
  const component = await getVaultComponent(id);
  if (!component) return NextResponse.json({ error: "Component not found." }, { status: 404 });

  const favoriteComponentIds = await toggleUserFavorite(sessionId, component.id);
  if (!favoriteComponentIds) return NextResponse.json({ error: "Your session expired. Sign in again." }, { status: 401 });

  return NextResponse.json({
    component: {
      ...component,
      isFavorite: favoriteComponentIds.includes(component.id),
    },
  });
}
