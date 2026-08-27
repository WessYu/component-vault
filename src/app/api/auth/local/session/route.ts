import { cookies } from "next/headers";
import { apiError, apiJson } from "@/lib/api-security";
import { sessionCookieName } from "@/lib/auth-cookie";
import { resolveVaultRole } from "@/lib/admin";
import { getUserBySession, publicUser } from "@/lib/vault-db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(sessionCookieName)?.value;
    const user = await getUserBySession(sessionId);

    if (!user) {
      const response = apiJson({ user: null }, { status: 401 });
      if (sessionId) response.cookies.delete(sessionCookieName);
      return response;
    }

    return apiJson({
      user: {
        ...publicUser(user),
        role: resolveVaultRole(user),
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
