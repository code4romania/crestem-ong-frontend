import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";
import type { OngDashboard } from "@/lib/api/dashboard";
import {
  PROGRAM_STATUS_CLASSES,
  PROGRAM_STATUS_LABELS,
  programStatusOf,
} from "@/lib/utils/program-status";

export function RecentProgramsCard({
  programs,
}: {
  programs: OngDashboard["recentPrograms"];
}) {
  return (
    <section className="bg-background rounded-xl border border-border p-5">
      <div className="flex items-center justify-between gap-4 mb-2">
        <h2 className="font-heading font-bold text-primary">Programe recente</h2>
        <Link
          href="/dashboard/programe"
          className="text-sm font-semibold text-accent-strong hover:underline"
        >
          Vezi toate →
        </Link>
      </div>

      {programs.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Organizația ta nu participă încă la niciun program.
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
                <span className="text-sm text-primary truncate">{program.name}</span>
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
