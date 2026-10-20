import Link from "next/link";
import type { MyOng } from "@/lib/api/evaluations";

type OngWithPendingEvaluation = MyOng & {
  pendingEvaluation: NonNullable<MyOng["pendingEvaluation"]>;
};

/**
 * The "Evaluare în așteptare" notice on the member's Dashboard landing page
 * ("Toate ONG-urile") — the one screen every login lands on, so a pending
 * evaluation surfaces here instead of only after picking an organization.
 * Mirrors `PendingEvaluationBanner`'s copy/styling, adapted to span every
 * organization the member belongs to instead of just one.
 */
export function PendingEvaluationsBanner({ ongs }: { ongs: OngWithPendingEvaluation[] }) {
  if (ongs.length === 0) return null;

  const single = ongs.length === 1 ? ongs[0] : null;
  const started = single ? single.pendingEvaluation.status !== "neinceput" : false;

  return (
    <div
      className="rounded-2xl p-6 mb-6 flex items-center justify-between gap-4 flex-wrap"
      style={{ background: "#1c1c81" }}
    >
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-2"
          style={{ color: "#00d495" }}
        >
          Evaluare în așteptare
        </p>
        <p className="text-sm text-white/80 max-w-xl">
          {single
            ? started
              ? `Ai o evaluare începută la ${single.name}. Reia evaluarea de unde ai rămas pentru a o finaliza.`
              : `Ai fost adăugat de ${single.name} în procesul de evaluare organizațională. Dă click pe butonul de pornire pentru a începe.`
            : `Ai evaluări în așteptare la ${ongs.length} organizații: ${ongs
                .map((ong) => ong.name)
                .join(", ")}.`}
        </p>
      </div>
      {single && (
        <Link
          href={`/dashboard/${single.documentId}/evaluari/${single.pendingEvaluation.documentId}`}
          className="shrink-0 inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:brightness-90 transition-opacity"
          style={{
            background: "#00d495",
            boxShadow: "0 4px 16px rgba(0,212,149,0.3)",
          }}
        >
          {started ? "Continuă evaluarea" : "Pornește evaluarea"}
        </Link>
      )}
    </div>
  );
}
