import Link from "next/link";
import { ExternalLink, Layers, Users } from "lucide-react";
import type { MentorProgram } from "@/lib/api/meetings";
import { formatShortDate } from "@/lib/utils/date";
import { PROGRAM_STATUS_CLASSES, PROGRAM_STATUS_LABELS } from "@/lib/utils/program-status";

const STATUS_BAR_CLASSES: Record<MentorProgram["programStatus"], string> = {
  Upcoming: "bg-status-upcoming-foreground",
  Active: "bg-status-active-foreground",
  Finished: "bg-status-finished-foreground",
};

function DateField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-bold" style={{ color: "#1c1c81" }}>
        {value}
      </p>
    </div>
  );
}

export function MentorProgramCard({ program }: { program: MentorProgram }) {
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <div className={`h-1.5 ${STATUS_BAR_CLASSES[program.programStatus]}`} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-border">
        <div className="flex items-center gap-3 min-w-0">
          <span
            aria-hidden="true"
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${PROGRAM_STATUS_CLASSES[program.programStatus]}`}
          >
            <Layers size={20} />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-heading font-extrabold truncate" style={{ color: "#1c1c81" }}>
                {program.name}
              </h3>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${PROGRAM_STATUS_CLASSES[program.programStatus]}`}
              >
                {PROGRAM_STATUS_LABELS[program.programStatus]}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">FDSC — Fundația pentru Dezvoltarea Societății Civile</p>
          </div>
        </div>

        <div className="flex items-center gap-6 shrink-0">
          <DateField label="Data început" value={formatShortDate(program.startDate)} />
          <div className="w-px self-stretch bg-border" />
          <DateField label="Data sfârșit" value={formatShortDate(program.endDate)} />
        </div>
      </div>

      {program.ongs.length === 0 ? (
        <p className="px-6 py-6 text-sm text-muted-foreground">
          Nu ai nicio organizație alocată în acest program.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {["Denumire ONG", "Utilizatori afiliați", "Persoană de contact", ""].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: "#5b6779" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {program.ongs.map((ong) => (
                <tr key={ong.documentId} className="border-t border-border">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        aria-hidden="true"
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-secondary"
                      >
                        <Users size={14} className="text-[#5b6779]ccent-strong" />
                      </span>
                      <span className="font-semibold truncate" style={{ color: "#1c1c81" }}>
                        {ong.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5" style={{ color: "#334155" }}>
                      <Users size={14} className="text-muted-foreground" />
                      <span className="font-semibold">{ong.memberCount}</span> utilizatori
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    {ong.admin ? (
                      <div className="min-w-0">
                        <p className="font-semibold truncate" style={{ color: "#1c1c81" }}>
                          {ong.admin.nume}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{ong.admin.email}</p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-right whitespace-nowrap">
                    <Link
                      href={`/dashboard/organizatii/${ong.documentId}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border hover:bg-slate-50 transition-colors"
                      style={{ color: "#475569" }}
                    >
                      <ExternalLink size={12} />
                      Vezi ONG
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
