import Link from "next/link";
import { CheckCircle2, Clock, Layers } from "lucide-react";
import type { MentorDashboard } from "@/lib/api/dashboard";
import { formatDate } from "@/lib/utils/date";
import {
  PROGRAM_STATUS_CLASSES,
  PROGRAM_STATUS_LABELS,
  programStatusOf,
} from "@/lib/utils/program-status";

export function CurrentProgramsCard({
  programs,
}: {
  programs: MentorDashboard["currentPrograms"];
}) {
  return (
    <section className="bg-background rounded-xl border border-border p-5">
      <div className="flex items-center justify-between gap-4 mb-2">
        <h2 className="font-heading font-bold text-primary">Programele mele curente</h2>
        <Link
          href="/dashboard/programe"
          className="text-sm font-semibold text-accent-strong hover:underline"
        >
          Vezi detalii →
        </Link>
      </div>

      {programs.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Nu ești alocat niciunui program activ.
        </p>
      ) : (
        <ul>
          {programs.map((program) => {
            const status = programStatusOf(program.programStatus);
            const Icon = status === "Finished" ? CheckCircle2 : Clock;
            return (
              <li
                key={program.documentId}
                className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-b-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    aria-hidden="true"
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-secondary"
                  >
                    <Layers size={16} className="text-accent-strong" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-primary truncate">
                      {program.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(program.startDate)} – {formatDate(program.endDate)}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${PROGRAM_STATUS_CLASSES[status]}`}
                >
                  <Icon size={12} aria-hidden="true" />
                  {PROGRAM_STATUS_LABELS[status]}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
