import { getCurrentUser } from "@/lib/api/session-server";
import { userDisplayName } from "@/lib/api/auth";
import { ProfileHeaderCard } from "@/components/features/dashboard/ProfileHeaderCard";
import { ProfileActionsMenu } from "@/components/features/dashboard/ProfileActionsMenu";

export default async function SetariPage() {
  const user = await getCurrentUser();

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1
            className="text-2xl font-heading font-extrabold"
            style={{ color: "#162040" }}
          >
            Setări
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Informațiile contului tău pe platformă.
          </p>
        </div>
        {/* BR-35: Admin FDSC deletes their own account self-service. The backend
            blocks the last remaining administrator with a Romanian message. */}
        <ProfileActionsMenu showAddOng={false} />
      </div>

      <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3">
        Profilul meu
      </h2>

      <ProfileHeaderCard
        nume={userDisplayName(user!)}
        email={user!.email}
        createdAt={user!.createdAt}
      />
    </div>
  );
}
