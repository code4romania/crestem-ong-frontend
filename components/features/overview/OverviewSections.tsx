import { getProgramOverviewStats } from "@/lib/api/reports";
import type { ProgramRound } from "@/lib/api/reports";
import type { AssignedMentor } from "@/lib/api/programs";
import { formatLongDate } from "@/lib/utils/date";
import { OverviewStatCard } from "./OverviewStatCard";
import { OverviewMentorCard } from "./OverviewMentorCard";
import { OverviewToolsSection } from "./OverviewToolsSection";

interface OverviewSectionsProps {
  /** The program the counters describe, or null when the ONG is in none. */
  round: ProgramRound | null;
  mentors: AssignedMentor[];
  /**
   * "Total sesiuni de evaluare" — the number of the organization's rounds.
   * Unused when `showEvaluationCounters` is false.
   */
  totalSessions?: number;
  historyHref?: string;
  /** Where "Vezi evaluare curentă" goes, or null to drop the link. */
  currentEvaluationHref?: string | null;
  /**
   * The evaluation and mentoring counters ("Total sesiuni de evaluare",
   * "Evaluare curentă", "Număr de sesiuni de mentorat"). The ngo-member
   * overview hides them and keeps only the program cards.
   */
  showEvaluationCounters?: boolean;
  showMentorMessage: boolean;
}

export function OverviewSections({
  round,
  mentors,
  totalSessions = 0,
  historyHref = "",
  currentEvaluationHref = null,
  showEvaluationCounters = true,
  showMentorMessage,
}: OverviewSectionsProps) {
  const stats = round ? getProgramOverviewStats(round) : null;

  return (
    <div>
      <section className="mb-10">
        <h1 className="text-2xl font-heading font-extrabold text-primary mb-4">
          Informații Organizație
        </h1>

        {!round || !stats ? (
          <div className="bg-white rounded-xl border border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Organizația ta nu participă momentan la niciun program activ.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {showEvaluationCounters && (
              <>
                <OverviewStatCard
                  label="Total sesiuni de evaluare"
                  value={totalSessions}
                  link={{ href: historyHref, label: "Vezi istoric evaluări" }}
                />
                <OverviewStatCard
                  label="Evaluare curentă"
                  value={
                    stats.currentReport
                      ? `${stats.currentReport.completedCount} / ${stats.currentReport.invitedCount}`
                      : "—"
                  }
                  caption={stats.currentReport ? "completări" : undefined}
                  link={
                    stats.currentReport && currentEvaluationHref
                      ? { href: currentEvaluationHref, label: "Vezi evaluare curentă" }
                      : undefined
                  }
                />
                {/* No mentoring-session model exists yet — the card holds its place at 0. */}
                <OverviewStatCard label="Număr de sesiuni de mentorat" value={0} />
              </>
            )}
            {/* E-learning: module not implemented yet, hidden until it ships. */}
            {/* <OverviewStatCard label="E-Learning" value="0 cursuri active" size="text" /> */}
            <OverviewStatCard label="Program" value={round.program.name} size="text" />
            <OverviewStatCard
              label="Data finalizare evaluare"
              value={formatLongDate(stats.evaluationEndDate)}
              size="text"
            />
          </div>
        )}
      </section>

      {mentors.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-heading font-extrabold text-primary mb-4">Mentori curenți</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {mentors.map((mentor) => (
              <OverviewMentorCard
                key={mentor.documentId}
                mentor={mentor}
                showMessage={showMentorMessage}
              />
            ))}
          </div>
        </section>
      )}

      <OverviewToolsSection />
    </div>
  );
}
