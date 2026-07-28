import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminView } from "@/features/admin/admin-view";
import { isVaultAdmin } from "@/lib/admin";
import { getUserBySession, listVaultCollections, listVaultComponents, publicUser } from "@/lib/vault-db";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("component-vault-session")?.value;
  const user = await getUserBySession(sessionId);

  if (!user) redirect("/login");
  if (!isVaultAdmin(user)) redirect("/vault/components");

  const [components, collections] = await Promise.all([
    listVaultComponents(),
    listVaultCollections(),
  ]);

  const safeUser = publicUser(user);

  return (
    <AdminView
      user={{ name: safeUser.name, email: safeUser.email }}
      componentCount={components.length}
      collectionCount={collections.length}
    />
  );
}
