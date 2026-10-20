import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { serverApiFetch } from "@/lib/api/server";
import type { MyOng } from "@/lib/api/evaluations";
import { PendingEvaluationsBanner } from "@/components/features/dashboard-member/PendingEvaluationsBanner";

export default async function MemberOngsPage() {
  const res = await serverApiFetch<{ data: MyOng[] }>("/api/me/ongs");
  const ongs = res.data;
  const ongsWithPending = ongs.filter(
    (ong): ong is MyOng & { pendingEvaluation: NonNullable<MyOng["pendingEvaluation"]> } =>
      ong.pendingEvaluation !== null,
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-extrabold" style={{ color: "#1c1c81" }}>
          Toate ONG-urile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Organizațiile din care faci parte ca membru.
        </p>
      </div>

      <PendingEvaluationsBanner ongs={ongsWithPending} />

      {ongs.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">Nu faci parte din nicio organizație încă.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ongs.map((ong) => {
            const initial = ong.name.trim().charAt(0).toUpperCase() || "?";
            const activeProgram = ong.programs.find((program) => program.programStatus === "Active");
            return (
              <Link
                key={ong.documentId}
                href={`/dashboard/${ong.documentId}`}
                className="bg-white rounded-2xl border border-border p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold text-white shrink-0"
                      style={{ background: "#1c1c81" }}
                    >
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "#1c1c81" }}>
                        {ong.name}
                      </p>
                      <p className="text-xs text-muted-foreground">CUI: {ong.cui}</p>
                    </div>
                  </div>
                  {ong.pendingEvaluation && (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0"
                      style={{ background: "#fefce8", color: "#a16207" }}
                    >
                      <Clock size={11} /> Evaluare în așteptare
                    </span>
                  )}
                </div>

                {ong.domeniuActivitate && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#5b6779" }}>
                      Domeniu
                    </p>
                    <p className="text-sm font-semibold" style={{ color: "#1c1c81" }}>
                      {ong.domeniuActivitate}
                    </p>
                  </div>
                )}

                {activeProgram && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#5b6779" }}>
                      Program
                    </p>
                    <span
                      className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: "#e5f9e5", color: "#007d58" }}
                    >
                      {activeProgram.name}
                    </span>
                  </div>
                )}

                <div className="flex justify-end">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "#007d58" }}>
                    Selectează <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
