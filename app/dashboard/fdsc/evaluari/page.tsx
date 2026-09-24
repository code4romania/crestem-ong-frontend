import {
  listAdminEvaluations,
  listAdminReports,
  type AdminEvaluationsPagination,
} from "@/lib/api/evaluations";
import { EvaluariFilters } from "@/components/features/dashboard/EvaluariFilters";
import { statusOptionsForTab } from "@/components/features/dashboard/evaluari-query";
import { EvaluariTable } from "@/components/features/dashboard/EvaluariTable";
import { EvaluariOrganizatiiTable } from "@/components/features/dashboard/EvaluariOrganizatiiTable";
import { EvaluariPagination } from "@/components/features/dashboard/EvaluariPagination";
import { EvaluariTabs, isEvaluariTab } from "@/components/features/dashboard/EvaluariTabs";

/** "Afișezi 1-20 din 137 evaluări" — the count stays visible on a single page too. */
function rangeLabel({ page, pageSize, total }: AdminEvaluationsPagination) {
  if (total === 0) return "Nicio evaluare";
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return `Afișezi ${from}-${to} din ${total} ${total === 1 ? "evaluare" : "evaluări"}`;
}

const csv = (value?: string) =>
  (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

interface PageProps {
  searchParams: Promise<{
    tab?: string;
    search?: string;
    ongs?: string;
    programs?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const tab = isEvaluariTab(params.tab) ? params.tab : "utilizatori";
  const search = params.search ?? "";
  const ongs = csv(params.ongs);
  const programs = csv(params.programs);
  // A status from the other tab (an old link) would filter on nothing the grid shows.
  const status = statusOptionsForTab(tab).some((option) => option.value === params.status)
    ? params.status!
    : "";
  const page = Math.max(1, Number(params.page) || 1);

  const query = { tab, search, ongs, programs, status, page };
  // Only the tab on screen is fetched; the other one loads when it is opened.
  const { data, meta } =
    tab === "organizatii"
      ? await listAdminReports(query)
      : await listAdminEvaluations(query);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-extrabold" style={{ color: "#1c1c81" }}>
          Evaluări
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Toate evaluările platformei, pe utilizatori și pe organizații
        </p>
      </div>

      <EvaluariTabs query={query} />

      {/* Keyed by tab: the filter inputs seed from these props once, so without a
          remount they would keep showing the values of the tab just left. */}
      <EvaluariFilters
        key={tab}
        tab={tab}
        searchPlaceholder={
          tab === "organizatii"
            ? "Caută după nume organizație, CUI sau email..."
            : "Caută după nume utilizator, email sau CUI..."
        }
        initialSearch={search}
        initialOngs={ongs}
        initialPrograms={programs}
        initialStatus={status}
      />

      <p className="mb-3 text-sm text-muted-foreground" aria-live="polite">
        {rangeLabel(meta.pagination)}
      </p>

      {tab === "organizatii" ? (
        <EvaluariOrganizatiiTable reports={data as Awaited<ReturnType<typeof listAdminReports>>["data"]} />
      ) : (
        <EvaluariTable evaluations={data as Awaited<ReturnType<typeof listAdminEvaluations>>["data"]} />
      )}

      <EvaluariPagination pagination={meta.pagination} query={query} />
    </div>
  );
}
