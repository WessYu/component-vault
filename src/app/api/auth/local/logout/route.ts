import { cookies } from "next/headers";
import { apiError, apiJson, assertTrustedOrigin } from "@/lib/api-security";
import { sessionCookieName } from "@/lib/auth-cookie";
import { destroyLocalSession } from "@/lib/vault-db";

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request);
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(sessionCookieName)?.value;
    if (sessionId) await destroyLocalSession(sessionId);

    const response = apiJson({ ok: true });
    response.cookies.delete(sessionCookieName);
    return response;
  } catch (error) {
    return apiError(error);
  }
}
