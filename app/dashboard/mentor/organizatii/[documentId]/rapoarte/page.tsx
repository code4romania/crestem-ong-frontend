import { serverApiFetch } from "@/lib/api/server";
import type { OngFdscReport } from "@/lib/api/ongs";
import { FdscReportsTable } from "@/components/features/organizatii/FdscReportsTable";

export default async function MentorOrganizatieRapoartePage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;

  const reportsRes = await serverApiFetch<{ data: OngFdscReport[] }>(
    `/api/ongs/${documentId}/fdsc-reports`,
  );

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-heading font-extrabold" style={{ color: "#1c1c81" }}>
          Arhivă rapoarte
        </h2>
        <p className="text-sm text-muted-foreground">
          Toate rapoartele asociate acestei organizații, indiferent de program
        </p>
      </div>

      <FdscReportsTable reports={reportsRes.data} ongDocumentId={documentId} readOnly />
    </div>
  );
}
