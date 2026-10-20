import type { EvaluationLock, OngMember } from "@/lib/api/reports";
import { StartIndependentEvaluationButton } from "./StartIndependentEvaluationButton";

/**
 * Counterpart of `ActiveEvaluationBanner` for an ONG with nothing in progress:
 * invites the admin to start an independent evaluation. The button carries the
 * same BR-19 lock as the one on the history tab, so an open program phase
 * still sends them to the program page instead.
 */
export function NoActiveEvaluationBanner({
  ongMembers,
  lock,
}: {
  ongMembers: OngMember[];
  lock: EvaluationLock | null;
}) {
  return (
    <div
      className="rounded-2xl p-6 mb-8 flex flex-wrap items-center justify-between gap-4"
      style={{ background: "#1c1c81" }}
    >
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-2"
          style={{ color: "#00d495" }}
        >
          Nicio evaluare activă
        </p>
        <p className="text-sm text-white/80 max-w-xl">
          Nu ai nicio evaluare activă în acest moment. Dacă vrei să începi una, o poți face de aici.
        </p>
      </div>
      <StartIndependentEvaluationButton ongMembers={ongMembers} lock={lock} />
    </div>
  );
}
