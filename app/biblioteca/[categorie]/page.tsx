import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { listPublicArticlesBrowse, listPublicCategories } from "@/lib/api/biblioteca-public";
import { ArticleCard } from "@/components/features/biblioteca-public/ArticleCard";
import { ArticleFilters } from "@/components/features/biblioteca-public/ArticleFilters";

const resultLabel = (count: number) =>
  `${count} ${count === 1 ? "resursă găsită" : "resurse găsite"}`;

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ categorie: string }>;
  searchParams: Promise<{ q?: string; tip?: string; subcategorie?: string; page?: string }>;
}) {
  const { categorie } = await params;
  const query = await searchParams;

  const categories = await listPublicCategories();
  const category = categories.find((entry) => entry.slug === categorie);
  // A category with nothing publicly visible is omitted entirely by the
  // backend, so an emptied category answers the same as one that never
  // existed — never a partial page confirming its own emptiness.
  if (!category) notFound();

  const result = await listPublicArticlesBrowse({
    categorie,
    subcategorie: query.subcategorie,
    tip: query.tip,
    q: query.q,
    page: Number(query.page) || 1,
  });

  const { page, pageCount, total } = result.meta.pagination;

  const hrefForPage = (target: number) => {
    const next = new URLSearchParams();
    if (query.q) next.set("q", query.q);
    if (query.tip) next.set("tip", query.tip);
    if (query.subcategorie) next.set("subcategorie", query.subcategorie);
    if (target > 1) next.set("page", String(target));
    const suffix = next.toString() ? `?${next}` : "";
    return `/biblioteca/${categorie}${suffix}`;
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <Link
        href="/biblioteca"
        className="mb-6 inline-flex items-center gap-2 text-sm text-[#475569] transition-colors hover:text-[#162040]"
      >
        <ArrowLeft size={15} />
        Înapoi la Bibliotecă
      </Link>

      <h1 className="font-heading text-3xl font-extrabold text-[#162040]">{category.nume}</h1>
      {category.descriere ? (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#475569]">
          {category.descriere}
        </p>
      ) : null}

      <div className="mt-8">
        <ArticleFilters
          categorieSlug={categorie}
          subcategorii={category.copii}
          tipuri={result.meta.tipuri}
          active={{
            q: query.q ?? "",
            tip: query.tip ?? "",
            subcategorie: query.subcategorie ?? "",
          }}
        />
      </div>

      <p className="mt-4 text-sm text-[#475569]">{resultLabel(total)}</p>

      {result.data.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-border bg-white px-6 py-12 text-center text-sm text-muted-foreground">
          Nicio resursă nu corespunde filtrelor alese.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {result.data.map((article) => (
            <ArticleCard key={article.documentId} article={article} />
          ))}
        </div>
      )}

      {pageCount > 1 ? (
        <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Paginare">
          {page > 1 ? (
            <Link href={hrefForPage(page - 1)} className="text-sm font-semibold text-[#2dbe8f]">
              Anterior
            </Link>
          ) : null}
          <span className="text-sm text-[#475569]">
            Pagina {page} din {pageCount}
          </span>
          {page < pageCount ? (
            <Link href={hrefForPage(page + 1)} className="text-sm font-semibold text-[#2dbe8f]">
              Următor
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
