import { NextResponse } from "next/server";
import { deleteVaultComponent, getVaultComponent, updateVaultComponent } from "@/lib/vault-db";
import type { VaultComponent } from "@/types/vault";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const { id } = await context.params;
  const component = await getVaultComponent(id);
  if (!component) return NextResponse.json({ error: "Component not found." }, { status: 404 });
  return NextResponse.json({ component });
}

export async function PATCH(request: Request, context: Context) {
  const { id } = await context.params;
  const body = (await request.json()) as Partial<VaultComponent>;

  const current = await getVaultComponent(id);
  if (!current) return NextResponse.json({ error: "Component not found." }, { status: 404 });
  const patch = { ...body };
  delete patch.id;

  const component = await updateVaultComponent(id, {
    ...patch,
    slug: patch.slug ?? current.slug,
    updatedAt: new Date().toISOString(),
  });

  if (!component) return NextResponse.json({ error: "Component not found." }, { status: 404 });
  return NextResponse.json({ component });
}

export async function DELETE(_request: Request, context: Context) {
  const { id } = await context.params;
  const removed = await getVaultComponent(id);

  if (!removed) return NextResponse.json({ error: "Component not found." }, { status: 404 });
  await deleteVaultComponent(id);
  return NextResponse.json({ component: removed });
}
