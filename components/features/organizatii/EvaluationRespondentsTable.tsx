"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertCircle, Eye } from "lucide-react";
import type { OngEvaluationRespondent } from "@/lib/api/ongs";
import {
  MEMBER_STATUS_COLORS,
  MEMBER_STATUS_ICONS,
  MEMBER_STATUS_LABELS,
  MEMBER_TABLE_COLUMNS,
} from "@/components/features/evaluari/evaluation-status";
import {
  ANONYMOUS_RESPONDENTS_TABLE_TITLE,
  RESPONDENTS_TABLE_TITLE,
  respondentLabel,
} from "./respondent-label";

function formatDate(iso: string) {
  if (!iso) return "—";
  const [year, month, day] = iso.slice(0, 10).split("-");
  return `${day}.${month}.${year}`;
}

/**
 * Everyone invited to an evaluation, as FDSC staff and mentors see them. Mirrors
 * the ONG admin's `ReportMembersTable`, minus the actions only the organization
 * owns (adding members, reminders) and plus the link into a single respondent's
 * matrix. Rows come from the report payload's `evaluations` — one per invited
 * member — because `/api/reports/:documentId/members` is ONG-admin only.
 *
 * The per-respondent link is built off `usePathname()` rather than a prop: the
 * proxy strips the role segment from the URL, so the same `<current page>/membru/:id`
 * suffix resolves to the FDSC or the mentor page without either knowing about it.
 */
export function EvaluationRespondentsTable({
  respondents,
  anonymous = false,
}: {
  respondents: OngEvaluationRespondent[];
  anonymous?: boolean;
}) {
  const pathname = usePathname();
  const completedCount = respondents.filter(
    (respondent) => respondent.progress?.complete,
  ).length;

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden mt-6">
      <div className="px-6 py-4 border-b border-border flex items-center gap-3">
        <h2 className="font-bold text-base" style={{ color: "#162040" }}>
          {anonymous
            ? ANONYMOUS_RESPONDENTS_TABLE_TITLE
            : RESPONDENTS_TABLE_TITLE}
        </h2>
        {respondents.length > 0 && (
          <span
            className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ background: "#f0faf6", color: "#2dbe8f" }}
          >
            {completedCount} / {respondents.length} completat
          </span>
        )}
      </div>

      {respondents.length === 0 ? (
        <p className="px-6 py-8 text-center text-sm text-muted-foreground">
          Niciun membru invitat încă.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{
                  background: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                {MEMBER_TABLE_COLUMNS.map(({ label, align }) => (
                  <th
                    key={label}
                    className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider ${align}`}
                    style={{ color: "#94a3b8" }}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {respondents.map((respondent, index) => {
                const status = respondent.progress?.status ?? "neinceput";
                const statusColor =
                  MEMBER_STATUS_COLORS[status] ??
                  MEMBER_STATUS_COLORS.neinceput;
                const StatusIcon = MEMBER_STATUS_ICONS[status] ?? AlertCircle;
                return (
                  <tr
                    key={respondent.documentId}
                    className="border-b border-border last:border-0 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-semibold" style={{ color: "#162040" }}>
                        {respondentLabel(respondent, index, anonymous)}
                      </p>
                      {!anonymous && (
                        <p className="text-xs text-muted-foreground">
                          {respondent.user?.email ?? "—"}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: statusColor.bg,
                          color: statusColor.color,
                        }}
                      >
                        <StatusIcon size={11} />{" "}
                        {MEMBER_STATUS_LABELS[status] ?? status}
                      </span>
                    </td>
                    <td
                      className="px-5 py-3.5 text-center"
                      style={{ color: "#64748b" }}
                    >
                      {respondent.completedAt
                        ? formatDate(respondent.completedAt)
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {respondent.progress?.complete && (
                        <Link
                          href={`${pathname}/membru/${respondent.documentId}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border transition-colors hover:bg-slate-50"
                          style={{ color: "#162040" }}
                        >
                          <Eye size={11} /> Vezi evaluarea
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
