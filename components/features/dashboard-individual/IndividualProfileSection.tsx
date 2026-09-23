import { IndividualProfileDetailsCard } from "./IndividualProfileDetailsCard";
import { ProfileActivitySections } from "@/components/features/dashboard/ProfileActivitySections";
import { ProfileActionsMenu } from "@/components/features/dashboard/ProfileActionsMenu";
import type { IndividualProfile } from "@/lib/api/individual-profile";

export function IndividualProfileSection({
  profile,
}: {
  profile: IndividualProfile;
}) {
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

      <IndividualProfileDetailsCard profile={profile} />

      <ProfileActivitySections />
    </div>
  );
}
