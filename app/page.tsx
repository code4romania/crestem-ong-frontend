import { notFound } from "next/navigation";
import { getPublicPage } from "@/lib/api/pages";
import { BlockRenderer } from "@/components/features/pages/BlockRenderer";

export default async function Home() {
  // The landing page is an ordinary page row that answers at `/`, so it reads
  // through the same public endpoint, and renders through the same block
  // renderer, as every other page on the site.
  const page = await getPublicPage("/");

  if (!page) notFound();

  return <BlockRenderer blocks={page.blocuri} />;
}
