import { User } from "lucide-react";
import { getMediaUrl } from "@/lib/api/client";
import type { OngMentor } from "@/lib/api/ongs";
import { DeletedAccountBadge } from "@/components/ui/DeletedAccountBadge";

export function MentorCard({ mentor }: { mentor: OngMentor }) {
  const avatarUrl = mentor.avatar ? getMediaUrl(mentor.avatar.url) : null;

  return (
    <div
      className={`bg-white rounded-xl border border-border p-5 ${
        mentor.isDeleted ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={mentor.nume}
            className="w-11 h-11 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center"
            style={{ background: "#dcfafb" }}
          >
            <User size={20} style={{ color: "#5656e5" }} />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-semibold truncate" style={{ color: "#1c1c81" }}>
            {mentor.nume}
          </h3>
          {mentor.isDeleted && <DeletedAccountBadge className="mt-1 inline-block" />}
        </div>
      </div>

      {mentor.ariiDeExpertiza.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {mentor.ariiDeExpertiza.map((arie) => (
            <span
              key={arie}
              className="px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: "#f1f5f9", color: "#475569" }}
            >
              {arie}
            </span>
          ))}
        </div>
      )}

      {mentor.programs.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {mentor.programs.map((program) => (
            <span
              key={program.documentId}
              className="px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: "#e5f9e5", color: "#1c1c81" }}
            >
              {program.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
