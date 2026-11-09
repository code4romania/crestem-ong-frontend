import { serverApiFetch } from "@/lib/api/server";
import { getCurrentUser } from "@/lib/api/session-server";
import { listUsers } from "@/lib/api/users";
import { listDimensions } from "@/lib/api/dimensions";
import type { Program } from "@/lib/api/programs";
import { PersoaneResursaFilters } from "@/components/features/dashboard/PersoaneResursaFilters";
import { PersoaneResursaTable } from "@/components/features/dashboard/PersoaneResursaTable";
import { PersoaneResursaPagination } from "@/components/features/dashboard/PersoaneResursaPagination";
import { PersoaneResursaHeaderActions } from "@/components/features/dashboard/PersoaneResursaHeaderActions";
import { DownloadButton } from "@/components/ui/DownloadButton";

interface PageProps {
  searchParams: Promise<{ search?: string; program?: string; page?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search ?? "";
  const program = params.program ?? "";
  const page = Math.max(1, Number(params.page) || 1);

  const [{ data: mentors, meta }, { data: programs }, dimensions, user] =
    await Promise.all([
      listUsers({
        role: "mentor",
        search,
        program,
        page,
        sort: "createdAt:desc",
      }),
      serverApiFetch<{ data: Program[] }>("/api/programs"),
      listDimensions(),
      getCurrentUser(),
    ]);

  // `editor-fdsc` reads this screen but does not administer it: no adding, no
  // editing, no removing. Only the administrator gets the write actions.
  const canManage = user?.role?.type === "super-admin";
  const exportQuery = new URLSearchParams(
    Object.entries({ search, program }).filter(([, value]) => value),
  ).toString();

  return (
    <div>
      <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
        <div>
          <h1
            className="text-2xl font-heading font-extrabold"
            style={{ color: "#1c1c81" }}
          >
            Persoane resursă
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Toți mentorii și experții alocați programelor platformei Crestem.ONG
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Read-only, so the editor gets it too; follows the screen's filters. */}
          <DownloadButton
            href={`/api/admin/meetings/export${exportQuery ? `?${exportQuery}` : ""}`}
            label="Descarcă jurnalul"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-border bg-white text-sm font-semibold hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c1c81]/40 focus-visible:ring-offset-2"
            style={{ color: "#1c1c81" }}
            iconSize={16}
          />
          {canManage && <PersoaneResursaHeaderActions dimensions={dimensions} />}
        </div>
      </div>

      <PersoaneResursaFilters
        programs={programs}
        initialSearch={search}
        initialProgram={program}
      />

      <PersoaneResursaTable mentors={mentors} canManage={canManage} />

      <PersoaneResursaPagination
        pagination={meta.pagination}
        search={search}
        program={program}
      />
    </div>
  );
}
