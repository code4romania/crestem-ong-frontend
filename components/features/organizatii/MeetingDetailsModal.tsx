"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { formatMeetingDateTime } from "@/lib/utils/date";
import type { OngMeeting } from "@/lib/api/meetings";
import type { Dimension } from "@/lib/api/dimensions";
import { ModalOverlay } from "@/components/ui/ModalOverlay";

const STATUS_LABELS: Record<OngMeeting["status"], string> = {
  programata: "Programată",
  efectuata: "Efectuată",
  anulata: "Anulată",
};

const FORMAT_LABELS: Record<OngMeeting["format"], string> = {
  online: "Online",
  fata_in_fata: "Față în față",
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#5b6779" }}>
        {label}
      </p>
      <div className="text-sm" style={{ color: "#1c1c81" }}>
        {children}
      </div>
    </div>
  );
}

export function MeetingDetailsModal({
  meeting,
  ongName,
  dimensions,
  onClose,
  onEdit,
}: {
  meeting: OngMeeting;
  ongName: string;
  dimensions: Dimension[];
  onClose: () => void;
  onEdit?: () => void;
}) {
  const dimensionNames = meeting.dimensiuni.map(
    (key) => dimensions.find((dimension) => dimension.key === key)?.name ?? key,
  );

  return (
    <ModalOverlay labelledBy="meeting-details-title">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4">
          <h2
            id="meeting-details-title"
            className="font-heading font-extrabold text-lg"
            style={{ color: "#1c1c81" }}
          >
            Detalii întâlnire
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Închide"
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <Field label="ONG">{ongName}</Field>
            <Field label="Data">{formatMeetingDateTime(meeting.dataOra)}</Field>
            <Field label="Format">{FORMAT_LABELS[meeting.format]}</Field>
            <Field label="Status">{STATUS_LABELS[meeting.status]}</Field>
          </div>

          <Field label="Subiect">{meeting.subiect}</Field>

          {meeting.linkIntalnire && (
            <Field label="Link întâlnire">
              <a
                href={meeting.linkIntalnire}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: "#5656e5" }}
              >
                {meeting.linkIntalnire}
              </a>
            </Field>
          )}

          {meeting.activityType && <Field label="Tipul activității">{meeting.activityType.name}</Field>}

          {dimensionNames.length > 0 && (
            <Field label="Dimensiuni matrice">
              <div className="flex flex-wrap gap-2">
                {dimensionNames.map((name) => (
                  <span
                    key={name}
                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ background: "#e5f9e5", color: "#1c1c81" }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </Field>
          )}

          {meeting.comentarii && <Field label="Comentarii adiționale">{meeting.comentarii}</Field>}
        </div>

        {onEdit && meeting.status === "programata" && (
          <div className="px-6 py-4 border-t border-border flex justify-end">
            <button
              type="button"
              onClick={onEdit}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ background: "#1c1c81" }}
            >
              Editează
            </button>
          </div>
        )}
      </div>
    </ModalOverlay>
  );
}
