import { apiError, apiJson, ApiError, assertTrustedOrigin, parseJson, requestFingerprint } from "@/lib/api-security";
import { passwordResetRequestSchema } from "@/lib/api-schemas";
import { consumeApiRateLimit, createPasswordReset } from "@/lib/vault-db";

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request);
    const body = await parseJson(request, passwordResetRequestSchema, 8 * 1024);
    await consumeApiRateLimit(`password-reset:${requestFingerprint(request, body.email)}`, 4, 60 * 60 * 1000);

    const token = await createPasswordReset(body.email);
    const appUrl = process.env.APP_URL ?? new URL(request.url).origin;
    const resetUrl = token ? `${appUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}` : null;

    if (process.env.NODE_ENV !== "production") {
      return apiJson({ message: "If the email exists, a reset link is ready.", resetUrl });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.PASSWORD_RESET_FROM_EMAIL;
    if (!apiKey || !from || !process.env.APP_URL) {
      throw new ApiError(503, "PASSWORD_RESET_UNAVAILABLE", "Password reset email delivery is not configured.");
    }

    if (resetUrl) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from,
            to: [body.email],
            subject: "Reset your Component Vault password",
            text: `Use this link within 30 minutes to reset your password: ${resetUrl}`,
          }),
          signal: AbortSignal.timeout(10_000),
        });
        if (!response.ok) throw new Error(`Resend returned ${response.status}`);
      } catch {
        throw new ApiError(502, "EMAIL_DELIVERY_FAILED", "Password reset email could not be delivered.");
      }
    }

    return apiJson({ message: "If the email exists, password reset instructions were sent." }, { status: 202 });
  } catch (error) {
    return apiError(error);
  }
}
