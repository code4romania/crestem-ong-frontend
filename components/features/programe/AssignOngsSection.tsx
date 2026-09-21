"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  ArrowLeft,
  Building2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  assignOngAction,
  assignOngMentorAction,
  assignPhaseEvaluationAction,
  removeOngAction,
  removeOngMentorAction,
  removePhaseEvaluationAction,
} from "@/lib/api/programs-actions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";
import { listOngEvaluations, type OngEvaluation } from "@/lib/api/ongs";
import type { AssignedMentor, AssignedOng, PhaseEvaluation } from "@/lib/api/programs";
import { isRetras } from "@/lib/api/ongs";
import type { ActiveOng } from "@/lib/api/ongs";
import { DeletedAccountBadge } from "@/components/ui/DeletedAccountBadge";

function formatEvalPeriod(evaluation: OngEvaluation) {
  const start = new Date(evaluation.createdAt).toLocaleDateString("ro-RO", {
    month: "short",
    year: "numeric",
  });
  if (!evaluation.finishedAt) {
    return `${start} – prezent`;
  }
  const end = new Date(evaluation.finishedAt).toLocaleDateString("ro-RO", {
    month: "short",
    year: "numeric",
  });
  return `${start} – ${end}`;
}

export function AssignOngsSection({
  programId,
  assigned,
  activeOngs,
  evaluationPhases,
  entryPhaseId,
  assignedMentors,
  readOnly = false,
}: {
  programId: string;
  assigned: AssignedOng[];
  activeOngs: ActiveOng[];
  evaluationPhases: { documentId: string; title: string }[];
  entryPhaseId: string | null;
  assignedMentors: AssignedMentor[];
  readOnly?: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [pendingRemove, setPendingRemove] = useState<AssignedOng | null>(null);
  const [isPending, startTransition] = useTransition();

  const [expandedOngId, setExpandedOngId] = useState<string | null>(null);
  const [mentorSearch, setMentorSearch] = useState("");
  const [mentorError, setMentorError] = useState<string | null>(null);
  const [mentorPending, startMentorTransition] = useTransition();

  const [expandedEvalOngId, setExpandedEvalOngId] = useState<string | null>(null);
  const [phaseEvalPending, startPhaseEvalTransition] = useTransition();
  const [assignPhaseError, setAssignPhaseError] = useState<string | null>(null);
  const [removeEvalError, setRemoveEvalError] = useState<string | null>(null);
  const [pendingRemoveEval, setPendingRemoveEval] = useState<{
    ongDocumentId: string;
    ongName: string;
    phaseTitle: string;
    phaseDocumentId: string;
  } | null>(null);

  const [assigningPhase, setAssigningPhase] = useState<{ ongDocumentId: string; phaseDocumentId: string } | null>(
    null,
  );
  const [phaseEvalSearch, setPhaseEvalSearch] = useState("");
  const [phaseEvalOptions, setPhaseEvalOptions] = useState<OngEvaluation[]>([]);
  const [loadingPhaseEvalOptions, setLoadingPhaseEvalOptions] = useState(false);
  const [phaseEvalOptionsError, setPhaseEvalOptionsError] = useState<string | null>(null);
  const [selectedPhaseEvalOptionId, setSelectedPhaseEvalOptionId] = useState<string>("");

  const [pendingOng, setPendingOng] = useState<ActiveOng | null>(null);
  const [evalSearch, setEvalSearch] = useState("");
  const [selectedEvalId, setSelectedEvalId] = useState<string>("");
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>("");
  const [evaluations, setEvaluations] = useState<OngEvaluation[]>([]);
  const [loadingEvaluations, setLoadingEvaluations] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);

  const defaultPhaseId =
    (entryPhaseId && evaluationPhases.some((phase) => phase.documentId === entryPhaseId)
      ? entryPhaseId
      : evaluationPhases[0]?.documentId) ?? "";

  const assignedIds = useMemo(() => new Set(assigned.map((ong) => ong.documentId)), [assigned]);
  const candidates = useMemo(
    () =>
      activeOngs.filter(
        (ong) =>
          !assignedIds.has(ong.documentId) &&
          ong.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [activeOngs, assignedIds, search],
  );

  const filteredEvaluations = useMemo(
    () => evaluations.filter((evaluation) => evaluation.name.toLowerCase().includes(evalSearch.toLowerCase())),
    [evaluations, evalSearch],
  );

  const mentorCandidates = useMemo(
    () =>
      assignedMentors.filter(
        (mentor) =>
          mentor.nume.toLowerCase().includes(mentorSearch.toLowerCase()) ||
          (mentor.email ?? "").toLowerCase().includes(mentorSearch.toLowerCase()),
      ),
    [assignedMentors, mentorSearch],
  );

  const filteredPhaseEvalOptions = useMemo(
    () =>
      phaseEvalOptions.filter((evaluation) =>
        evaluation.name.toLowerCase().includes(phaseEvalSearch.toLowerCase()),
      ),
    [phaseEvalOptions, phaseEvalSearch],
  );

  const handleToggleOngMentor = (ong: AssignedOng, mentor: AssignedMentor) => {
    const isAssigned = (ong.mentors ?? []).some((m) => m.documentId === mentor.documentId);
    setMentorError(null);
    startMentorTransition(async () => {
      const result = isAssigned
        ? await removeOngMentorAction(programId, ong.documentId, mentor.documentId)
        : await assignOngMentorAction(programId, ong.documentId, mentor.documentId);
      if (result.error) {
        setMentorError(result.error);
        return;
      }
      toast.success(
        isAssigned
          ? "Persoana resursă a fost eliminată din ONG."
          : "Persoana resursă a fost alocată ONG-ului.",
      );
    });
  };

  useEffect(() => {
    if (!pendingOng) return;
    let cancelled = false;
    listOngEvaluations(pendingOng.documentId, programId)
      .then((res) => {
        if (!cancelled) setEvaluations(res.data);
      })
      .catch(() => {
        if (!cancelled) setEvalError("Nu am putut încărca evaluările acestei organizații.");
      })
      .finally(() => {
        if (!cancelled) setLoadingEvaluations(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pendingOng, programId]);

  useEffect(() => {
    if (!assigningPhase) return;
    let cancelled = false;
    listOngEvaluations(assigningPhase.ongDocumentId, programId)
      .then((res) => {
        if (!cancelled) setPhaseEvalOptions(res.data);
      })
      .catch(() => {
        if (!cancelled) setPhaseEvalOptionsError("Nu am putut încărca evaluările acestei organizații.");
      })
      .finally(() => {
        if (!cancelled) setLoadingPhaseEvalOptions(false);
      });
    return () => {
      cancelled = true;
    };
  }, [assigningPhase, programId]);

  const handleToggleEvalPanel = (ongId: string) => {
    setAssignPhaseError(null);
    setAssigningPhase(null);
    setExpandedEvalOngId((prev) => (prev === ongId ? null : ongId));
  };

  const handleOpenAssignPhase = (ong: AssignedOng, phaseEvaluation: PhaseEvaluation) => {
    setAssignPhaseError(null);
    setPhaseEvalSearch("");
    setSelectedPhaseEvalOptionId("");
    setPhaseEvalOptions([]);
    setPhaseEvalOptionsError(null);
    setLoadingPhaseEvalOptions(true);
    setAssigningPhase({ ongDocumentId: ong.documentId, phaseDocumentId: phaseEvaluation.phaseDocumentId });
  };

  const handleConfirmAssignPhase = () => {
    if (!assigningPhase || !selectedPhaseEvalOptionId) return;
    setAssignPhaseError(null);
    startPhaseEvalTransition(async () => {
      const result = await assignPhaseEvaluationAction(
        programId,
        assigningPhase.phaseDocumentId,
        assigningPhase.ongDocumentId,
        selectedPhaseEvalOptionId,
      );
      if (result.error) {
        setAssignPhaseError(result.error);
        return;
      }
      setAssigningPhase(null);
      toast.success("Evaluarea a fost alocată.");
    });
  };

  const handleConfirmRemoveEval = () => {
    if (!pendingRemoveEval) return;
    setRemoveEvalError(null);
    startPhaseEvalTransition(async () => {
      const result = await removePhaseEvaluationAction(
        programId,
        pendingRemoveEval.phaseDocumentId,
        pendingRemoveEval.ongDocumentId,
      );
      if (result.error) {
        setRemoveEvalError(result.error);
        return;
      }
      setPendingRemoveEval(null);
      toast.success("Evaluarea a fost eliminată.");
    });
  };

  const handleSelectOng = (ong: ActiveOng) => {
    setEvalSearch("");
    setSelectedEvalId("");
    setSelectedPhaseId(defaultPhaseId);
    setEvaluations([]);
    setEvalError(null);
    setLoadingEvaluations(true);
    setPendingOng(ong);
  };

  const handleSelectEvaluation = (evaluationId: string) => {
    const next = selectedEvalId === evaluationId ? "" : evaluationId;
    setSelectedEvalId(next);
    setSelectedPhaseId(next ? defaultPhaseId : "");
  };

  const handleConfirmAdd = (withEval: boolean) => {
    if (!pendingOng) return;
    setError(null);
    startTransition(async () => {
      const result = await assignOngAction(
        programId,
        pendingOng.documentId,
        withEval && selectedEvalId ? selectedEvalId : undefined,
        withEval && selectedEvalId ? selectedPhaseId : undefined,
      );
      if (result.error) {
        setError(result.error);
        return;
      }
      setPendingOng(null);
      setSelectedEvalId("");
      setSelectedPhaseId("");
      setSearch("");
      setAdding(false);
      toast.success("ONG-ul a fost alocat programului.");
    });
  };

  const handleConfirmRemove = () => {
    if (!pendingRemove) return;
    setRemoveError(null);
    startTransition(async () => {
      const result = await removeOngAction(programId, pendingRemove.documentId);
      if (result.error) {
        setRemoveError(result.error);
        return;
      }
      setPendingRemove(null);
      toast.success("ONG-ul a fost eliminat din program.");
    });
  };

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden mb-6">
      <div className="px-6 py-5 border-b border-border flex items-center justify-between gap-4">
        <div>
          <h2 className="font-bold font-heading" style={{ fontSize: "1.0625rem", color: "#162040" }}>
            Alocă ONG-uri în acest program
          </h2>
          <p className="text-sm mt-0.5 text-muted-foreground">
            {assigned.length} {assigned.length === 1 ? "ONG alocat" : "ONG-uri alocate"}
          </p>
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={() => {
              setAdding((prev) => !prev);
              setSearch("");
              setPendingOng(null);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 shrink-0"
            style={{ background: adding ? "#475569" : "#2563eb" }}
          >
            {adding ? <X size={14} /> : <Plus size={14} />} {adding ? "Închide" : "Adaugă ONG"}
          </button>
        )}
      </div>

      {error && (
        <p className="px-6 py-3 text-xs border-b border-border" style={{ color: "#ef4444" }}>
          {error}
        </p>
      )}

      {adding && !pendingOng && (
        <div style={{ borderBottom: "1px solid #e2e8f0" }}>
          <div className="px-6 py-3 border-b border-border">
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
              <input
                autoFocus
                type="text"
                placeholder="Caută ONG-uri..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>
          <div className="divide-y divide-border max-h-64 overflow-y-auto" style={{ background: "#fafafa" }}>
            {candidates.length === 0 ? (
              <p className="px-6 py-4 text-sm text-muted-foreground">
                {search ? "Niciun ONG găsit." : "Toate ONG-urile sunt deja alocate."}
              </p>
            ) : (
              candidates.map((ong) => (
                <button
                  key={ong.documentId}
                  type="button"
                  onClick={() => handleSelectOng(ong)}
                  className="w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-blue-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#e2e8f0" }}>
                    <Building2 size={13} style={{ color: "#94a3b8" }} />
                  </div>
                  <span className="text-sm text-slate-600">{ong.name}</span>
                  <Plus size={13} className="ml-auto flex-shrink-0" style={{ color: "#2563eb" }} />
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {adding && pendingOng && (
        <div style={{ borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
          <div className="px-6 py-4 border-b border-border flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPendingOng(null)}
              className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
              style={{ color: "#64748b" }}
            >
              <ArrowLeft size={14} />
            </button>
            <div>
              <p className="text-sm font-semibold" style={{ color: "#162040" }}>{pendingOng.name}</p>
              <p className="text-xs text-muted-foreground">
                {evaluationPhases.length === 0
                  ? "Programul nu are nicio fază care necesită evaluare"
                  : "Alocă o evaluare (opțional)"}
              </p>
            </div>
          </div>

          {evaluationPhases.length === 0 ? null : (
            <>
              <div className="px-6 py-3 border-b border-border">
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
                  <input
                    type="text"
                    placeholder="Caută evaluări..."
                    value={evalSearch}
                    onChange={(e) => setEvalSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:border-accent transition-colors bg-white"
                  />
                </div>
              </div>

              <div className="divide-y divide-border max-h-52 overflow-y-auto">
                {loadingEvaluations ? (
                  <p className="px-6 py-4 text-sm text-muted-foreground">Se încarcă evaluările...</p>
                ) : evalError ? (
                  <p className="px-6 py-4 text-sm" style={{ color: "#ef4444" }}>{evalError}</p>
                ) : filteredEvaluations.length === 0 ? (
                  <p className="px-6 py-4 text-sm text-muted-foreground">
                    {evaluations.length === 0 ? "Nicio evaluare disponibilă pentru acest ONG." : "Nicio evaluare găsită."}
                  </p>
                ) : (
                  filteredEvaluations.map((evaluation) => {
                    const isSelected = selectedEvalId === evaluation.documentId;
                    return (
                      <div key={evaluation.documentId} style={{ background: isSelected ? "#eff6ff" : "transparent" }}>
                        <button
                          type="button"
                          onClick={() => handleSelectEvaluation(evaluation.documentId)}
                          className="w-full flex items-center gap-3 px-6 py-3 text-left transition-colors"
                        >
                          <div
                            className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                            style={{
                              borderColor: isSelected ? "#2563eb" : "#cbd5e1",
                              background: isSelected ? "#2563eb" : "transparent",
                            }}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium" style={{ color: "#162040" }}>{evaluation.name}</p>
                            <p className="text-xs text-muted-foreground">{formatEvalPeriod(evaluation)}</p>
                          </div>
                          {!evaluation.finished && (
                            <span
                              className="px-2 py-0.5 rounded-full text-xs font-semibold"
                              style={{ background: "#fef3c7", color: "#d97706" }}
                            >
                              În curs
                            </span>
                          )}
                        </button>
                        {isSelected && (
                          <div className="pl-12 pr-6 pb-3 flex items-center gap-2">
                            <label className="text-xs font-semibold uppercase tracking-wide shrink-0" style={{ color: "#64748b" }}>
                              Fază
                            </label>
                            <div className="relative w-auto max-w-[70%]">
                              <select
                                value={selectedPhaseId}
                                onChange={(e) => setSelectedPhaseId(e.target.value)}
                                className="w-full appearance-none pl-3 pr-9 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-accent transition-colors bg-white truncate"
                              >
                                {evaluationPhases.map((phase) => (
                                  <option key={phase.documentId} value={phase.documentId}>
                                    {phase.title}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown
                                size={14}
                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                                style={{ color: "#64748b" }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          <div className="px-6 py-4 flex items-center gap-3">
            <button
              type="button"
              disabled={isPending || (Boolean(selectedEvalId) && !selectedPhaseId)}
              onClick={() => handleConfirmAdd(true)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-60 inline-flex items-center gap-2"
              style={{ background: "#2563eb" }}
            >
              {isPending && (
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden="true" />
              )}
              {isPending ? "Se adaugă..." : selectedEvalId ? "Adaugă cu evaluarea selectată" : "Adaugă ONG"}
            </button>
            {selectedEvalId && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleConfirmAdd(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-slate-100 transition-colors disabled:opacity-60"
                style={{ color: "#475569" }}
              >
                Adaugă fără evaluare
              </button>
            )}
          </div>
        </div>
      )}

      {assigned.length === 0 && !adding ? (
        <div className="px-6 py-8 text-center">
          <p className="text-sm text-muted-foreground">Niciun ONG alocat încă.</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {assigned.map((ong) => {
            const isExpanded = expandedOngId === ong.documentId;
            const isEvalExpanded = expandedEvalOngId === ong.documentId;
            const ongMentors = ong.mentors ?? [];
            const ongPhaseEvaluations = ong.phaseEvaluations ?? [];
            return (
              <div key={ong.documentId}>
                <div className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#eff6ff" }}>
                      <Building2 size={14} style={{ color: "#2563eb" }} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-medium truncate min-w-0 flex-1" style={{ color: "#162040" }}>
                          {ong.name}
                        </span>
                        {isRetras(ong) && (
                          <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                            Retras
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground block mt-0.5">
                        {ongMentors.length} {ongMentors.length === 1 ? "persoană resursă" : "persoane resursă"}
                      </span>
                      {ong.evaluation && (
                        <span
                          className="inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full truncate max-w-full"
                          style={{ background: "#eff6ff", color: "#2563eb" }}
                        >
                          Eval: {ong.evaluation.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setMentorError(null);
                        setMentorSearch("");
                        setExpandedOngId(isExpanded ? null : ong.documentId);
                      }}
                      aria-expanded={isExpanded}
                      aria-controls={`ong-mentors-panel-${ong.documentId}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs font-semibold hover:bg-slate-50 transition-colors"
                      style={{ color: "#475569" }}
                    >
                      <Users size={13} />
                      Persoane resursă
                      {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                    {evaluationPhases.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleToggleEvalPanel(ong.documentId)}
                        aria-expanded={isEvalExpanded}
                        aria-controls={`ong-evals-panel-${ong.documentId}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs font-semibold hover:bg-slate-50 transition-colors"
                        style={{ color: "#475569" }}
                      >
                        <ClipboardList size={13} />
                        Evaluări per fază
                        {isEvalExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                    )}
                    {!readOnly && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => {
                          setRemoveError(null);
                          setPendingRemove(ong);
                        }}
                        aria-label={`Elimină ${ong.name}`}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60 shrink-0"
                        style={{ color: "#94a3b8" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div id={`ong-mentors-panel-${ong.documentId}`} className="px-6 pb-5" style={{ background: "#f8fafc" }}>
                    <p className="text-xs font-semibold uppercase tracking-wide pt-4 pb-3" style={{ color: "#64748b" }}>
                      Persoane resursă alocate pentru {ong.name}
                    </p>
                    <div className="relative mb-3">
                      <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
                      <input
                        type="text"
                        placeholder="Caută persoană resursă..."
                        value={mentorSearch}
                        onChange={(e) => setMentorSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:border-accent transition-colors bg-white"
                      />
                    </div>
                    {mentorError && (
                      <p className="text-xs pb-2" style={{ color: "#ef4444" }}>
                        {mentorError}
                      </p>
                    )}
                    <div className="divide-y divide-border max-h-64 overflow-y-auto rounded-xl border border-border bg-white">
                      {mentorCandidates.length === 0 ? (
                        <p className="px-4 py-4 text-sm text-muted-foreground">
                          {mentorSearch
                            ? "Nicio persoană găsită."
                            : "Nicio persoană resursă alocată acestui program încă."}
                        </p>
                      ) : (
                        mentorCandidates.map((mentor) => {
                          const checked = ongMentors.some((m) => m.documentId === mentor.documentId);
                          return (
                            <label
                              key={mentor.documentId}
                              className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                                mentor.isDeleted
                                  ? "opacity-60 cursor-default"
                                  : "cursor-pointer hover:bg-slate-50"
                              }`}
                            >
                              {/* A deleted account cannot take on an organization,
                                  and unticking one would detach the assignment its
                                  history hangs off (BR-34). Shown, never toggled. */}
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={mentorPending || readOnly || mentor.isDeleted}
                                onChange={() => handleToggleOngMentor(ong, mentor)}
                                className="h-4 w-4 rounded border-border shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium truncate" style={{ color: "#162040" }}>{mentor.nume}</p>
                                  {mentor.isDeleted && <DeletedAccountBadge />}
                                </div>
                                {mentor.email && (
                                  <p className="text-xs text-muted-foreground truncate">{mentor.email}</p>
                                )}
                              </div>
                            </label>
                          );
                        })
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground pt-3">
                      {ongMentors.length}{" "}
                      {ongMentors.length === 1 ? "persoană resursă selectată" : "persoane resursă selectate"}
                    </p>
                  </div>
                )}

                {isEvalExpanded && (
                  <div id={`ong-evals-panel-${ong.documentId}`} className="px-6 pb-5" style={{ background: "#f8fafc" }}>
                    <p className="text-xs font-semibold uppercase tracking-wide pt-4 pb-3" style={{ color: "#64748b" }}>
                      Evaluări per fază pentru {ong.name}
                    </p>
                    {assignPhaseError && (
                      <p className="text-xs pb-2" style={{ color: "#ef4444" }}>
                        {assignPhaseError}
                      </p>
                    )}
                    <div className="divide-y divide-border rounded-xl border border-border bg-white">
                      {ongPhaseEvaluations.map((phaseEvaluation) => {
                        const isAssigningThis =
                          assigningPhase?.ongDocumentId === ong.documentId &&
                          assigningPhase.phaseDocumentId === phaseEvaluation.phaseDocumentId;
                        return (
                          <div key={phaseEvaluation.phaseDocumentId} className="px-4 py-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate" style={{ color: "#162040" }}>
                                  {phaseEvaluation.phaseTitle}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {phaseEvaluation.report ? phaseEvaluation.report.name : "Nicio evaluare asignată"}
                                </p>
                              </div>
                              {!readOnly &&
                                (phaseEvaluation.report ? (
                                  <button
                                    type="button"
                                    disabled={phaseEvalPending}
                                    onClick={() => {
                                      setRemoveEvalError(null);
                                      setPendingRemoveEval({
                                        ongDocumentId: ong.documentId,
                                        ongName: ong.name,
                                        phaseDocumentId: phaseEvaluation.phaseDocumentId,
                                        phaseTitle: phaseEvaluation.phaseTitle,
                                      });
                                    }}
                                    aria-label={`Elimină evaluarea din faza ${phaseEvaluation.phaseTitle}`}
                                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs font-semibold hover:bg-red-50 transition-colors disabled:opacity-60"
                                    style={{ color: "#ef4444" }}
                                  >
                                    <Trash2 size={12} /> Elimină din fază
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      isAssigningThis
                                        ? setAssigningPhase(null)
                                        : handleOpenAssignPhase(ong, phaseEvaluation)
                                    }
                                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs font-semibold hover:bg-slate-50 transition-colors"
                                    style={{ color: "#2563eb" }}
                                  >
                                    {isAssigningThis ? <X size={12} /> : <Plus size={12} />}
                                    {isAssigningThis ? "Închide" : "Alocă evaluare"}
                                  </button>
                                ))}
                            </div>

                            {isAssigningThis && (
                              <div className="mt-3">
                                <div className="relative mb-2">
                                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
                                  <input
                                    type="text"
                                    placeholder="Caută evaluări..."
                                    value={phaseEvalSearch}
                                    onChange={(e) => setPhaseEvalSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-accent transition-colors bg-white"
                                  />
                                </div>
                                <div className="divide-y divide-border max-h-40 overflow-y-auto rounded-lg border border-border bg-white mb-2">
                                  {loadingPhaseEvalOptions ? (
                                    <p className="px-3 py-3 text-sm text-muted-foreground">Se încarcă evaluările...</p>
                                  ) : phaseEvalOptionsError ? (
                                    <p className="px-3 py-3 text-sm" style={{ color: "#ef4444" }}>{phaseEvalOptionsError}</p>
                                  ) : filteredPhaseEvalOptions.length === 0 ? (
                                    <p className="px-3 py-3 text-sm text-muted-foreground">
                                      {phaseEvalOptions.length === 0 ? "Nicio evaluare disponibilă." : "Nicio evaluare găsită."}
                                    </p>
                                  ) : (
                                    filteredPhaseEvalOptions.map((evaluation) => {
                                      const isOptionSelected = selectedPhaseEvalOptionId === evaluation.documentId;
                                      return (
                                        <button
                                          key={evaluation.documentId}
                                          type="button"
                                          onClick={() =>
                                            setSelectedPhaseEvalOptionId(isOptionSelected ? "" : evaluation.documentId)
                                          }
                                          className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors"
                                          style={{ background: isOptionSelected ? "#eff6ff" : "transparent" }}
                                        >
                                          <div
                                            className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                                            style={{
                                              borderColor: isOptionSelected ? "#2563eb" : "#cbd5e1",
                                              background: isOptionSelected ? "#2563eb" : "transparent",
                                            }}
                                          >
                                            {isOptionSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                          </div>
                                          <span className="text-sm truncate" style={{ color: "#162040" }}>
                                            {evaluation.name}
                                          </span>
                                        </button>
                                      );
                                    })
                                  )}
                                </div>
                                <button
                                  type="button"
                                  disabled={!selectedPhaseEvalOptionId || phaseEvalPending}
                                  onClick={handleConfirmAssignPhase}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-60"
                                  style={{ background: "#2563eb" }}
                                >
                                  {phaseEvalPending ? "Se alocă..." : "Confirmă"}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={pendingRemove !== null}
        title="Elimină ONG-ul din program"
        description={`Ești sigur că vrei să elimini organizația „${pendingRemove?.name}” din acest program?`}
        confirmLabel="Elimină"
        loading={isPending}
        loadingLabel="Se elimină..."
        error={removeError}
        onConfirm={handleConfirmRemove}
        onCancel={() => setPendingRemove(null)}
      />

      <ConfirmDialog
        open={pendingRemoveEval !== null}
        title="Elimină evaluarea din fază"
        description={`Ești sigur că vrei să desprinzi evaluarea organizației „${pendingRemoveEval?.ongName}” de faza „${pendingRemoveEval?.phaseTitle}”? Evaluarea în sine nu se șterge.`}
        confirmLabel="Elimină"
        loading={phaseEvalPending}
        loadingLabel="Se elimină..."
        error={removeEvalError}
        onConfirm={handleConfirmRemoveEval}
        onCancel={() => setPendingRemoveEval(null)}
      />
    </div>
  );
}
