import Link from "next/link";

/**
 * The tab row above the evaluation views. Shared by the ngo-admin dashboard
 * (`/dashboard/evaluari`) and the ngo-member one
 * (`/dashboard/<ong>`), which differ only in where the tabs point.
 *
 * "Evaluare curentă" and "Comparație" are real links only when the matching
 * href is given. The two roles reach different data behind the same labels:
 * the admin views aggregate the whole organization off the `is-ngo-admin`
 * report endpoints, while the member views are built from
 * `/api/evaluations/ong/:id` and never leave that member's own evaluations.
 *
 * Callers that already know the ONG's unfinished report should point this at
 * `<basePath>/<documentId>` directly. The `<basePath>/curenta` resolver is a
 * redirect, so linking to it costs a second server round-trip on every click
 * and the tab feels slower than the others; it is only a fallback for callers
 * that cannot resolve the report themselves.
 */
export function EvaluationTabs({
  active,
  basePath,
  currentEvaluationHref = null,
  comparisonHref = null,
}: {
  active: "overview" | "evaluations" | "current" | "comparison";
  basePath: string;
  currentEvaluationHref?: string | null;
  comparisonHref?: string | null;
}) {
  const tabClass = (isActive: boolean) =>
    isActive
      ? "shrink-0 whitespace-nowrap pb-3 text-sm font-semibold border-b-2 border-accent text-accent"
      : "shrink-0 whitespace-nowrap pb-3 text-sm font-medium text-muted-foreground hover:text-slate-700 transition-colors";

  const soonClass =
    "shrink-0 whitespace-nowrap pb-3 text-sm font-medium cursor-not-allowed opacity-40";

  return (
    <nav className="mb-6 flex items-center gap-6 overflow-x-auto border-b border-border">
      <Link
        href={`${basePath}/overview`}
        className={tabClass(active === "overview")}
      >
        Overview
      </Link>
      <Link href={basePath} className={tabClass(active === "evaluations")}>
        Istoric evaluări
      </Link>
      {currentEvaluationHref ? (
        <Link
          href={currentEvaluationHref}
          className={tabClass(active === "current")}
        >
          Evaluare curentă
        </Link>
      ) : (
        <span className={soonClass} title="Disponibil în curând">
          Evaluare curentă
        </span>
      )}
      {comparisonHref ? (
        <Link
          href={comparisonHref}
          className={tabClass(active === "comparison")}
        >
          Comparație
        </Link>
      ) : (
        <span className={soonClass} title="Disponibil în curând">
          Comparație
        </span>
      )}
    </nav>
  );
}
