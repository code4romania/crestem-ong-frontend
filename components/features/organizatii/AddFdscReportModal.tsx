"use client";

import { toast } from "sonner";
import { useEffect, useRef, useState, useTransition } from "react";
import type { ChangeEvent, DragEvent, MouseEvent } from "react";
import { ChevronDown, Loader2, Plus, Upload, X } from "lucide-react";
import { createFdscReportAction } from "@/lib/api/ongs-actions";
import { listOngEvaluations, type OngEvaluation } from "@/lib/api/ongs";
import { ModalOverlay } from "@/components/ui/ModalOverlay";

const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#00d495]/30 focus:border-[#007d58] transition-colors bg-white text-sm";

const selectClass = `${inputClass} appearance-none pr-10`;

export function AddFdscReportModal({
  ongDocumentId,
  programs,
}: {
  ongDocumentId: string;
  programs: { documentId: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [program, setProgram] = useState("");
  const [evaluation, setEvaluation] = useState("");
  const [evaluations, setEvaluations] = useState<OngEvaluation[]>([]);
  const [loadingEvaluations, setLoadingEvaluations] = useState(false);
  const [evaluationsError, setEvaluationsError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit =
    program.trim() !== "" &&
    evaluation.trim() !== "" &&
    name.trim() !== "" &&
    file !== null;

  useEffect(() => {
    if (!program) return;
    let cancelled = false;
    listOngEvaluations(ongDocumentId, program)
      .then((res) => {
        if (!cancelled) setEvaluations(res.data);
      })
      .catch(() => {
        if (!cancelled) {
          setEvaluationsError("Nu am putut încărca evaluările acestui program.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingEvaluations(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ongDocumentId, program]);

  const handleProgramChange = (value: string) => {
    setProgram(value);
    setEvaluation("");
    setEvaluations([]);
    setEvaluationsError(null);
    setLoadingEvaluations(value !== "");
  };

  const reset = () => {
    setProgram("");
    setEvaluation("");
    setEvaluations([]);
    setEvaluationsError(null);
    setName("");
    setFile(null);
    setFileError(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const close = () => {
    setOpen(false);
    reset();
  };

  const processFile = (candidate: File | null) => {
    setFileError(null);
    if (!candidate) {
      setFile(null);
      return;
    }
    if (!ACCEPTED_FILE_TYPES.includes(candidate.type)) {
      setFileError(
        "Format neacceptat. Folosește PDF, DOC, DOCX, XLS sau XLSX.",
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setFile(candidate);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    processFile(e.target.files?.[0] ?? null);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files?.[0] ?? null);
  };

  const handleRemoveFile = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setFile(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = () => {
    if (!canSubmit || !file) return;
    setError(null);
    startTransition(async () => {
      const form = new FormData();
      form.append("name", name.trim());
      form.append("evaluation", evaluation);
      form.append("files", file);
      const result = await createFdscReportAction(ongDocumentId, form);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success("Raportul a fost adăugat.");
      close();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: "#1c1c81" }}
      >
        <Plus size={14} /> Încarcă raport
      </button>

      {open && (
        <ModalOverlay labelledBy="add-fdsc-report-title">
          <div className="bg-white rounded-2xl w-full max-w-md flex flex-col">
            <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4">
              <h2
                id="add-fdsc-report-title"
                className="font-heading font-extrabold text-lg"
                style={{ color: "#1c1c81" }}
              >
                Încarcă raport
              </h2>
              <button
                type="button"
                onClick={close}
                disabled={isPending}
                aria-label="Închide"
                className="text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {error && (
                <p
                  role="alert"
                  className="rounded-lg px-3 py-2 text-sm bg-[#fff5f5] border-[1.5px] border-[#fca5a5] text-[#b91c1c]"
                >
                  {error}
                </p>
              )}

              <div>
                <label
                  htmlFor="fdsc-report-program"
                  className="block text-sm font-semibold mb-1.5"
                  style={{ color: "#334155" }}
                >
                  Program <span style={{ color: "#b91c1c" }}>*</span>
                </label>
                <div className="relative">
                  <select
                    id="fdsc-report-program"
                    className={selectClass}
                    value={program}
                    onChange={(e) => handleProgramChange(e.target.value)}
                  >
                    <option value="">Selectează programul...</option>
                    {programs.map((p) => (
                      <option key={p.documentId} value={p.documentId}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="fdsc-report-evaluation"
                  className="block text-sm font-semibold mb-1.5"
                  style={{ color: "#334155" }}
                >
                  Evaluare <span style={{ color: "#b91c1c" }}>*</span>
                </label>
                <div className="relative">
                  <select
                    id="fdsc-report-evaluation"
                    className={selectClass}
                    value={evaluation}
                    onChange={(e) => setEvaluation(e.target.value)}
                    disabled={!program || loadingEvaluations}
                  >
                    <option value="">
                      {!program
                        ? "Selectează mai întâi programul"
                        : loadingEvaluations
                          ? "Se încarcă evaluările..."
                          : "Selectează evaluarea..."}
                    </option>
                    {evaluations.map((ev) => (
                      <option key={ev.documentId} value={ev.documentId}>
                        {ev.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                </div>
                {evaluationsError && (
                  <p className="mt-1.5 text-xs" style={{ color: "#b91c1c" }}>
                    {evaluationsError}
                  </p>
                )}
                {program && !loadingEvaluations && !evaluationsError && evaluations.length === 0 && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Această organizație nu are nicio evaluare în acest program.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="fdsc-report-name"
                  className="block text-sm font-semibold mb-1.5"
                  style={{ color: "#334155" }}
                >
                  Denumire raport <span style={{ color: "#b91c1c" }}>*</span>
                </label>
                <input
                  id="fdsc-report-name"
                  type="text"
                  className={inputClass}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex. Raport final Faza 2"
                />
              </div>

              <div>
                <p
                  className="block text-sm font-semibold mb-1.5"
                  style={{ color: "#334155" }}
                >
                  Fișier <span style={{ color: "#b91c1c" }}>*</span>
                </p>
                <div className="relative">
                  <label
                    htmlFor="fdsc-report-file"
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`flex items-center gap-2 rounded-xl border-2 border-dashed px-4 py-3 text-sm cursor-pointer transition-colors ${
                      file ? "pr-10" : ""
                    } ${isDragging ? "border-[#007d58] bg-[#00d495]/5" : "border-border bg-slate-50 hover:bg-slate-100"}`}
                  >
                    <Upload
                      size={16}
                      className="text-muted-foreground shrink-0"
                    />
                    <span
                      className="truncate"
                      style={{ color: file ? "#1c1c81" : "#5b6779" }}
                    >
                      {file ? file.name : "Selectează fișierul (PDF, DOC, XLS)"}
                    </span>
                    <input
                      ref={fileInputRef}
                      id="fdsc-report-file"
                      type="file"
                      accept={ACCEPTED_FILE_TYPES.join(",")}
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                  {file && (
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      aria-label="Elimină fișierul"
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:text-[#b91c1c] transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                {fileError && (
                  <p className="mt-1.5 text-xs" style={{ color: "#b91c1c" }}>
                    {fileError}
                  </p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <button
                type="button"
                onClick={close}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors disabled:opacity-50"
                style={{ color: "#475569" }}
              >
                Anulează
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit || isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ background: "#1c1c81" }}
              >
                {isPending && <Loader2 size={14} className="animate-spin" />}
                {isPending ? "Se încarcă..." : "Încarcă raport"}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </>
  );
}
