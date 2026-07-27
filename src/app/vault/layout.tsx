import { ProtectedVault } from "@/features/auth/protected-vault";

export default function VaultLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedVault>{children}</ProtectedVault>;
}
