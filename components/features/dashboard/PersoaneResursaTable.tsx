"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getMediaUrl } from "@/lib/api/client";
import { userDisplayName } from "@/lib/api/auth";
import type { AdminUser } from "@/lib/api/users";
import { formatShortDate } from "@/lib/utils/date";
import { avatarColorFor } from "@/lib/utils/avatar";
import { DeletedAccountBadge } from "@/components/ui/DeletedAccountBadge";
import { AccountStatusBadge } from "./AccountStatusBadge";
import { MentorRowMenu } from "./MentorRowMenu";

const detailHref = (documentId: string) =>
  `/dashboard/persoane-resursa/${documentId}`;

export function PersoaneResursaTable({
  mentors,
  canManage,
}: {
  mentors: AdminUser[];
  canManage: boolean;
}) {
  const router = useRouter();

  // The whole row opens the detail page; the name is the real link, for the
  // keyboard, screen readers and opening in a new tab.
  const openRow = (e: React.MouseEvent, href: string) => {
    if ((e.target as HTMLElement).closest("a, button")) return;
    // Selecting text (e.g. copying an email) is not a click on the row.
    if (window.getSelection()?.toString()) return;
    if (e.metaKey || e.ctrlKey) {
      window.open(href, "_blank", "noopener");
      return;
    }
    router.push(href);
  };

  if (mentors.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Nicio persoană resursă găsită.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr
            style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}
          >
            {[
              "Persoană resursă",
              "Data adăugării",
              "Programe alocate",
              "Status",
              "Acțiuni",
            ].map((h) => (
              <th
                key={h}
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${
                  h === "Acțiuni" || h === "Data adăugării" || h === "Status"
                    ? "text-center"
                    : "text-left"
                }`}
                style={{ color: "#5b6779" }}
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
            const href = detailHref(mentor.documentId);
            return (
              <tr
                key={mentor.documentId}
                onClick={(e) => openRow(e, href)}
                className={`border-b border-border last:border-0 hover:bg-slate-50 transition-colors cursor-pointer ${
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
                        style={{
                          background: avatarColorFor(mentor.documentId),
                        }}
                      >
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={href}
                          className="font-semibold whitespace-normal wrap-break-word hover:underline rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c1c81]/40"
                          style={{ color: "#1c1c81" }}
                        >
                          {displayName}
                        </Link>
                        {mentor.accountStatus === "deleted" && (
                          <DeletedAccountBadge />
                        )}
                      </div>
                      {mentor.accountStatus !== "deleted" && (
                        <p
                          className="text-xs truncate"
                          style={{ color: "#5b6779" }}
                        >
                          {mentor.email}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td
                  className="px-4 py-3.5 whitespace-nowrap text-center"
                  style={{ color: "#475569" }}
                >
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
                    <span style={{ color: "#5b6779" }}>—</span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-center">
                  <AccountStatusBadge status={mentor.accountStatus} />
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-center">
                    <MentorRowMenu user={mentor} canManage={canManage} />
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
