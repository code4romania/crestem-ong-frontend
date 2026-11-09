import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getUser } from "@/lib/api/users";
import { getCurrentUser } from "@/lib/api/session-server";
import { userDisplayName } from "@/lib/api/auth";
import { mentorAdminActions } from "@/components/features/dashboard/mentor-admin-actions";
import { DeleteMentorButton } from "@/components/features/dashboard/DeleteMentorButton";
import { listDimensions } from "@/lib/api/dimensions";
import { PersoanaResursaDetail } from "@/components/features/dashboard/PersoanaResursaDetail";

export default async function PersoanaResursaPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;

  const [{ data: mentor }, dimensions, currentUser] = await Promise.all([
    getUser(documentId),
    listDimensions(),
    getCurrentUser(),
  ]);

  const canDelete =
    currentUser?.role?.type === "super-admin" &&
    mentorAdminActions(mentor.accountStatus).remove &&
    mentor.accountStatus !== "deleted";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          href="/dashboard/persoane-resursa"
          className="inline-flex items-center gap-1.5 text-sm font-medium"
          style={{ color: "#5b6779" }}
        >
          <ArrowLeft size={14} /> Înapoi la persoane resursă
        </Link>
        {canDelete && mentor.accountStatus !== "deleted" && (
          <DeleteMentorButton
            variant="button"
            documentId={mentor.documentId}
            nume={userDisplayName(mentor)}
            accountStatus={mentor.accountStatus}
          />
        )}
      </div>

      <PersoanaResursaDetail mentor={mentor} dimensions={dimensions} />
    </div>
  );
}
