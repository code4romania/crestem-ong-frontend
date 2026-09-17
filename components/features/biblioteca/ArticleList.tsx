"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Eye, EyeOff, Pencil, Plus, Search, Settings, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { deleteArticleAction, setArticlePublishedAction } from "@/lib/api/articles-actions";
import type { ArticleListResult, ArticleSummary } from "@/lib/api/articles-types";
import { AUDIENCE_LABEL, VISIBILITY_AUDIENCES } from "@/lib/api/pages-types";
import type { LibraryCategory } from "@/lib/api/library-categories-types";
import { useDebouncedCallback } from "@/lib/hooks/useDebouncedCallback";

type Pagination = ArticleListResult["meta"]["pagination"];

interface Filters {
  search: string;
  categorie: string;
  subcategorie: string;
  vizibilitate: string;
}

/** At most this many tag chips before the rest collapse into `+N`. */
const VISIBLE_TAGS = 2;

const SEARCH_DEBOUNCE_MS = 400;

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString("ro-RO") : "—";

export function ArticleList({
  articles,
  search,
  categorie,
  subcategorie,
  vizibilitate,
  categories,
  pagination,
  canCreate,
}: {
  articles: ArticleSummary[];
  search: string;
  /** Active category filter, a slug — matches `LibraryCategory.slug`. */
  categorie: string;
  /** Active subcategory filter, a slug — matches `LibrarySubcategory.slug`. */
  subcategorie: string;
  vizibilitate: string;
  categories: LibraryCategory[];
  pagination: Pagination;
  /**
   * False when no subcategory exists anywhere. An article requires one, so the
   * wizard would be a dead end — the editor is sent to the taxonomy screen
   * instead of into a form they cannot submit.
   */
  canCreate: boolean;
}) {
  const router = useRouter();
  const [term, setTerm] = useState(search);
  const [deleting, setDeleting] = useState<ArticleSummary | null>(null);
  const [pending, startTransition] = useTransition();

  // The subcategory options narrow to the chosen category, so choosing a
  // category never leaves a stale subcategory from a different branch selected.
  const activeCategory = categories.find((category) => category.slug === categorie);
  const subcategoryOptions = activeCategory ? activeCategory.copii : categories.flatMap((c) => c.copii);

  function navigate(next: Filters) {
    const params = new URLSearchParams();
    if (next.search) params.set("search", next.search);
    if (next.categorie) params.set("categorie", next.categorie);
    if (next.subcategorie) params.set("subcategorie", next.subcategorie);
    if (next.vizibilitate) params.set("vizibilitate", next.vizibilitate);
    const qs = params.toString();
    startTransition(() => router.push(`/dashboard/biblioteca${qs ? `?${qs}` : ""}`));
  }

  const { debounced: debouncedNavigate, cancel: cancelNavigate } = useDebouncedCallback(
    navigate,
    SEARCH_DEBOUNCE_MS,
  );

  function handleSearchChange(value: string) {
    setTerm(value);
    debouncedNavigate({ search: value, categorie, subcategorie, vizibilitate });
  }

  function handleCategorieChange(value: string) {
    cancelNavigate();
    navigate({ search: term, categorie: value, subcategorie: "", vizibilitate });
  }

  function handleSubcategorieChange(value: string) {
    cancelNavigate();
    navigate({ search: term, categorie, subcategorie: value, vizibilitate });
  }

  function handleVizibilitateChange(value: string) {
    cancelNavigate();
    navigate({ search: term, categorie, subcategorie, vizibilitate: value });
  }

  function hrefForPage(targetPage: number) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (categorie) params.set("categorie", categorie);
    if (subcategorie) params.set("subcategorie", subcategorie);
    if (vizibilitate) params.set("vizibilitate", vizibilitate);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return `/dashboard/biblioteca${qs ? `?${qs}` : ""}`;
  }

  const togglePublished = (article: ArticleSummary) => {
    startTransition(async () => {
      const result = await setArticlePublishedAction(article.documentId, !article.publicat);
      if (result.error) toast.error(result.error);
      else router.refresh();
    });
  };

  const confirmDelete = () => {
    if (!deleting) return;
    const target = deleting;
    setDeleting(null);
    startTransition(async () => {
      const result = await deleteArticleAction(target.documentId);
      if (result.error) toast.error(result.error);
      else router.refresh();
    });
  };

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-[#162040]">Bibliotecă</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestionează conținutul bibliotecii
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/dashboard/biblioteca/categorii"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-[#475569] transition-colors hover:bg-slate-50"
          >
            <Settings size={15} />
            Gestionează categorii
          </Link>
          {canCreate ? (
            <Link
              href="/dashboard/biblioteca/creeaza"
              className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <Plus size={15} />
              Articol nou
            </Link>
          ) : (
            <span
              title="Adaugă mai întâi o subcategorie"
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white opacity-50"
            >
              <Plus size={15} />
              Articol nou
            </span>
          )}
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
          <input
            value={term}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Caută articole..."
            aria-label="Caută articole"
            className="w-full rounded-xl border border-border py-2.5 pl-10 pr-4 text-sm focus:border-[#2dbe8f] focus:outline-none"
          />
        </div>

        <div className="relative">
          <label htmlFor="biblioteca-categorie" className="sr-only">
            Filtrează după categorie
          </label>
          <select
            id="biblioteca-categorie"
            value={categorie}
            onChange={(event) => handleCategorieChange(event.target.value)}
            className="w-full appearance-none rounded-xl border border-border bg-white py-2.5 pl-4 pr-9 text-sm sm:w-48"
          >
            <option value="">Toate categoriile</option>
            {categories.map((category) => (
              <option key={category.documentId} value={category.slug}>
                {category.nume}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
          />
        </div>

        <div className="relative">
          <label htmlFor="biblioteca-subcategorie" className="sr-only">
            Filtrează după subcategorie
          </label>
          <select
            id="biblioteca-subcategorie"
            value={subcategorie}
            onChange={(event) => handleSubcategorieChange(event.target.value)}
            className="w-full appearance-none rounded-xl border border-border bg-white py-2.5 pl-4 pr-9 text-sm sm:w-48"
          >
            <option value="">Toate subcategoriile</option>
            {subcategoryOptions.map((subcategory) => (
              <option key={subcategory.documentId} value={subcategory.slug}>
                {subcategory.nume}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
          />
        </div>

        <div className="relative">
          <label htmlFor="biblioteca-vizibilitate" className="sr-only">
            Filtrează după vizibilitate
          </label>
          <select
            id="biblioteca-vizibilitate"
            value={vizibilitate}
            onChange={(event) => handleVizibilitateChange(event.target.value)}
            className="w-full appearance-none rounded-xl border border-border bg-white py-2.5 pl-4 pr-9 text-sm sm:w-48"
          >
            <option value="">Toate audiențele</option>
            {VISIBILITY_AUDIENCES.map((audience) => (
              <option key={audience} value={audience}>
                {AUDIENCE_LABEL[audience]}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50">
              {[
                "Titlu",
                "Categorie",
                "Etichete",
                "Autor",
                "Status",
                "Vizibilitate",
                "Publicat",
                "Acțiuni",
              ].map((head) => (
                <th
                  key={head}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr
                key={article.documentId}
                className="border-b border-border last:border-0 hover:bg-slate-50"
              >
                <td className="max-w-xs px-4 py-3.5">
                  <p className="font-heading font-semibold text-[#162040]">{article.titlu}</p>
                  {article.rezumat ? (
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {article.rezumat}
                    </p>
                  ) : null}
                </td>

                <td className="px-4 py-3.5">
                  <div className="flex flex-col items-start gap-1">
                    {article.categorie ? (
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {article.categorie.nume}
                      </span>
                    ) : null}
                    {article.subcategorie ? (
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-[#475569]">
                        {article.subcategorie.nume}
                      </span>
                    ) : null}
                  </div>
                </td>

                <td className="px-4 py-3.5">
                  <div className="flex flex-wrap items-center gap-1">
                    {article.etichete.slice(0, VISIBLE_TAGS).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-[#475569]"
                      >
                        {tag}
                      </span>
                    ))}
                    {article.etichete.length > VISIBLE_TAGS ? (
                      <span
                        title={article.etichete.slice(VISIBLE_TAGS).join(", ")}
                        className="text-xs text-[#94a3b8]"
                      >
                        +{article.etichete.length - VISIBLE_TAGS}
                      </span>
                    ) : null}
                  </div>
                </td>

                <td className="px-4 py-3.5 text-[#475569]">{article.autor || "—"}</td>

                <td className="px-4 py-3.5">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      article.publicat
                        ? "bg-[#f0fdf4] text-[#16a34a]"
                        : "bg-[#fffbeb] text-[#d97706]"
                    }`}
                  >
                    {article.publicat ? "publicat" : "schiță"}
                  </span>
                </td>

                <td className="px-4 py-3.5 text-[#475569]">
                  {article.vizibilitate.map((audience) => AUDIENCE_LABEL[audience]).join(", ")}
                </td>

                <td className="px-4 py-3.5 text-muted-foreground">
                  {formatDate(article.dataPublicarii)}
                </td>

                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/dashboard/biblioteca/${article.documentId}`}
                      aria-label={`Editează „${article.titlu}"`}
                      className="rounded-lg p-1.5 text-[#64748b] transition-colors hover:bg-slate-100"
                    >
                      <Pencil size={13} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => togglePublished(article)}
                      disabled={pending}
                      aria-label={
                        article.publicat
                          ? `Retrage „${article.titlu}"`
                          : `Publică „${article.titlu}"`
                      }
                      className="rounded-lg p-1.5 text-[#64748b] transition-colors hover:bg-slate-100 disabled:opacity-50"
                    >
                      {article.publicat ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(article)}
                      disabled={pending}
                      aria-label={`Șterge „${article.titlu}"`}
                      className="rounded-lg p-1.5 text-[#94a3b8] transition-colors hover:bg-red-50 hover:text-[#dc2626] disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {articles.length === 0 && (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              {search || categorie || subcategorie || vizibilitate
                ? "Niciun articol găsit."
                : canCreate
                  ? "Nu există încă niciun articol. Adaugă primul cu „Articol nou”."
                  : "Adaugă mai întâi o categorie și o subcategorie — un articol se salvează într-o subcategorie."}
            </p>
          </div>
        )}
      </div>

      {pagination.pageCount > 1 && (
        <nav aria-label="Paginare articole" className="mt-6 flex items-center justify-center gap-1">
          <PagerLink
            href={hrefForPage(Math.max(1, pagination.page - 1))}
            disabled={pagination.page === 1}
          >
            Anterior
          </PagerLink>
          <PagerLink
            href={hrefForPage(Math.min(pagination.pageCount, pagination.page + 1))}
            disabled={pagination.page === pagination.pageCount}
          >
            Următor
          </PagerLink>
        </nav>
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Ștergi acest articol?"
        description={`„${deleting?.titlu}" va fi șters definitiv, împreună cu tot conținutul lui. Elementele care duceau spre el rămân, dar vor da 404.`}
        confirmLabel="Șterge"
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

function PagerLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className="rounded-lg border border-border px-3 py-2 text-sm opacity-40"
        style={{ color: "#94a3b8" }}
      >
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-slate-50"
      style={{ color: "#475569" }}
    >
      {children}
    </Link>
  );
}
