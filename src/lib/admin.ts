export type VaultRole = "admin" | "user";

type RoleCandidate = {
  email: string;
  role?: VaultRole;
};

export function resolveVaultRole(user: RoleCandidate): VaultRole {
  return user.role === "admin" ? "admin" : "user";
}

export function isVaultAdmin(user: RoleCandidate | null | undefined) {
  return Boolean(user && resolveVaultRole(user) === "admin");
}
