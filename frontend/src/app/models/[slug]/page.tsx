import { EntityDetail } from "@/components/detail/EntityDetail";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <EntityDetail type="model" slug={slug} />;
}