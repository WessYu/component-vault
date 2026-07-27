import { NextResponse } from "next/server";
import { readVaultDb } from "@/lib/vault-db";

export async function GET() {
  const database = await readVaultDb();
  return NextResponse.json({
    components: database.components,
    collections: database.collections,
  });
}
