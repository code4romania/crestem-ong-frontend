import { notFound } from "next/navigation";
import { getPublicPage } from "@/lib/api/pages";
import { BlockRenderer } from "@/components/features/pages/BlockRenderer";

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  // A page answers only at its full path, parents included, so the segments go
  // to the backend as one string rather than a lookup on the last of them.
  const page = await getPublicPage(slug.join("/"));

  // Missing and not-permitted are the same answer on purpose: a restricted page
  // must not confirm its own existence.
  if (!page) notFound();

  return <BlockRenderer blocks={page.blocuri} />;
}
