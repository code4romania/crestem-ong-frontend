"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { Dimension } from "@/lib/api/dimensions";
import type { EvaluationDetail } from "@/lib/api/evaluations";
import { finalizeEvaluationAction, saveEvaluationDimensionAction } from "@/lib/api/evaluations-actions";
import { DimensionStep } from "./DimensionStep";
import { EvaluationReview } from "./EvaluationReview";
import { EvaluationResults } from "./EvaluationResults";

const INTRO_COPY =
  "Matricea de dezvoltare organizațională este ca o radiografie care arată nevoile, punctele tari și " +
  "oportunitățile de îmbunătățire ale organizației tale, din 10 perspective: Guvernanță, Aspecte financiare, " +
  "Managementul informației, Monitorizare și evaluare, Structură organizațională, Leadership, Managementul " +
  "resurselor umane, Implicarea persoanelor beneficiare, Advocacy și parteneriate, Comunicare externă. În mod " +
  "ideal, vei fi completată de toate persoanele care lucrează în organizație — astfel încât rezultatele să " +
  "includă perspectivele cât mai diverse.";

const INTRO_CHECKLIST = [
  {
    emoji: "⏱️",
    title: "Timp și concentrare",
    description:
      "Va dura aprox. 20–40 de minute pentru a completa chestionarul într-un mod atent. Rezervă-ți acest timp. " +
      "Îți recomandăm să citești întrebările cu atenție și să răspunzi în mod real, nu în mod ideal.",
  },
  {
    emoji: "👤",
    title: "Este un exercițiu individual",
    description:
      "Avem nevoie de perspectiva ta personală asupra organizației. Trebuie să răspunzi conform " +
      "cunoștințelor/experiențelor voastre atunci.",
  },
  {
    emoji: "✅",
    title: "Răspunde sincer",
    description:
      "Scopul acestei analize este de a identifica oportunitățile de îmbunătățire. Pentru a putea face asta, " +
      "este important să îți dai seama cât mai real de situația actuală a organizației, din perspectiva ta.",
  },
  {
    emoji: "💬",
    title: "Dacă ai dubii, întreabă",
    description:
      "În cazul în care o întrebare sau un termen nu îți sunt clare, contactează-ne sau folosiți funcția de " +
      "chat, nu ezita să ne ceri să clarificăm.",
  },
  {
    emoji: "🕐",
    title: "Încadrează-te în termenul limitat",
    description:
      "Există un termen limitat de completare a chestionarului pentru toți membrii organizației. Asigură-te că " +
      "te încadrezi la timp pentru a nu rata momentul.",
  },
];

export function EvaluationWizard({
  ongDocumentId,
  evaluationDocumentId,
  dimensions,
  initialEvaluation,
}: {
  ongDocumentId: string;
  evaluationDocumentId: string;
  dimensions: Dimension[];
  initialEvaluation: EvaluationDetail;
}) {
  const router = useRouter();
  const [evaluation, setEvaluation] = useState(initialEvaluation);
  const [wasAlreadyComplete] = useState(initialEvaluation.completedAt != null);
  const [entered, setEntered] = useState(false);
  const [reviewDimensionKey, setReviewDimensionKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<"dimension" | "draft" | "finalize" | null>(null);
  const [isPending, startTransition] = useTransition();

  const backHref = `/dashboard/${ongDocumentId}`;
  const currentKey = evaluation.progress.nextDimension;
  const closedEarly = Boolean(evaluation.report?.finished) && !evaluation.completedAt;
  const hasStarted = evaluation.progress.completedDimensions.length > 0 || evaluation.progress.draftDimensions.length > 0;
  const blockByKey = new Map(evaluation.dimensions.map((block) => [block.dimensionKey, block]));

  const submitDimension = (
    dimensionKey: string,
    input: { comment: string; quiz: { questionId: string; answer: number }[] },
    onSaved?: () => void,
  ) => {
    setError(null);
    setActiveAction("dimension");
    startTransition(async () => {
      const result = await saveEvaluationDimensionAction(evaluationDocumentId, {
        dimensionKey,
        submit: true,
        ...input,
      });
      setActiveAction(null);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.data) {
        setEvaluation(result.data);
        onSaved?.();
      }
    });
  };

  const saveDraft = (
    dimensionKey: string,
    input: { comment: string; quiz: { questionId: string; answer: number }[] },
  ) => {
    setError(null);
    setActiveAction("draft");
    startTransition(async () => {
      const result = await saveEvaluationDimensionAction(evaluationDocumentId, {
        dimensionKey,
        submit: false,
        ...input,
      });
      setActiveAction(null);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Progresul a fost salvat ca draft. Poți continua mai târziu.");
      router.push(backHref);
    });
  };

  const saveDraftAndReturn = (
    dimensionKey: string,
    input: { comment: string; quiz: { questionId: string; answer: number }[] },
  ) => {
    setError(null);
    setActiveAction("draft");
    startTransition(async () => {
      const result = await saveEvaluationDimensionAction(evaluationDocumentId, {
        dimensionKey,
        submit: false,
        ...input,
      });
      setActiveAction(null);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      if (result.data) {
        setEvaluation(result.data);
      }
      toast.success("Progresul a fost salvat ca draft.");
      setEntered(false);
    });
  };

  const finalize = () => {
    setError(null);
    setActiveAction("finalize");
    startTransition(async () => {
      const result = await finalizeEvaluationAction(evaluationDocumentId);
      setActiveAction(null);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.data) {
        setEvaluation(result.data);
      }
    });
  };

  if (closedEarly) {
    return (
      <div className="bg-white rounded-xl border border-border p-8 text-center">
        <p className="text-sm mb-4" style={{ color: "#ef4444" }}>
          Runda de evaluare a fost închisă înainte să o finalizezi.
        </p>
        <Link href={backHref} className="text-sm font-semibold hover:underline" style={{ color: "#2dbe8f" }}>
          Înapoi la evaluările mele
        </Link>
      </div>
    );
  }

  if (evaluation.completedAt && wasAlreadyComplete) {
    return <EvaluationResults evaluation={evaluation} dimensions={dimensions} backHref={backHref} />;
  }

  if (evaluation.completedAt) {
    return (
      <div className="bg-white rounded-xl border border-border p-10 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: "#f0faf6" }}
        >
          <CheckCircle2 size={28} style={{ color: "#2dbe8f" }} />
        </div>
        <h2 className="text-xl font-heading font-extrabold mb-2" style={{ color: "#162040" }}>
          Evaluare finalizată!
        </h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          Mulțumim pentru completarea evaluării organizaționale. Răspunsurile tale au fost trimise. Vei primi un
          raport detaliat după ce toți membrii echipei finalizează procesul.
        </p>
        <Link
          href={backHref}
          className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ background: "#162040" }}
        >
          Înapoi la evaluările mele
        </Link>
      </div>
    );
  }

  if (!entered) {
    return (
      <div>
        <h1 className="text-2xl font-heading font-extrabold mb-4" style={{ color: "#162040" }}>
          Începe evaluarea
        </h1>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: "#475569" }}>
          {INTRO_COPY}
        </p>

        <h2 className="text-lg font-heading font-bold mb-4" style={{ color: "#162040" }}>
          Ce trebuie să știi înainte să începi analiza?
        </h2>

        <div className="space-y-3 mb-6">
          {INTRO_CHECKLIST.map((item) => (
            <div key={item.title} className="bg-white rounded-2xl border border-border p-5 flex items-start gap-4">
              <div className="w-9 h-9 flex items-center justify-center shrink-0 text-lg leading-none">{item.emoji}</div>
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: "#162040" }}>
                  {item.title}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}

          <div className="bg-white rounded-2xl border border-border p-5">
            <p className="text-sm font-semibold mb-1" style={{ color: "#162040" }}>
              Rezultatele analizei
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
              Când toate persoanele din organizație finalizează chestionarul, vei primi disponibil pe platformă un
              raport detaliat cu analiza individuală a răspunsurilor și o recomandare pentru fiecare arie de
              îmbunătățire în parte.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setEntered(true)}
          className="inline-flex items-center px-6 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ background: "#2dbe8f", boxShadow: "0 4px 16px rgba(45,190,143,0.3)" }}
        >
          {hasStarted ? "Continuă evaluarea" : "Începe evaluarea"}
        </button>
      </div>
    );
  }

  const missingDimensionFallback = (
    <div className="bg-white rounded-xl border border-border p-8 text-center">
      <p className="text-sm mb-4" style={{ color: "#ef4444" }}>
        Nu am putut determina dimensiunea următoare.
      </p>
      <Link href={backHref} className="text-sm font-semibold hover:underline" style={{ color: "#2dbe8f" }}>
        Înapoi la evaluările mele
      </Link>
    </div>
  );

  if (reviewDimensionKey) {
    const reviewIndex = dimensions.findIndex((dimension) => dimension.key === reviewDimensionKey);
    const reviewDimension = dimensions[reviewIndex];
    if (!reviewDimension) return missingDimensionFallback;
    return (
      <DimensionStep
        key={reviewDimension.key}
        dimension={reviewDimension}
        dimensionIndex={reviewIndex}
        totalDimensions={dimensions.length}
        block={blockByKey.get(reviewDimension.key)}
        saving={isPending && activeAction === "dimension"}
        savingDraft={isPending && activeAction === "draft"}
        error={error}
        backLabel="Înapoi la verificare"
        submitLabel="Salvează modificările"
        savingLabel="Se salvează..."
        showSubmitIcon={false}
        onBack={() => setReviewDimensionKey(null)}
        onSubmit={(input) => submitDimension(reviewDimension.key, input, () => setReviewDimensionKey(null))}
        onSaveDraft={(input) => saveDraft(reviewDimension.key, input)}
      />
    );
  }

  if (evaluation.progress.complete) {
    return (
      <EvaluationReview
        dimensions={dimensions}
        blockByKey={blockByKey}
        saving={isPending && activeAction === "finalize"}
        error={error}
        onEditDimension={setReviewDimensionKey}
        onFinalize={finalize}
      />
    );
  }

  const dimensionIndex = dimensions.findIndex((dimension) => dimension.key === currentKey);
  const currentDimension = dimensions[dimensionIndex];
  if (!currentDimension) return missingDimensionFallback;
  const isLastDimension = dimensionIndex === dimensions.length - 1;

  return (
    <DimensionStep
      key={currentDimension.key}
      dimension={currentDimension}
      dimensionIndex={dimensionIndex}
      totalDimensions={dimensions.length}
      block={blockByKey.get(currentDimension.key)}
      saving={isPending && activeAction === "dimension"}
      savingDraft={isPending && activeAction === "draft"}
      error={error}
      submitLabel={isLastDimension ? "Finalizează evaluarea" : "Dimensiunea următoare"}
      showSubmitIcon={!isLastDimension}
      onBack={() => setEntered(false)}
      onSubmit={(input) => submitDimension(currentDimension.key, input)}
      onSaveDraft={(input) => saveDraft(currentDimension.key, input)}
      onSaveDraftAndBack={(input) => saveDraftAndReturn(currentDimension.key, input)}
    />
  );
}
