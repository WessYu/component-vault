import { apiError, apiJson, assertTrustedOrigin, parseJson, requestFingerprint } from "@/lib/api-security";
import { passwordResetConfirmSchema } from "@/lib/api-schemas";
import { consumeApiRateLimit, resetLocalPassword } from "@/lib/vault-db";

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request);
    const body = await parseJson(request, passwordResetConfirmSchema, 16 * 1024);
    await consumeApiRateLimit(`password-reset-confirm:${requestFingerprint(request)}`, 8, 30 * 60 * 1000);
    await resetLocalPassword(body);
    return apiJson({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
