import { serverApiFetch } from "@/lib/api/server";
import type { Ong, OngOverview, OngLibraryActivityRow } from "@/lib/api/ongs";
import { OrgOverviewStats } from "@/components/features/organizatii/OrgOverviewStats";
import { OrgDetailsCard } from "@/components/features/organizatii/OrgDetailsCard";
import { OrgContactCard } from "@/components/features/organizatii/OrgContactCard";
import { OrgLibraryActivityCard } from "@/components/features/organizatii/OrgLibraryActivityCard";
import { ChangeOngAdminButton } from "@/components/features/organizatii/ChangeOngAdminButton";
import { AdminTransferBanner } from "@/components/features/organizatii/AdminTransferBanner";
import { getCurrentUser } from "@/lib/api/session-server";
import { getFdscAdminTransfer, type FdscAdminTransferDetail } from "@/lib/api/admin-transfer";
// import { OrgCoursesCard } from "@/components/features/organizatii/OrgCoursesCard"; // E-learning: not implemented yet

export default async function OrganizatieOverviewPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;

  const [ongRes, overviewRes, libraryActivityRes, user] = await Promise.all([
    serverApiFetch<{ data: Ong }>(`/api/ongs/${documentId}`),
    serverApiFetch<{ data: OngOverview }>(`/api/ongs/${documentId}/overview`),
    serverApiFetch<{ data: OngLibraryActivityRow[] }>(`/api/ongs/${documentId}/library-activity`),
    getCurrentUser(),
  ]);

  const ong = ongRes.data;
  // „Schimbă administratorul” is the FDSC Admin's alone (US-5); `editor-fdsc`
  // sees neither the action nor the pending status.
  const adminTransfer: FdscAdminTransferDetail | null =
    user?.role?.type === "super-admin" ? await getFdscAdminTransfer(documentId) : null;

  return (
    <div>
      <OrgOverviewStats documentId={documentId} overview={overviewRes.data} programs={ong.programs} />

      <div className="mt-6 flex flex-col gap-6">
        <OrgDetailsCard ong={ong} />
        <OrgContactCard
          ong={ong}
          action={
            adminTransfer && (
              <ChangeOngAdminButton
                ongDocumentId={documentId}
                ongName={ong.name}
                members={adminTransfer.members}
                disabledReason={
                  adminTransfer.transfer
                    ? "Există deja un transfer în așteptare. Anulează-l înainte de a iniția unul nou."
                    : adminTransfer.ongStatus !== "active"
                      ? "Organizația nu este activă momentan."
                      : null
                }
              />
            )
          }
        >
          {adminTransfer?.transfer && (
            <AdminTransferBanner
              transfer={adminTransfer.transfer}
              mode="fdsc"
              ongDocumentId={documentId}
            />
          )}
        </OrgContactCard>
        <OrgLibraryActivityCard rows={libraryActivityRes.data} />
        {/* <OrgCoursesCard /> */}
      </div>
    </div>
  );
}
