import Link from "next/link";
import { ArrowLeft, ChevronRight, FileText, Tag } from "lucide-react";
import type { ArticleDetail } from "@/lib/api/articles-types";
import { tipBadgeColors } from "./tip-badge";

/**
 * The article page's header, read straight from the article record — unlike
 * the free-text `article-header` page-builder block, this cannot drift from
 * the real title, type, category and tags.
 */
export function PublicArticleHeader({ article }: { article: ArticleDetail }) {
  const tint = article.tip ? tipBadgeColors(article.tip) : null;
  const crumbs = [
    { label: "Bibliotecă", href: "/biblioteca" },
    ...(article.categorie ? [{ label: article.categorie.nume, href: `/biblioteca/${article.categorie.slug}` }] : []),
    ...(article.categorie && article.subcategorie
      ? [
          {
            label: article.subcategorie.nume,
            href: `/biblioteca/${article.categorie.slug}?subcategorie=${encodeURIComponent(article.subcategorie.slug)}`,
          },
        ]
      : []),
  ];

  return (
    <section className="relative overflow-hidden" style={{ background: "#162040" }}>
      <div className="mx-auto w-full max-w-4xl px-6 py-16">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex w-fit flex-wrap items-center gap-x-2 gap-y-1 text-sm"
          style={{ color: "rgba(255,255,255,0.72)" }}
        >
          <ArrowLeft size={16} className="shrink-0" />
          {crumbs.map((crumb, index) => (
            <span key={crumb.href} className="inline-flex items-center gap-x-2">
              {index > 0 ? <ChevronRight size={14} className="shrink-0 opacity-60" /> : null}
              <Link href={crumb.href} className="transition-opacity hover:opacity-80">
                {crumb.label}
              </Link>
            </span>
          ))}
        </nav>

        <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2">
          {article.tip && tint ? (
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: tint.bg, color: tint.fg }}
            >
              <FileText size={12} className="shrink-0" />
              {article.tip}
            </span>
          ) : null}
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.72)" }}>
            {article.categorie?.nume}
          </p>
        </div>

        <h1
          className="font-heading text-white wrap-break-word"
          style={{ fontSize: "clamp(2rem, 4.5vw, 3.25rem)", fontWeight: 800, lineHeight: 1.12 }}
        >
          {article.titlu}
        </h1>

        {article.etichete.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {article.etichete.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.72)" }}
              >
                <Tag size={11} className="shrink-0" />#{tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
