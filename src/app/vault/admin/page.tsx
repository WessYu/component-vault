import { AdminPanelScreen } from "@/features/admin/admin-panel-screen";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isVaultAdmin } from "@/lib/admin";
import { getUserBySession } from "@/lib/vault-db";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("component-vault-session")?.value;
  const user = await getUserBySession(sessionId);

  if (!user) redirect("/login");
  if (!isVaultAdmin(user)) redirect("/vault/components");

  return <AdminPanelScreen />;
}
