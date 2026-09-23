import { redirect } from "next/navigation";
import { serverApiFetch } from "@/lib/api/server";
import { getCurrentUser } from "@/lib/api/session-server";
import { listUsers } from "@/lib/api/users";
import { listDimensions } from "@/lib/api/dimensions";
import type { OngName } from "@/lib/api/ongs";
import { UtilizatoriFilters } from "@/components/features/dashboard/UtilizatoriFilters";
import { UtilizatoriTable } from "@/components/features/dashboard/UtilizatoriTable";
import { UtilizatoriPagination } from "@/components/features/dashboard/UtilizatoriPagination";
import { UtilizatoriHeaderActions } from "@/components/features/dashboard/UtilizatoriHeaderActions";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    role?: string;
    ong?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  // The layout already keeps non-staff out; this screen narrows that to the
  // administrator, since `editor-fdsc` has no user administration at all. The
  // sidebar hides the entry, so this only catches a typed or bookmarked URL.
  const user = await getCurrentUser();
  if (user?.role?.type !== "super-admin") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const search = params.search ?? "";
  const role = params.role ?? "";
  const ong = params.ong ?? "";
  const status = params.status ?? "";
  const page = Math.max(1, Number(params.page) || 1);

  const [{ data: users, meta }, { data: ongs }, dimensions] = await Promise.all(
    [
      listUsers({ search, role, ong, status, page }),
      // Names only: this list fills the organization filter, and `/api/ongs`
      // serves one page of twenty now.
      serverApiFetch<{ data: OngName[] }>("/api/ongs/names"),
      listDimensions(),
    ],
  );

  return (
    <div>
      <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
        <div>
          <h1
            className="text-2xl font-heading font-extrabold"
            style={{ color: "#162040" }}
          >
            Managementul utilizatorilor
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestionează conturile și permisiunile utilizatorilor
          </p>
        </div>
        <UtilizatoriHeaderActions dimensions={dimensions} />
      </div>

      <UtilizatoriFilters
        ongs={ongs}
        initialSearch={search}
        initialRole={role}
        initialOng={ong}
        initialStatus={status}
      />

      <UtilizatoriTable users={users} dimensions={dimensions} />

      <UtilizatoriPagination
        pagination={meta.pagination}
        search={search}
        role={role}
        ong={ong}
        status={status}
      />
    </div>
  );
}
