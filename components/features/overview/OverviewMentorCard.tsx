import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import type { AssignedMentor } from "@/lib/api/programs";
import { mediaUrl } from "@/lib/utils/media";
import { DeletedAccountBadge } from "@/components/ui/DeletedAccountBadge";

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

export function OverviewMentorCard({
  mentor,
  showMessage,
}: {
  mentor: AssignedMentor;
  /** Off for ngo-members: the conversations feature is ngo-admin only. */
  showMessage: boolean;
}) {
  const avatar = mediaUrl(mentor.avatar?.url);

  return (
    <div
      className={`bg-white rounded-xl border border-border p-5 ${
        mentor.isDeleted ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        {avatar ? (
          <Image
            src={avatar}
            alt={`Fotografia lui ${mentor.nume}`}
            width={44}
            height={44}
            unoptimized
            className="w-11 h-11 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
              mentor.isDeleted ? "bg-slate-400" : "bg-primary"
            }`}
          >
            {initials(mentor.nume)}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold font-heading text-primary truncate">{mentor.nume}</p>
          {mentor.isDeleted && <DeletedAccountBadge className="mt-1 inline-block" />}
          {mentor.mentorJobTitle && (
            <p className="text-sm text-accent-strong truncate">{mentor.mentorJobTitle}</p>
          )}
          {mentor.mentorOrganization && (
            <p className="text-sm text-muted-foreground truncate">{mentor.mentorOrganization}</p>
          )}
        </div>
      </div>

      {showMessage && (
        <Link
          href="/dashboard/persoane-resursa"
          className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-semibold text-primary hover:bg-muted transition-colors"
        >
          <Mail size={16} /> Mesaje
        </Link>
      )}
    </div>
  );
}
