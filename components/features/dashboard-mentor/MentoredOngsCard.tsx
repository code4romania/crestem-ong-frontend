import { Building2, Layers } from "lucide-react";
import type { MentorDashboard } from "@/lib/api/dashboard";

export function MentoredOngsCard({
  mentoredOngs,
}: {
  mentoredOngs: MentorDashboard["mentoredOngs"];
}) {
  return (
    <section className="bg-background rounded-xl border border-border p-5">
      <h2 className="font-heading font-bold text-primary mb-2">
        Organizațiile mele mentorate
      </h2>

      {mentoredOngs.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Nu mentorezi nicio organizație în programele active.
        </p>
      ) : (
        <ul>
          {mentoredOngs.map(({ ong, program }) => (
            <li
              key={`${ong.documentId}-${program.documentId}`}
              className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-b-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  aria-hidden="true"
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-secondary"
                >
                  <Building2 size={16} className="text-accent" />
                </span>
                <p className="text-sm font-semibold text-primary truncate">
                  {ong.name}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 bg-secondary text-muted-foreground">
                <Layers size={12} aria-hidden="true" />
                {program.name}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
