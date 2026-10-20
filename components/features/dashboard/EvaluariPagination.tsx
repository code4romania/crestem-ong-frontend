import Link from "next/link";
import type { AdminEvaluationsPagination } from "@/lib/api/evaluations";
import { evaluariHref, type EvaluariQuery } from "./evaluari-query";

const GAP = "gap" as const;

/**
 * Page numbers around the current one, with the first and last page always
 * reachable: `1 … 5 6 7 … 40`. Listing every page turns unusable once a filter
 * matches a few hundred evaluations.
 */
export function pageWindow(page: number, pageCount: number): (number | typeof GAP)[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }
  const start = Math.max(2, Math.min(page - 1, pageCount - 4));
  const end = Math.min(pageCount - 1, Math.max(page + 1, 5));
  const middle = Array.from({ length: end - start + 1 }, (_, index) => start + index);
  return [
    1,
    ...(start > 2 ? [GAP] : []),
    ...middle,
    ...(end < pageCount - 1 ? [GAP] : []),
    pageCount,
  ];
}

export function EvaluariPagination({
  pagination,
  query,
}: {
  pagination: AdminEvaluationsPagination;
  query: EvaluariQuery;
}) {
  const { page, pageCount } = pagination;
  if (pageCount <= 1) return null;

  const hrefFor = (targetPage: number) => evaluariHref({ ...query, page: targetPage });

  return (
    <nav aria-label="Paginare evaluări" className="flex items-center justify-center gap-1 mt-6 flex-wrap">
      <PageLink href={hrefFor(Math.max(1, page - 1))} disabled={page === 1}>
        Anterior
      </PageLink>
      {pageWindow(page, pageCount).map((entry, index) =>
        entry === GAP ? (
          <span key={`gap-${index}`} aria-hidden="true" className="px-2 text-sm" style={{ color: "#5b6779" }}>
            …
          </span>
        ) : (
          <Link
            key={entry}
            href={hrefFor(entry)}
            aria-current={entry === page ? "page" : undefined}
            className="px-3 py-2 rounded-lg text-sm border font-medium min-w-[2.5rem] text-center"
            style={
              entry === page
                ? { background: "#1c1c81", color: "white", borderColor: "#1c1c81" }
                : { borderColor: "#e2e8f0", color: "#475569" }
            }
          >
            {entry}
          </Link>
        ),
      )}
      <PageLink href={hrefFor(Math.min(pageCount, page + 1))} disabled={page === pageCount}>
        Următor
      </PageLink>
    </nav>
  );
}

function PageLink({ href, disabled, children }: { href: string; disabled: boolean; children: React.ReactNode }) {
  if (disabled) {
    return (
      <span aria-disabled="true" className="px-3 py-2 rounded-lg text-sm border border-border opacity-40" style={{ color: "#5b6779" }}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className="px-3 py-2 rounded-lg text-sm border border-border hover:bg-slate-50" style={{ color: "#475569" }}>
      {children}
    </Link>
  );
}
