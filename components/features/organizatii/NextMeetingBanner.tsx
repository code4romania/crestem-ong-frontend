import { Calendar } from "lucide-react";
import { formatMeetingDateTime } from "@/lib/utils/date";
import type { OngMeeting } from "@/lib/api/meetings";

const FORMAT_LABELS: Record<OngMeeting["format"], string> = {
  online: "Online",
  fata_in_fata: "Față în față",
};

/**
 * `primaryLabel` names "the other party" for the meeting — the ONG on the
 * mentor's own view, the mentor (persoană resursă) on the ngo-admin's view.
 */
export function NextMeetingBanner({
  meeting,
  primaryLabel,
}: {
  meeting: OngMeeting;
  primaryLabel: string;
}) {
  return (
    <div
      className="rounded-2xl p-6 mb-6 flex flex-wrap items-center justify-between gap-4"
      style={{ background: "#1c1c81" }}
    >
      <div className="flex items-center gap-4">
        <div
          className="flex items-center justify-center h-11 w-11 rounded-xl shrink-0"
          style={{ background: "#00d495" }}
        >
          <Calendar size={20} className="text-white" />
        </div>
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-1"
            style={{ color: "#00d495" }}
          >
            Următoarea întâlnire
          </p>
          <p className="font-heading font-bold text-white">{primaryLabel}</p>
          <p className="text-sm" style={{ color: "#cbd5e1" }}>
            {meeting.subiect}
          </p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-white font-semibold whitespace-nowrap">
          {formatMeetingDateTime(meeting.dataOra)}
        </p>
        <span
          className="inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{ background: "rgba(255,255,255,0.1)", color: "#fff" }}
        >
          {FORMAT_LABELS[meeting.format]}
        </span>
      </div>
    </div>
  );
}
