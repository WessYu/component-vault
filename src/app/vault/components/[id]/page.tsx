import { VaultShell } from "@/components/desktop/vault-shell";

export default async function ComponentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <VaultShell activeSection="Browser" initialComponentId={id} focus="preview" />;
}
