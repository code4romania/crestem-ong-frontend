"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, Download, FileUp, Info, Pencil, XCircle } from "lucide-react";
import { getMediaUrl } from "@/lib/api/client";
import { formatMeetingDateTime } from "@/lib/utils/date";
import type { MentorOng, OngMeeting } from "@/lib/api/meetings";
import type { Dimension } from "@/lib/api/dimensions";
import { cancelMentorMeetingAction, completeMentorMeetingAction } from "@/lib/api/meetings-actions";
import { MeetingDetailsModal } from "@/components/features/organizatii/MeetingDetailsModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { MentorMeetingFormModal } from "./MentorMeetingFormModal";
import { MentorReportUploadModal } from "./MentorReportUploadModal";

const STATUS_BADGES: Record<OngMeeting["status"], { label: string; bg: string; color: string }> = {
  programata: { label: "Programată", bg: "#eff6ff", color: "#2563eb" },
  efectuata: { label: "Efectuată", bg: "#f0fdf4", color: "#16a34a" },
  anulata: { label: "Anulată", bg: "#fef2f2", color: "#dc2626" },
};

const FORMAT_LABELS: Record<OngMeeting["format"], string> = {
  online: "Online",
  fata_in_fata: "Față în față",
};

function IconButton({
  icon,
  label,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <span className="group/action relative inline-flex">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border hover:bg-slate-50 focus:bg-slate-50 transition-colors"
        style={{ color }}
      >
        {icon}
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-semibold text-white opacity-0 scale-95 transition-[opacity,transform] duration-150 ease-out group-hover/action:opacity-100 group-hover/action:scale-100 group-focus-within/action:opacity-100 group-focus-within/action:scale-100 z-10"
        style={{ background: "#162040" }}
      >
        {label}
      </span>
    </span>
  );
}

export function MentorMeetingsTable({
  meetings,
  dimensions,
  ongs,
}: {
  meetings: OngMeeting[];
  dimensions: Dimension[];
  ongs: MentorOng[];
}) {
  const [openMeetingId, setOpenMeetingId] = useState<string | null>(null);
  const [editMeetingId, setEditMeetingId] = useState<string | null>(null);
  const [cancelMeetingId, setCancelMeetingId] = useState<string | null>(null);
  const [completeMeetingId, setCompleteMeetingId] = useState<string | null>(null);
  const [reportMeetingId, setReportMeetingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const openMeeting = meetings.find((meeting) => meeting.documentId === openMeetingId) ?? null;
  const editMeeting = meetings.find((meeting) => meeting.documentId === editMeetingId) ?? null;
  const reportMeeting = meetings.find((meeting) => meeting.documentId === reportMeetingId) ?? null;

  const handleCancel = () => {
    if (!cancelMeetingId) return;
    setActionError(null);
    startTransition(async () => {
      const result = await cancelMentorMeetingAction(cancelMeetingId);
      if (result.error) {
        setActionError(result.error);
        return;
      }
      setCancelMeetingId(null);
      toast.success("Întâlnirea a fost anulată.");
    });
  };

  const handleComplete = () => {
    if (!completeMeetingId) return;
    setActionError(null);
    startTransition(async () => {
      const result = await completeMentorMeetingAction(completeMeetingId);
      if (result.error) {
        setActionError(result.error);
        return;
      }
      setCompleteMeetingId(null);
      toast.success("Întâlnirea a fost marcată ca efectuată.");
    });
  };

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
            {["ONG", "Data și ora", "Format", "Status", "Program", "Rapoarte", "Acțiuni"].map((h) => (
              <th
                key={h}
                className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                style={{ color: "#94a3b8" }}
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
                <td className="px-5 py-3.5 font-semibold whitespace-nowrap" style={{ color: "#162040" }}>
                  {meeting.ong?.name ?? "—"}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap" style={{ color: "#64748b" }}>
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
                  <div className="flex items-center gap-1.5">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: statusBadge.bg, color: statusBadge.color }}
                    >
                      {statusBadge.label}
                    </span>
                    {meeting.status === "programata" && (
                      <button
                        type="button"
                        onClick={() => {
                          setActionError(null);
                          setCompleteMeetingId(meeting.documentId);
                        }}
                        title="Marchează efectuată"
                        aria-label="Marchează efectuată"
                        className="inline-flex items-center justify-center h-6 w-6 rounded-full border hover:bg-[#16a34a]/10 transition-colors shrink-0"
                        style={{ borderColor: "#16a34a" }}
                      >
                        <Check size={12} style={{ color: "#16a34a" }} strokeWidth={2} />
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap" style={{ color: "#64748b" }}>
                  {meeting.program?.name ?? "—"}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  {meeting.status !== "efectuata" ? (
                    <span style={{ color: "#94a3b8" }}>—</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      {fileUrl && (
                        <a
                          href={fileUrl}
                          download={meeting.report?.name}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-slate-50 transition-colors"
                          style={{ color: "#334155" }}
                        >
                          <Download size={13} /> Descarcă
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setReportMeetingId(meeting.documentId)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-opacity"
                        style={{ background: "#f97316" }}
                      >
                        <FileUp size={13} /> {fileUrl ? "Înlocuiește" : "Adaugă raport"}
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <IconButton
                      icon={<Info size={15} />}
                      label="Detalii"
                      color="#334155"
                      onClick={() => setOpenMeetingId(meeting.documentId)}
                    />
                    {meeting.status === "programata" && (
                      <>
                        <IconButton
                          icon={<Pencil size={15} />}
                          label="Editează"
                          color="#334155"
                          onClick={() => setEditMeetingId(meeting.documentId)}
                        />
                        <IconButton
                          icon={<XCircle size={15} />}
                          label="Anulează"
                          color="#dc2626"
                          onClick={() => {
                            setActionError(null);
                            setCancelMeetingId(meeting.documentId);
                          }}
                        />
                      </>
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
          ongName={openMeeting.ong?.name ?? "—"}
          dimensions={dimensions}
          onClose={() => setOpenMeetingId(null)}
          onEdit={
            openMeeting.status === "programata"
              ? () => {
                  setOpenMeetingId(null);
                  setEditMeetingId(openMeeting.documentId);
                }
              : undefined
          }
        />
      )}

      <MentorMeetingFormModal
        open={editMeeting !== null}
        onClose={() => setEditMeetingId(null)}
        ongs={ongs}
        dimensions={dimensions}
        meeting={editMeeting ?? undefined}
      />

      {reportMeeting && (
        <MentorReportUploadModal
          open
          meetingDocumentId={reportMeeting.documentId}
          replacing={Boolean(reportMeeting.report)}
          onClose={() => setReportMeetingId(null)}
        />
      )}

      <ConfirmDialog
        open={cancelMeetingId !== null}
        title="Anulează întâlnirea"
        description="Ești sigur că vrei să anulezi această întâlnire? Acțiunea nu poate fi anulată."
        confirmLabel="Anulează întâlnirea"
        loading={isPending}
        loadingLabel="Se anulează..."
        error={actionError}
        onConfirm={handleCancel}
        onCancel={() => setCancelMeetingId(null)}
      />

      <ConfirmDialog
        open={completeMeetingId !== null}
        title="Marchează ca efectuată"
        description="Confirmi că această întâlnire a avut loc? Va deveni disponibilă pentru încărcarea raportului."
        confirmLabel="Marchează efectuată"
        confirmVariant="accent"
        loading={isPending}
        loadingLabel="Se salvează..."
        error={actionError}
        onConfirm={handleComplete}
        onCancel={() => setCompleteMeetingId(null)}
      />
    </div>
  );
}
