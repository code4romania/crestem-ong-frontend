"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { getMediaUrl } from "@/lib/api/client";
import { userDisplayName } from "@/lib/api/auth";
import type { AdminUser } from "@/lib/api/users";
import { formatShortDate } from "@/lib/utils/date";
import { avatarColorFor } from "@/lib/utils/avatar";
import { DeletedAccountBadge } from "@/components/ui/DeletedAccountBadge";

export function PersoaneResursaTable({ mentors }: { mentors: AdminUser[] }) {
  if (mentors.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">Nicio persoană resursă găsită.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            {[
              "Persoană resursă",
              "Data adăugării",
              "Programe alocate",
              "Acțiuni",
            ].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: "#94a3b8" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mentors.map((mentor) => {
            const displayName = userDisplayName(mentor);
            const initials = displayName.slice(0, 2).toUpperCase();
            return (
              <tr
                key={mentor.documentId}
                className={`border-b border-border last:border-0 hover:bg-slate-50 transition-colors ${
                  mentor.accountStatus === "deleted" ? "opacity-60" : ""
                }`}
              >
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    {mentor.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getMediaUrl(mentor.avatar.url)}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
                        style={{ background: avatarColorFor(mentor.documentId) }}
                      >
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold whitespace-normal wrap-break-word" style={{ color: "#162040" }}>
                          {displayName}
                        </p>
                        {mentor.accountStatus === "deleted" && <DeletedAccountBadge />}
                      </div>
                      {mentor.accountStatus !== "deleted" && (
                        <p className="text-xs truncate" style={{ color: "#64748b" }}>
                          {mentor.email}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: "#475569" }}>
                  {formatShortDate(mentor.createdAt)}
                </td>
                <td className="px-4 py-3.5">
                  {mentor.programs.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {mentor.programs.map((program) => (
                        <span
                          key={program.documentId}
                          className="px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: "#faf5ff", color: "#9333ea" }}
                        >
                          {program.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: "#94a3b8" }}>—</span>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/persoane-resursa/${mentor.documentId}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs font-medium hover:bg-slate-50 transition-colors"
                      style={{ color: "#475569" }}
                    >
                      <Eye size={14} />
                      Vezi
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
