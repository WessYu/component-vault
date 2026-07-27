import { NextResponse } from "next/server";
import { mutateVaultDb } from "@/lib/vault-db";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Context) {
  const { id } = await context.params;
  const component = await mutateVaultDb((database) => {
    const index = database.components.findIndex((item) => item.id === id || item.slug === id);
    if (index === -1) return null;
    database.components[index] = {
      ...database.components[index],
      isFavorite: !database.components[index].isFavorite,
      updatedAt: new Date().toISOString(),
    };
    return database.components[index];
  });

  if (!component) return NextResponse.json({ error: "Component not found." }, { status: 404 });
  return NextResponse.json({ component });
}
