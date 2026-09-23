// components/features/programe/ProgramForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { createProgram, updateProgram } from "@/lib/api/programs";
import type { ProgramDetail, PhaseInput } from "@/lib/api/programs";
import { getApiErrorMessage } from "@/lib/api/client";
import { formatDate } from "@/lib/utils/date";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const formSchema = z
  .object({
    name: z.string().trim().min(1, "Numele programului este obligatoriu"),
    startDate: z.string().min(1, "Data de început este obligatorie"),
    endDate: z.string().min(1, "Data de sfârșit este obligatorie"),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "Data de sfârșit este înaintea datei de început",
    path: ["endDate"],
  });

type FormValues = z.infer<typeof formSchema>;

type PhaseRow = PhaseInput & { key: string };

const PHASE_COLORS = [
  { bar: "#3b82f6" },
  { bar: "#22c55e" },
  { bar: "#a855f7" },
  { bar: "#f97316" },
  { bar: "#eab308" },
  { bar: "#14b8a6" },
];

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:border-violet-400 bg-white transition-colors";

const draftInputClass =
  "w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none bg-white transition-colors";

function emptyDraft(): PhaseRow {
  return {
    key: `new-${Date.now()}`,
    title: "",
    startDate: "",
    endDate: "",
    hasEvaluation: false,
  };
}

export function ProgramForm({
  mode,
  program,
}: {
  mode: "create" | "edit";
  program?: ProgramDetail;
}) {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const [removedPhaseIds, setRemovedPhaseIds] = useState<string[]>([]);
  const [savedPhases, setSavedPhases] = useState<PhaseRow[]>(
    mode === "edit" && program
      ? program.phases.map((phase) => ({ ...phase, key: phase.documentId }))
      : [],
  );
  const [draftPhase, setDraftPhase] = useState<PhaseRow | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [phaseError, setPhaseError] = useState("");
  const [phasesListError, setPhasesListError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingDeleteKey, setPendingDeleteKey] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: program?.name ?? "",
      startDate: program?.startDate ?? "",
      endDate: program?.endDate ?? "",
    },
  });

  const backHref = "/dashboard/programe";

  const openNewPhase = () => {
    setDraftPhase(emptyDraft());
    setEditingKey(null);
    setPhaseError("");
  };

  const openEditPhase = (phase: PhaseRow) => {
    setDraftPhase({ ...phase });
    setEditingKey(phase.key);
    setPhaseError("");
  };

  const cancelPhase = () => {
    setDraftPhase(null);
    setEditingKey(null);
    setPhaseError("");
  };

  const savePhase = () => {
    if (!draftPhase) return;
    if (!draftPhase.title.trim()) {
      setPhaseError("Titlul fazei este obligatoriu.");
      return;
    }
    if (!draftPhase.startDate) {
      setPhaseError("Data de început este obligatorie.");
      return;
    }
    if (!draftPhase.endDate) {
      setPhaseError("Data de final este obligatorie.");
      return;
    }
    if (draftPhase.endDate < draftPhase.startDate) {
      setPhaseError("Data de final trebuie să fie după data de început.");
      return;
    }
    if (editingKey) {
      setSavedPhases((prev) =>
        prev.map((phase) => (phase.key === editingKey ? draftPhase : phase)),
      );
    } else {
      setSavedPhases((prev) => [...prev, draftPhase]);
    }
    setPhasesListError("");
    setDraftPhase(null);
    setEditingKey(null);
    setPhaseError("");
  };

  const confirmDeletePhase = () => {
    const key = pendingDeleteKey;
    if (!key) return;
    const phase = savedPhases.find((candidate) => candidate.key === key);
    if (phase?.documentId) {
      setRemovedPhaseIds((prev) => [...prev, phase.documentId as string]);
    }
    setSavedPhases((prev) => prev.filter((candidate) => candidate.key !== key));
    if (editingKey === key) cancelPhase();
    setPendingDeleteKey(null);
  };

  const phasePendingDelete = savedPhases.find(
    (phase) => phase.key === pendingDeleteKey,
  );

  const onSubmit = async (data: FormValues) => {
    if (savedPhases.length === 0) {
      setPhasesListError("Programul trebuie să aibă cel puțin o fază.");
      return;
    }
    setPhasesListError("");
    setApiError(null);
    setSubmitting(true);
    try {
      if (mode === "create") {
        await createProgram({
          name: data.name,
          startDate: data.startDate,
          endDate: data.endDate,
          phases: savedPhases.map(
            ({ title, startDate, endDate, hasEvaluation }) => ({
              title,
              startDate,
              endDate,
              hasEvaluation,
            }),
          ),
        });
      } else if (program) {
        await updateProgram(program.documentId, {
          name: data.name,
          startDate: data.startDate,
          endDate: data.endDate,
          phases: savedPhases.map(
            ({ documentId, title, startDate, endDate, hasEvaluation }) => ({
              documentId,
              title,
              startDate,
              endDate,
              hasEvaluation,
            }),
          ),
          removePhases:
            removedPhaseIds.length > 0 ? removedPhaseIds : undefined,
        });
      }
      router.push("/dashboard/programe");
      router.refresh();
    } catch (err) {
      setApiError(getApiErrorMessage(err, "Nu am putut salva programul."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm font-medium mb-4"
        style={{ color: "#162040" }}
      >
        <ArrowLeft size={16} /> Înapoi la programe
      </Link>

      <h1
        className="mb-8 font-heading font-extrabold text-2xl"
        style={{ color: "#162040" }}
      >
        {mode === "create" ? "Adaugă program nou" : "Editează program"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        {apiError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl p-4 text-sm"
            style={{
              background: "#fff5f5",
              border: "1.5px solid #fca5a5",
              color: "#ef4444",
            }}
          >
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            {apiError}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-border p-7 space-y-5">
          <h2 className="font-bold text-base" style={{ color: "#162040" }}>
            Detalii program
          </h2>
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "#334155" }}
            >
              Numele programului <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              placeholder="ex. Social Change Accelerator"
              className={inputClass}
              style={{ color: "#162040" }}
              {...register("name")}
            />
            {errors.name && (
              <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>
                {errors.name.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "#334155" }}
              >
                Data de început <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="date"
                className={inputClass}
                style={{ color: "#162040" }}
                {...register("startDate")}
              />
              {errors.startDate && (
                <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>
                  {errors.startDate.message}
                </p>
              )}
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "#334155" }}
              >
                Data de final <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="date"
                className={inputClass}
                style={{ color: "#162040" }}
                {...register("endDate")}
              />
              {errors.endDate && (
                <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-7">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-base" style={{ color: "#162040" }}>
              Faze program
            </h2>
            {!draftPhase && (
              <button
                type="button"
                onClick={openNewPhase}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ background: "#7c3aed" }}
              >
                <Plus size={14} /> Adaugă fază
              </button>
            )}
          </div>

          {draftPhase && (
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-5 mb-5">
              <p
                className="text-xs font-semibold uppercase tracking-wide mb-4"
                style={{ color: "#7c3aed" }}
              >
                {editingKey ? "Editează faza" : "Fază nouă"}
              </p>
              <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-3">
                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "#475569" }}
                  >
                    Titlu fază *
                  </label>
                  <input
                    value={draftPhase.title}
                    onChange={(e) =>
                      setDraftPhase((d) =>
                        d ? { ...d, title: e.target.value } : d,
                      )
                    }
                    placeholder="ex. Recrutare aplicanți"
                    className={draftInputClass}
                    style={{ color: "#162040" }}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "#475569" }}
                  >
                    Dată început *
                  </label>
                  <input
                    type="date"
                    value={draftPhase.startDate}
                    onChange={(e) =>
                      setDraftPhase((d) =>
                        d ? { ...d, startDate: e.target.value } : d,
                      )
                    }
                    className={draftInputClass}
                    style={{ color: "#162040" }}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "#475569" }}
                  >
                    Dată final *
                  </label>
                  <input
                    type="date"
                    value={draftPhase.endDate}
                    onChange={(e) =>
                      setDraftPhase((d) =>
                        d ? { ...d, endDate: e.target.value } : d,
                      )
                    }
                    className={draftInputClass}
                    style={{ color: "#162040" }}
                  />
                </div>
              </div>
              <label
                className="flex items-center gap-2 text-sm mb-4"
                style={{ color: "#334155" }}
              >
                <input
                  type="checkbox"
                  checked={draftPhase.hasEvaluation}
                  onChange={(e) =>
                    setDraftPhase((d) =>
                      d ? { ...d, hasEvaluation: e.target.checked } : d,
                    )
                  }
                />
                Faza necesită evaluare
              </label>
              {phaseError && (
                <p className="text-xs mb-3" style={{ color: "#dc2626" }}>
                  {phaseError}
                </p>
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={savePhase}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                  style={{ background: "#7c3aed" }}
                >
                  Salvează faza
                </button>
                <button
                  type="button"
                  onClick={cancelPhase}
                  className="px-4 py-2 rounded-lg text-sm font-semibold border border-border hover:bg-white transition-colors"
                  style={{ color: "#475569" }}
                >
                  Anulează
                </button>
              </div>
            </div>
          )}

          {savedPhases.length > 0 ? (
            <div className="rounded-xl border border-border overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    style={{
                      background: "#f8fafc",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    {[
                      "#",
                      "Titlu fază",
                      "Dată început",
                      "Dată final",
                      "Evaluare",
                      "Acțiuni",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "#94a3b8" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {savedPhases.map((phase, idx) => (
                    <tr
                      key={phase.key}
                      className="border-b border-border last:border-0 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <span
                          className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white"
                          style={{
                            background:
                              PHASE_COLORS[idx % PHASE_COLORS.length].bar,
                            display: "inline-flex",
                          }}
                        >
                          {idx + 1}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3.5 font-semibold"
                        style={{ color: "#162040" }}
                      >
                        {phase.title}
                      </td>
                      <td className="px-4 py-3.5" style={{ color: "#475569" }}>
                        {formatDate(phase.startDate)}
                      </td>
                      <td className="px-4 py-3.5" style={{ color: "#475569" }}>
                        {formatDate(phase.endDate)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                          style={
                            phase.hasEvaluation
                              ? { background: "#ecfdf5", color: "#059669" }
                              : { background: "#f1f5f9", color: "#64748b" }
                          }
                        >
                          {phase.hasEvaluation ? (
                            <Check size={12} />
                          ) : (
                            <X size={12} />
                          )}
                          {phase.hasEvaluation ? "Da" : "Nu"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditPhase(phase)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                            style={{ color: "#64748b" }}
                            title="Editează"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingDeleteKey(phase.key)}
                            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            style={{ color: "#94a3b8" }}
                            title="Șterge"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : !draftPhase ? (
            <button
              type="button"
              onClick={openNewPhase}
              className="w-full rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center py-12 gap-2 hover:border-violet-200 transition-colors"
            >
              <Plus size={24} style={{ color: "#cbd5e1" }} />
              <p className="text-sm" style={{ color: "#94a3b8" }}>
                Apasă „Adaugă fază” pentru a crea prima etapă
              </p>
            </button>
          ) : null}

          {phasesListError && (
            <p className="mt-3 text-xs" style={{ color: "#ef4444" }}>
              {phasesListError}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 pb-8">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-60"
            style={{ background: "#7c3aed" }}
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {mode === "create" ? "Creează programul" : "Salvează modificările"}
          </button>
          <Link
            href={backHref}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors"
            style={{ color: "#475569" }}
          >
            Anulează
          </Link>
        </div>
      </form>

      <ConfirmDialog
        open={pendingDeleteKey !== null}
        title="Șterge faza"
        description={
          phasePendingDelete
            ? `Ești sigur că vrei să ștergi faza „${phasePendingDelete.title}”?`
            : "Ești sigur că vrei să ștergi această fază?"
        }
        confirmLabel="Șterge"
        onConfirm={confirmDeletePhase}
        onCancel={() => setPendingDeleteKey(null)}
      />
    </div>
  );
}
