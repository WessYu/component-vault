export type VaultRole = "admin" | "user";

type RoleCandidate = {
  email: string;
  role?: VaultRole;
};

function configuredAdminEmails() {
  return (process.env.VAULT_ADMIN_EMAIL ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function resolveVaultRole(user: RoleCandidate): VaultRole {
  const email = user.email.trim().toLowerCase();
  if (configuredAdminEmails().includes(email)) return "admin";
  return user.role === "admin" ? "admin" : "user";
}

export function isVaultAdmin(user: RoleCandidate | null | undefined) {
  return Boolean(user && resolveVaultRole(user) === "admin");
}
