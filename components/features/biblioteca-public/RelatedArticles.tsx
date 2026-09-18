import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";
import type { RelatedArticleRef } from "@/lib/api/articles-types";
import { tipBadgeColors } from "./tip-badge";

export function RelatedArticles({ articles }: { articles: RelatedArticleRef[] }) {
  if (articles.length === 0) return null;

  return (
    <section aria-labelledby="articole-relationate-heading" className="border-t border-border bg-slate-50">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <h2
          id="articole-relationate-heading"
          className="font-heading text-2xl font-extrabold text-[#162040]"
        >
          Articole relaționate
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => {
            const tint = article.tip ? tipBadgeColors(article.tip) : null;
            const body = (
              <>
                <div className="flex-1 p-6">
                  {article.tip && tint ? (
                    <span
                      className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                      style={{ background: tint.bg, color: tint.fg }}
                    >
                      <FileText size={12} className="shrink-0" />
                      {article.tip}
                    </span>
                  ) : null}
                  <h3 className="mt-4 font-heading text-lg font-bold text-[#162040] wrap-break-word">
                    {article.titlu}
                  </h3>
                </div>
                <div className="flex items-center justify-end border-t border-border px-6 py-3.5">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#2dbe8f]">
                    Accesează <ChevronRight size={15} />
                  </span>
                </div>
              </>
            );

            return article.cale ? (
              <Link
                key={article.documentId}
                href={article.cale}
                className="flex h-full min-w-0 flex-col rounded-2xl border border-border bg-white transition-shadow hover:shadow-md"
              >
                {body}
              </Link>
            ) : (
              <div
                key={article.documentId}
                className="flex h-full min-w-0 flex-col rounded-2xl border border-border bg-white"
              >
                {body}
              </div>
            );
          })}
        </div>

        <Link
          href="/biblioteca"
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#162040] hover:text-[#2dbe8f]"
        >
          <ChevronRight size={16} />
          Vezi toate resursele din bibliotecă
        </Link>
      </div>
    </section>
  );
}
