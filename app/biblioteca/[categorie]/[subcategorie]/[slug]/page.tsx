import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicArticle } from "@/lib/api/biblioteca-public";
import { markArticleRead } from "@/lib/api/article-reads";
import { BlockRenderer } from "@/components/features/pages/BlockRenderer";
import { PublicArticleHeader } from "@/components/features/biblioteca-public/PublicArticleHeader";
import { RelatedArticles } from "@/components/features/biblioteca-public/RelatedArticles";

type ArticleParams = { categorie: string; subcategorie: string; slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<ArticleParams>;
}): Promise<Metadata> {
  const { categorie, subcategorie, slug } = await params;
  const article = await getPublicArticle(`/biblioteca/${categorie}/${subcategorie}/${slug}`);
  return { title: article ? `${article.titlu} - Crestem ONG` : "Bibliotecă" };
}

export default async function Page({
  params,
}: {
  params: Promise<ArticleParams>;
}) {
  const { categorie, subcategorie, slug } = await params;

  // The backend derives the same path from the article's own relation, so
  // asking for it by that exact string is what keeps one article at one URL.
  const article = await getPublicArticle(`/biblioteca/${categorie}/${subcategorie}/${slug}`);
  if (!article) notFound();

  // No-ops for an anonymous visitor (the backend 401s, swallowed inside
  // markArticleRead) — only a signed-in reader's profile tracks this.
  await markArticleRead(article.documentId);

  return (
    <>
      <PublicArticleHeader article={article} />
      <div className="mx-auto w-full max-w-4xl px-6 py-12">
        {/* The backend defaults `blocuri` to `[]`, but the response is built by
            spreading a detail view and overriding it without that fallback —
            so a null here would otherwise crash a public page. */}
        <BlockRenderer blocks={article.blocuri ?? []} />
      </div>
      <RelatedArticles articles={article.articoleRelationate ?? []} />
    </>
  );
}
