import type { VaultUser } from "@/lib/vault-db";

export type VaultRole = "admin" | "user";

function configuredAdminEmails() {
  return (process.env.VAULT_ADMIN_EMAIL ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function resolveVaultRole(user: Pick<VaultUser, "email" | "role">): VaultRole {
  const email = user.email.trim().toLowerCase();
  if (configuredAdminEmails().includes(email)) return "admin";
  return user.role === "admin" ? "admin" : "user";
}

export function isVaultAdmin(user: Pick<VaultUser, "email" | "role"> | null | undefined) {
  return Boolean(user && resolveVaultRole(user) === "admin");
}
