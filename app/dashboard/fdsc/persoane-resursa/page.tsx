import { serverApiFetch } from "@/lib/api/server";
import { getCurrentUser } from "@/lib/api/session-server";
import { listUsers } from "@/lib/api/users";
import { listDimensions } from "@/lib/api/dimensions";
import type { Program } from "@/lib/api/programs";
import { PersoaneResursaFilters } from "@/components/features/dashboard/PersoaneResursaFilters";
import { PersoaneResursaTable } from "@/components/features/dashboard/PersoaneResursaTable";
import { PersoaneResursaPagination } from "@/components/features/dashboard/PersoaneResursaPagination";
import { PersoaneResursaHeaderActions } from "@/components/features/dashboard/PersoaneResursaHeaderActions";

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

  return (
    <div>
      <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
        <div>
          <h1
            className="text-2xl font-heading font-extrabold"
            style={{ color: "#162040" }}
          >
            Persoane resursă
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Toți mentorii și experții alocați programelor platformei Crestem.ONG
          </p>
        </div>
        {canManage && <PersoaneResursaHeaderActions dimensions={dimensions} />}
      </div>

      <PersoaneResursaFilters
        programs={programs}
        initialSearch={search}
        initialProgram={program}
      />

      <PersoaneResursaTable mentors={mentors} />

      <PersoaneResursaPagination
        pagination={meta.pagination}
        search={search}
        program={program}
      />
    </div>
  );
}
