import { ComponentDetailRoute } from "@/features/components/component-detail-route";

export default async function ComponentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: slug } = await params;
  return <ComponentDetailRoute slug={slug} />;
}
