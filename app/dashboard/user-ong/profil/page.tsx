import { getCurrentUser } from "@/lib/api/session-server";
import { userDisplayName } from "@/lib/api/auth";
import { serverApiFetch } from "@/lib/api/server";
import type { MyOng } from "@/lib/api/evaluations";
import { ProfileHeaderCard } from "@/components/features/dashboard/ProfileHeaderCard";
import { ProfileActivitySections } from "@/components/features/dashboard/ProfileActivitySections";
import { ProfileActionsMenu } from "@/components/features/dashboard/ProfileActionsMenu";
import { OngMembershipCard } from "@/components/features/dashboard-member/OngMembershipCard";

export default async function MemberProfilePage() {
  const user = await getCurrentUser();
  const { data: ongs } = await serverApiFetch<{ data: MyOng[] }>(
    "/api/me/ongs",
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1
            className="text-2xl font-heading font-extrabold"
            style={{ color: "#162040" }}
          >
            Profilul meu
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Informațiile contului și activitatea ta pe platformă.
          </p>
        </div>
        <ProfileActionsMenu />
      </div>

      <ProfileHeaderCard
        nume={userDisplayName(user!)}
        email={user!.email}
        createdAt={user!.createdAt}
      />

      {ongs.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-8 text-center mb-6">
          <p className="text-sm text-muted-foreground">
            Nu faci parte din nicio organizație încă.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {ongs.map((ong) => (
            <OngMembershipCard key={ong.documentId} ong={ong} />
          ))}
        </div>
      )}

      <ProfileActivitySections />
    </div>
  );
}
