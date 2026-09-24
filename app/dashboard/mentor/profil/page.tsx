import { getMentorProfile } from "@/lib/api/mentor-profile";
import { listDimensions } from "@/lib/api/dimensions";
import { ProfileActionsMenu } from "@/components/features/dashboard/ProfileActionsMenu";
import { MentorProfileDetailsCard } from "@/components/features/dashboard/MentorProfileDetailsCard";

export default async function MentorProfilePage() {
  const [profileRes, dimensions] = await Promise.all([
    getMentorProfile(),
    listDimensions(),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1
            className="text-2xl font-heading font-extrabold"
            style={{ color: "#1c1c81" }}
          >
            Profilul meu
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Informațiile contului tău pe platformă.
          </p>
        </div>
        <ProfileActionsMenu showAddOng={false} />
      </div>

      <MentorProfileDetailsCard
        profile={profileRes.data}
        dimensions={dimensions}
      />
    </div>
  );
}
