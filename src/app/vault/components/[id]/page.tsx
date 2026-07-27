import { ComponentDetailWorkspace } from "@/features/components/component-detail-workspace";

export default async function ComponentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: slug } = await params;
  return <ComponentDetailWorkspace slug={slug} />;
}
