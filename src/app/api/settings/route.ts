import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  defaultWorkspacePreferences,
  getWorkspacePreferences,
  updateWorkspacePreferences,
  type WorkspacePreferences,
} from "@/lib/vault-db";

const cookieName = "component-vault-session";

function normalizePreferences(input: Partial<WorkspacePreferences>): WorkspacePreferences {
  return {
    gridSize: Number.isFinite(input.gridSize) ? Math.min(32, Math.max(2, Math.round(input.gridSize!))) : defaultWorkspacePreferences.gridSize,
    defaultViewport: ["Desktop", "Tablet", "Mobile"].includes(input.defaultViewport ?? "")
      ? (input.defaultViewport as WorkspacePreferences["defaultViewport"])
      : defaultWorkspacePreferences.defaultViewport,
    autosaveDebounce: Number.isFinite(input.autosaveDebounce)
      ? Math.min(5000, Math.max(200, Math.round(input.autosaveDebounce!)))
      : defaultWorkspacePreferences.autosaveDebounce,
    previewTheme: input.previewTheme === "Dark" ? "Dark" : "Light",
    componentReviewRequests: Boolean(input.componentReviewRequests),
    tokenDriftAlerts: Boolean(input.tokenDriftAlerts),
    weeklyUsageDigest: Boolean(input.weeklyUsageDigest),
  };
}

export async function GET() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(cookieName)?.value;
  if (!sessionId) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const preferences = await getWorkspacePreferences(sessionId);
  if (!preferences) return NextResponse.json({ error: "Session expired." }, { status: 401 });

  return NextResponse.json({ preferences });
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(cookieName)?.value;
  if (!sessionId) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const body = (await request.json()) as Partial<WorkspacePreferences>;
  const preferences = await updateWorkspacePreferences(sessionId, normalizePreferences(body));
  if (!preferences) return NextResponse.json({ error: "Session expired." }, { status: 401 });

  return NextResponse.json({ preferences });
}
