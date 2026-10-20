"use client";

import { useState } from "react";
import { Download, Info, Pencil } from "lucide-react";
import { getMediaUrl } from "@/lib/api/client";
import { formatMeetingDateTime } from "@/lib/utils/date";
import type { OngMeeting } from "@/lib/api/meetings";
import type { Dimension } from "@/lib/api/dimensions";
import { DeletedAccountBadge } from "@/components/ui/DeletedAccountBadge";
import { MeetingDetailsModal } from "./MeetingDetailsModal";
import { MeetingFormModal } from "./MeetingFormModal";

const STATUS_BADGES: Record<OngMeeting["status"], { label: string; bg: string; color: string }> = {
  programata: { label: "Programată", bg: "#dcfafb", color: "#5656e5" },
  efectuata: { label: "Efectuată", bg: "#f0fdf4", color: "#15803d" },
  anulata: { label: "Anulată", bg: "#fef2f2", color: "#b91c1c" },
};

const FORMAT_LABELS: Record<OngMeeting["format"], string> = {
  online: "Online",
  fata_in_fata: "Față în față",
};

interface MentorOption {
  documentId: string;
  nume: string;
}

interface ProgramOption {
  documentId: string;
  name: string;
}

interface ActivityTypeOption {
  documentId: string;
  name: string;
}

/** Present only on the ngo-admin's own Întâlniri page — the FDSC read-only
 * view doesn't pass this, so no edit affordance renders there. */
export interface MeetingsTableEditing {
  ongDocumentId: string;
  mentors: MentorOption[];
  programs: ProgramOption[];
  activityTypes: ActivityTypeOption[];
}

export function MeetingsTable({
  meetings,
  ongName,
  dimensions,
  editing,
}: {
  meetings: OngMeeting[];
  ongName: string;
  dimensions: Dimension[];
  editing?: MeetingsTableEditing;
}) {
  const [openMeetingId, setOpenMeetingId] = useState<string | null>(null);
  const [editMeetingId, setEditMeetingId] = useState<string | null>(null);
  const openMeeting = meetings.find((meeting) => meeting.documentId === openMeetingId) ?? null;
  const editMeeting = meetings.find((meeting) => meeting.documentId === editMeetingId) ?? null;

  if (meetings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Nicio întâlnire nu corespunde filtrelor selectate.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            {["Persoană resursă", "Data și ora", "Format", "Status", "Program", "Raport", "Acțiuni"].map((h) => (
              <th
                key={h}
                className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                style={{ color: "#5b6779" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {meetings.map((meeting) => {
            const statusBadge = STATUS_BADGES[meeting.status];
            const fileUrl = meeting.report ? getMediaUrl(meeting.report.url) : null;
            return (
              <tr key={meeting.documentId} className="border-b border-border last:border-0">
                <td className="px-5 py-3.5 font-semibold whitespace-nowrap" style={{ color: "#1c1c81" }}>
                  <span className={meeting.mentor?.isDeleted ? "opacity-60" : ""}>
                    {meeting.mentor?.nume ?? "—"}
                  </span>
                  {meeting.mentor?.isDeleted && <DeletedAccountBadge className="ml-2" />}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap" style={{ color: "#5b6779" }}>
                  {formatMeetingDateTime(meeting.dataOra)}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ background: "#f1f5f9", color: "#475569" }}
                  >
                    {FORMAT_LABELS[meeting.format]}
                  </span>
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ background: statusBadge.bg, color: statusBadge.color }}
                  >
                    {statusBadge.label}
                  </span>
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap" style={{ color: "#5b6779" }}>
                  {meeting.program?.name ?? "—"}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  {fileUrl ? (
                    <a
                      href={fileUrl}
                      download={meeting.report?.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-slate-50 transition-colors"
                      style={{ color: "#334155" }}
                    >
                      <Download size={13} /> Descarcă raport
                    </a>
                  ) : (
                    <span style={{ color: "#5b6779" }}>—</span>
                  )}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOpenMeetingId(meeting.documentId)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-slate-50 transition-colors"
                      style={{ color: "#334155" }}
                    >
                      <Info size={13} /> Detalii
                    </button>
                    {editing && meeting.status === "programata" && (
                      <button
                        type="button"
                        onClick={() => setEditMeetingId(meeting.documentId)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-slate-50 transition-colors"
                        style={{ color: "#334155" }}
                      >
                        <Pencil size={13} /> Editează
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {openMeeting && (
        <MeetingDetailsModal
          meeting={openMeeting}
          ongName={ongName}
          dimensions={dimensions}
          onClose={() => setOpenMeetingId(null)}
          onEdit={
            editing
              ? () => {
                  setOpenMeetingId(null);
                  setEditMeetingId(openMeeting.documentId);
                }
              : undefined
          }
        />
      )}
      {editing && (
        <MeetingFormModal
          open={editMeeting !== null}
          onClose={() => setEditMeetingId(null)}
          ongDocumentId={editing.ongDocumentId}
          mentors={editing.mentors}
          programs={editing.programs}
          activityTypes={editing.activityTypes}
          dimensions={dimensions}
          meeting={editMeeting ?? undefined}
        />
      )}
    </div>
  );
}
