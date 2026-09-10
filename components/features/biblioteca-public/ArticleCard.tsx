import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";
import type { ArticleSummary } from "@/lib/api/articles-types";
import { tipBadgeColors } from "./tip-badge";

export function ArticleCard({ article }: { article: ArticleSummary }) {
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
        {article.rezumat ? (
          <p className="mt-2 text-sm leading-relaxed text-[#475569] wrap-break-word">
            {article.rezumat}
          </p>
        ) : null}
        {article.etichete.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {article.etichete.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-[#475569]"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex items-center justify-end border-t border-border px-6 py-3.5">
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#2dbe8f]">
          Citește <ChevronRight size={15} />
        </span>
      </div>
    </>
  );

  // `cale` is null only when the taxonomy relation is incomplete, which the
  // backend's required subcategory should prevent — but the type admits it, so
  // an unaddressable article renders as a plain card rather than a dead link.
  return article.cale ? (
    <Link
      href={article.cale}
      className="flex h-full min-w-0 flex-col rounded-2xl border border-border bg-white transition-shadow hover:shadow-md"
    >
      {body}
    </Link>
  ) : (
    <div className="flex h-full min-w-0 flex-col rounded-2xl border border-border bg-white">{body}</div>
  );
}
