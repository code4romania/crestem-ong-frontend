import { serverApiFetch } from "@/lib/api/server";
import type { Ong, OngFdscReport } from "@/lib/api/ongs";
import { FdscReportsTable } from "@/components/features/organizatii/FdscReportsTable";
import { AddFdscReportModal } from "@/components/features/organizatii/AddFdscReportModal";

export default async function OrganizatieRapoartePage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;

  const [ongRes, reportsRes] = await Promise.all([
    serverApiFetch<{ data: Ong }>(`/api/ongs/${documentId}`),
    serverApiFetch<{ data: OngFdscReport[] }>(`/api/ongs/${documentId}/fdsc-reports`),
  ]);

  const ong = ongRes.data;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-heading font-extrabold" style={{ color: "#1c1c81" }}>
            Arhivă rapoarte
          </h2>
          <p className="text-sm text-muted-foreground">
            Toate rapoartele asociate acestei organizații, indiferent de program
          </p>
        </div>
        <AddFdscReportModal ongDocumentId={documentId} programs={ong.programs} />
      </div>

      <FdscReportsTable reports={reportsRes.data} ongDocumentId={documentId} />
    </div>
  );
}
