import { ChevronRight } from "lucide-react";
import { ARTICLE_CATALOG, CATEGORY_META, type CatalogArticle } from "./catalog";
import type { ArticleGridData } from "./schema";

const COL_CLASS: Record<ArticleGridData["coloane"], string> = {
  "1": "sm:grid-cols-1 lg:grid-cols-1",
  "2": "sm:grid-cols-2 lg:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};

function resolveArticles(data: ArticleGridData): CatalogArticle[] {
  if (data.sursa === "manuala") {
    const bySlug = new Map(ARTICLE_CATALOG.map((a) => [a.slug, a]));
    return data.articoleSelectate
      .map((slug) => bySlug.get(slug))
      .filter((a): a is CatalogArticle => Boolean(a));
  }
  const byRecent = [...ARTICLE_CATALOG].sort((a, b) =>
    b.data.localeCompare(a.data),
  );
  const filtered = data.categorie
    ? byRecent.filter((a) => a.categorie === data.categorie)
    : byRecent;
  return filtered.slice(0, Number(data.numarArticole));
}

function ArticleCard({ article }: { article: CatalogArticle }) {
  const meta = CATEGORY_META[article.categorie];
  const Icon = meta.icon;

  return (
    <div className="flex min-w-0 flex-col rounded-2xl border border-border bg-white p-6 shadow-sm">
      <span
        className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold wrap-break-word"
        style={{ background: meta.badgeBg, color: meta.badgeFg }}
      >
        <Icon size={12} className="shrink-0" />
        {meta.label}
      </span>
      <h3 className="mt-4 text-lg font-semibold text-[#162040] wrap-break-word line-clamp-2">
        {article.titlu}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[#475569] wrap-break-word line-clamp-3">
        {article.excerpt}
      </p>
      {article.tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-[#64748b] wrap-break-word"
            >
              #{tag}
            </span>
          ))}
        </div>
      ) : null}
      <span
        className="mt-auto flex items-center gap-1 self-end pt-4 text-sm font-semibold"
        style={{ color: "#2dbe8f" }}
      >
        Citește <ChevronRight size={16} className="shrink-0" />
      </span>
    </div>
  );
}

/**
 * "Article Grid" — a titled section with a responsive grid of article cards,
 * either hand-picked or pulled as the most recent (optionally filtered by
 * category). Reads the mock `ARTICLE_CATALOG` until a "Bibliotecă" endpoint
 * exists. Pure (no hooks, no `"use client"`) so it can render on the public page
 * unchanged once a backend feeds it the same shape.
 */
export function ArticleGrid({ data }: { data: ArticleGridData }) {
  const articles = resolveArticles(data);

  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2
            className="font-heading wrap-break-word"
            style={{
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              color: "#162040",
            }}
          >
            {data.titlu}
          </h2>
        </div>

        {articles.length > 0 ? (
          <div className={`grid grid-cols-1 gap-6 ${COL_CLASS[data.coloane]}`}>
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border-2 border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
            Niciun articol de afișat.
          </p>
        )}
      </div>
    </section>
  );
}
