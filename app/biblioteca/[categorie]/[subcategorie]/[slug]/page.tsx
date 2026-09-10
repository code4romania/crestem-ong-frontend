import { notFound } from "next/navigation";
import { getPublicArticle } from "@/lib/api/biblioteca-public";
import { BlockRenderer } from "@/components/features/pages/BlockRenderer";
import { PublicArticleHeader } from "@/components/features/biblioteca-public/PublicArticleHeader";

export default async function Page({
  params,
}: {
  params: Promise<{ categorie: string; subcategorie: string; slug: string }>;
}) {
  const { categorie, subcategorie, slug } = await params;

  // The backend derives the same path from the article's own relation, so
  // asking for it by that exact string is what keeps one article at one URL.
  const article = await getPublicArticle(`/biblioteca/${categorie}/${subcategorie}/${slug}`);
  if (!article) notFound();

  return (
    <>
      <PublicArticleHeader article={article} />
      <div className="mx-auto w-full max-w-4xl px-6 py-12">
        {/* The backend defaults `blocuri` to `[]`, but the response is built by
            spreading a detail view and overriding it without that fallback —
            so a null here would otherwise crash a public page. */}
        <BlockRenderer blocks={article.blocuri ?? []} />
      </div>
    </>
  );
}
