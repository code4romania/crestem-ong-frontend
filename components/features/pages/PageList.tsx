"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  deletePageAction,
  setPagePublishedAction,
} from "@/lib/api/pages-actions";
import {
  AUDIENCE_LABEL,
  type PageListResult,
  type PageSummary,
} from "@/lib/api/pages-types";

type Pagination = PageListResult["meta"]["pagination"];

export function PageList({
  pages,
  homepage,
  search,
  pagination,
}: {
  pages: PageSummary[];
  /**
   * The landing page, served outside the paginated set. It is rendered first
   * on every page of the list and under every search term: editing it is a
   * frequent job, and it must never be something to page or search for.
   */
  homepage: PageSummary | null;
  search: string;
  pagination: Pagination;
}) {
  const router = useRouter();
  const [term, setTerm] = useState(search);
  const [deleting, setDeleting] = useState<PageSummary | null>(null);
  const [pending, startTransition] = useTransition();

  const submitSearch = (value: string) => {
    setTerm(value);
    const query = value.trim()
      ? `?search=${encodeURIComponent(value.trim())}`
      : "";
    startTransition(() => router.push(`/dashboard/pagini${query}`));
  };

  function hrefForPage(targetPage: number) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return `/dashboard/pagini${qs ? `?${qs}` : ""}`;
  }

  const togglePublished = (page: PageSummary) => {
    startTransition(async () => {
      const result = await setPagePublishedAction(
        page.documentId,
        !page.publicat,
      );
      if (result.error) toast.error(result.error);
      else router.refresh();
    });
  };

  const confirmDelete = () => {
    if (!deleting) return;
    const target = deleting;
    setDeleting(null);
    startTransition(async () => {
      const result = await deletePageAction(target.documentId);
      if (result.error) toast.error(result.error);
      else router.refresh();
    });
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-[#1c1c81]">
            Pagini
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestionează paginile site-ului public
          </p>
        </div>
        <Link
          href="/dashboard/pagini/creeaza"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#5656e5] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Plus size={15} />
          Creează pagină
        </Link>
      </div>

      <div className="relative mb-5">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5b6779]"
        />
        <input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && submitSearch(term)}
          onBlur={() => submitSearch(term)}
          placeholder="Caută pagini..."
          aria-label="Caută pagini"
          className="w-full rounded-xl border border-border py-2.5 pl-10 pr-4 text-sm focus:border-[#007d58] focus:outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50">
                {[
                  "Titlu",
                  "Slug",
                  "Status",
                  "Vizibilitate",
                  "Actualizat",
                  "Acțiuni",
                ].map((head) => (
                  <th
                    key={head}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#5b6779]"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {homepage && (
                <PageRow
                  page={homepage}
                  pending={pending}
                  onTogglePublished={togglePublished}
                  onDelete={setDeleting}
                />
              )}
              {pages.map((page) => (
                <PageRow
                  key={page.documentId}
                  page={page}
                  pending={pending}
                  onTogglePublished={togglePublished}
                  onDelete={setDeleting}
                />
              ))}
            </tbody>
          </table>
        </div>

        {pages.length === 0 && !homepage && (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Nicio pagină găsită.
            </p>
          </div>
        )}
      </div>

      {pagination.pageCount > 1 && (
        <nav
          aria-label="Paginare pagini"
          className="mt-6 flex items-center justify-center gap-1"
        >
          <PagerLink
            href={hrefForPage(Math.max(1, pagination.page - 1))}
            disabled={pagination.page === 1}
          >
            Anterior
          </PagerLink>
          <PagerLink
            href={hrefForPage(
              Math.min(pagination.pageCount, pagination.page + 1),
            )}
            disabled={pagination.page === pagination.pageCount}
          >
            Următor
          </PagerLink>
        </nav>
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Ștergi această pagină?"
        description={`„${deleting?.titlu}" va fi ștearsă definitiv, împreună cu tot conținutul ei. Elementele de meniu care duceau spre ea rămân, dar vor da 404.`}
        confirmLabel="Șterge"
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

/**
 * One row of the table. The landing page and the paginated pages share it, so
 * the two never drift apart; what the landing page does not get is the pair of
 * controls that could take the site's root down.
 */
function PageRow({
  page,
  pending,
  onTogglePublished,
  onDelete,
}: {
  page: PageSummary;
  pending: boolean;
  onTogglePublished: (page: PageSummary) => void;
  onDelete: (page: PageSummary) => void;
}) {
  return (
    <tr className="border-b border-border last:border-0 hover:bg-slate-50">
      <td className="px-4 py-3.5 font-heading font-semibold text-[#1c1c81]">
        {page.titlu}
        {page.esteHomepage && (
          <span className="ml-2 rounded-full bg-[#dcfafb] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#5656e5]">
            Pagină de start
          </span>
        )}
      </td>
      <td className="px-4 py-3.5">
        <code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-[#475569]">
          {page.cale}
        </code>
      </td>
      <td className="px-4 py-3.5">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            page.publicat
              ? "bg-[#f0fdf4] text-[#15803d]"
              : "bg-[#fffbeb] text-[#b45309]"
          }`}
        >
          {page.publicat ? "publicat" : "schiță"}
        </span>
      </td>
      <td className="px-4 py-3.5 text-[#475569]">
        {page.vizibilitate
          .map((audience) => AUDIENCE_LABEL[audience])
          .join(", ")}
      </td>
      <td className="px-4 py-3.5 text-muted-foreground">
        {new Date(page.actualizat).toLocaleDateString("ro-RO")}
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <Link
            href={`/dashboard/pagini/${page.documentId}`}
            aria-label={`Editează „${page.titlu}"`}
            className="rounded-lg p-1.5 text-[#5b6779] transition-colors hover:bg-slate-100"
          >
            <Pencil size={13} />
          </Link>
          {/* Neither control exists for the landing page: the
              backend refuses both, and offering a button that always
              errors is worse than not offering it. */}
          {!page.esteHomepage && (
            <>
              <button
                type="button"
                onClick={() => onTogglePublished(page)}
                disabled={pending}
                aria-label={
                  page.publicat
                    ? `Retrage „${page.titlu}"`
                    : `Publică „${page.titlu}"`
                }
                className="rounded-lg p-1.5 text-[#5b6779] transition-colors hover:bg-slate-100 disabled:opacity-50"
              >
                {page.publicat ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
              <button
                type="button"
                onClick={() => onDelete(page)}
                disabled={pending}
                aria-label={`Șterge „${page.titlu}"`}
                className="rounded-lg p-1.5 text-[#5b6779] transition-colors hover:bg-red-50 hover:text-[#b91c1c] disabled:opacity-50"
              >
                <Trash2 size={13} />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
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
        style={{ color: "#5b6779" }}
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
