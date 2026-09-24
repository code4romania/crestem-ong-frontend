"use client";

import { toast } from "sonner";
import { useRef, useState, useTransition } from "react";
import type { ChangeEvent, DragEvent, MouseEvent } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { uploadMentorMeetingReportAction } from "@/lib/api/meetings-actions";

const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export function MentorReportUploadModal({
  open,
  meetingDocumentId,
  replacing,
  onClose,
}: {
  open: boolean;
  meetingDocumentId: string;
  replacing: boolean;
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const processFile = (candidate: File | null) => {
    setFileError(null);
    if (!candidate) {
      setFile(null);
      return;
    }
    if (!ACCEPTED_FILE_TYPES.includes(candidate.type)) {
      setFileError("Format neacceptat. Folosește PDF, DOC, DOCX, XLS sau XLSX.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setFile(candidate);
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
    if (!file) return;
    setError(null);
    startTransition(async () => {
      const form = new FormData();
      form.append("files", file);
      const result = await uploadMentorMeetingReportAction(meetingDocumentId, form);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success("Raportul a fost încărcat.");
      onClose();
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mentor-report-upload-title"
    >
      <div className="bg-white rounded-2xl w-full max-w-md flex flex-col">
        <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4">
          <h2 id="mentor-report-upload-title" className="font-heading font-extrabold text-lg" style={{ color: "#1c1c81" }}>
            {replacing ? "Înlocuiește raportul" : "Adaugă raport"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Închide"
            className="text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <p role="alert" className="rounded-lg px-3 py-2 text-sm bg-[#fff5f5] border-[1.5px] border-[#fca5a5] text-[#b91c1c]">
              {error}
            </p>
          )}

          <div>
            <p className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
              Fișier <span style={{ color: "#b91c1c" }}>*</span>
            </p>
            <div className="relative">
              <label
                htmlFor="mentor-report-file"
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
                <Upload size={16} className="text-muted-foreground shrink-0" />
                <span className="truncate" style={{ color: file ? "#1c1c81" : "#5b6779" }}>
                  {file ? file.name : "Selectează fișierul (PDF, DOC, XLS)"}
                </span>
                <input
                  ref={fileInputRef}
                  id="mentor-report-file"
                  type="file"
                  accept={ACCEPTED_FILE_TYPES.join(",")}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => processFile(e.target.files?.[0] ?? null)}
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
            {fileError && <p className="mt-1.5 text-xs" style={{ color: "#b91c1c" }}>{fileError}</p>}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors disabled:opacity-50"
            style={{ color: "#475569" }}
          >
            Anulează
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!file || isPending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ background: "#1c1c81" }}
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {isPending ? "Se încarcă..." : "Încarcă raportul"}
          </button>
        </div>
      </div>
    </div>
  );
}
