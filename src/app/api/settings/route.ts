import { cookies } from "next/headers";
import { apiError, apiJson, assertTrustedOrigin, parseJson, requestFingerprint } from "@/lib/api-security";
import { workspacePreferencesSchema } from "@/lib/api-schemas";
import { sessionCookieName } from "@/lib/auth-cookie";
import {
  consumeApiRateLimit,
  defaultWorkspacePreferences,
  getWorkspacePreferences,
  updateWorkspacePreferences,
  type WorkspacePreferences,
} from "@/lib/vault-db";

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
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(sessionCookieName)?.value;
    if (!sessionId) return apiJson({ error: { code: "AUTHENTICATION_REQUIRED", message: "Authentication required." } }, { status: 401 });

    const preferences = await getWorkspacePreferences(sessionId);
    if (!preferences) return apiJson({ error: { code: "SESSION_EXPIRED", message: "Session expired." } }, { status: 401 });

    return apiJson({ preferences });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    assertTrustedOrigin(request);
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(sessionCookieName)?.value;
    if (!sessionId) return apiJson({ error: { code: "AUTHENTICATION_REQUIRED", message: "Authentication required." } }, { status: 401 });
    await consumeApiRateLimit(`settings:${requestFingerprint(request, sessionId)}`, 60, 60 * 1000);

    const body = await parseJson(request, workspacePreferencesSchema, 16 * 1024);
    const preferences = await updateWorkspacePreferences(sessionId, normalizePreferences(body));
    if (!preferences) return apiJson({ error: { code: "SESSION_EXPIRED", message: "Session expired." } }, { status: 401 });
    return apiJson({ preferences });
  } catch (error) {
    return apiError(error);
  }
}
