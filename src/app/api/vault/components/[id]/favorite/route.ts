import { NextResponse } from "next/server";
import { toggleVaultFavorite } from "@/lib/vault-db";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Context) {
  const { id } = await context.params;
  const component = await toggleVaultFavorite(id);

  if (!component) return NextResponse.json({ error: "Component not found." }, { status: 404 });
  return NextResponse.json({ component });
}
