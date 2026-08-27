import { ApiError, apiError, apiJson } from "@/lib/api-security";
import { checkBackendReadiness } from "@/lib/vault-db";

export async function GET() {
  try {
    const result = await checkBackendReadiness();
    return apiJson({ status: result.ok ? "ready" : "unavailable", checkedAt: result.checkedAt });
  } catch (error) {
    console.error("[component-vault-health] readiness check failed", error instanceof Error ? error.message : "unknown error");
    return apiError(new ApiError(503, "SERVICE_UNAVAILABLE", "The service is temporarily unavailable."));
  }
}
