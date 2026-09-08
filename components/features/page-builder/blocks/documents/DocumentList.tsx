"use client";

import { useEffect, useRef, useTransition } from "react";
import { ArrowDown, ArrowUp, FilePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { uploadPageDocumentAction } from "@/lib/api/page-blocks-actions";
import { MAX_DOCUMENT_BYTES, MAX_DOCUMENT_LABEL } from "../../upload";
import { badgeTone, extLabel, formatSize } from "./helpers";
import type { DocumentFile } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors";

const ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.odt,.ods";

/**
 * The "Adaugă documente" repeater for the Documents block. Mirrors
 * `GalleryImageList`: one Server Action call per file for a multi-select, the
 * same 5 MB client guard, inline name editing, reorder and remove. Upload only —
 * a Media Library picker is to follow.
 */
export function DocumentList({
  value,
  onChange,
  error,
}: {
  value: DocumentFile[];
  onChange: (next: DocumentFile[]) => void;
  error?: string;
}) {
  const [isUploading, startUpload] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // A slow upload resolves after the user may have edited other rows; commit
  // against the newest props, not the ones captured when the upload started.
  const latestValue = useRef(value);
  const latestOnChange = useRef(onChange);
  useEffect(() => {
    latestValue.current = value;
    latestOnChange.current = onChange;
  });

  const setField = (index: number, patch: Partial<DocumentFile>) =>
    onChange(value.map((doc, i) => (i === index ? { ...doc, ...patch } : doc)));

  const remove = (index: number) =>
    onChange(value.filter((_, i) => i !== index));

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    const tooBig = files.filter((f) => f.size > MAX_DOCUMENT_BYTES);
    const withinLimit = files.filter((f) => f.size <= MAX_DOCUMENT_BYTES);
    if (tooBig.length > 0) {
      toast.error(
        `${tooBig.length} ${
          tooBig.length === 1 ? "fișier depășește" : "fișiere depășesc"
        } limita de ${MAX_DOCUMENT_LABEL} și ${
          tooBig.length === 1 ? "a fost ignorat" : "au fost ignorate"
        }.`,
      );
    }
    if (withinLimit.length === 0) return;

    startUpload(async () => {
      const added: DocumentFile[] = [];
      const failures: string[] = [];
      for (const file of withinLimit) {
        const form = new FormData();
        form.append("files", file);
        try {
          const result = await uploadPageDocumentAction(form);
          if (result.error || !result.document) {
            failures.push(
              `${file.name}: ${result.error ?? "răspuns invalid de la server"}`,
            );
            continue;
          }
          added.push({
            id: result.document.id,
            url: result.document.url,
            name: result.document.name,
            ext: result.document.ext,
            size: result.document.size,
          });
        } catch (err) {
          failures.push(
            `${file.name}: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }
      if (failures.length > 0) {
        console.error("[Documents upload] failed:", failures);
        toast.error(failures[0]);
      }
      if (added.length > 0)
        latestOnChange.current([...latestValue.current, ...added]);
    });
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#475569]">
          Documente ({value.length})
        </span>
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563eb] hover:opacity-80 disabled:opacity-60"
          >
            {isUploading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <FilePlus size={15} />
            )}
            {isUploading ? "Se încarcă..." : "Încarcă fișiere"}
          </button>
        )}
      </div>

      {value.length === 0 ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-10 text-sm font-semibold text-[#475569] transition-colors hover:border-[#2dbe8f] hover:text-[#162040] disabled:opacity-60"
        >
          {isUploading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <FilePlus size={20} />
          )}
          {isUploading ? "Se încarcă..." : "Încarcă fișiere"}
        </button>
      ) : (
        <ul className="space-y-2">
          {value.map((doc, index) => {
            const label = extLabel(doc.ext, doc.url);
            const size = formatSize(doc.size);
            return (
              <li
                key={`${doc.url}-${index}`}
                className="flex gap-3 rounded-xl border border-border bg-slate-50/60 p-2"
              >
                <span
                  className={`flex h-9 w-11 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white ${badgeTone(
                    label,
                  )}`}
                >
                  {label || "FILE"}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div>
                    <label
                      htmlFor={`documents-name-${index}`}
                      className={labelClass}
                    >
                      Nume afișat
                    </label>
                    <input
                      id={`documents-name-${index}`}
                      className={inputClass}
                      value={doc.name}
                      onChange={(e) =>
                        setField(index, { name: e.target.value })
                      }
                      placeholder="ex. Regulament intern — versiunea PDF"
                    />
                  </div>
                  <p className="truncate text-xs text-[#94a3b8]">
                    {[label, size].filter(Boolean).join(" · ") || doc.url}
                  </p>
                </div>
                <span className="flex shrink-0 flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label="Mută mai sus"
                    className="rounded-lg p-1.5 text-[#475569] transition-colors hover:bg-slate-200 disabled:opacity-40"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === value.length - 1}
                    aria-label="Mută mai jos"
                    className="rounded-lg p-1.5 text-[#475569] transition-colors hover:bg-slate-200 disabled:opacity-40"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    aria-label="Elimină documentul"
                    className="rounded-lg p-1.5 text-[#ef4444] transition-colors hover:bg-[#fef2f2]"
                  >
                    <Trash2 size={16} />
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {error && <p className="mt-1 text-xs text-[#ef4444]">{error}</p>}

      <button
        type="button"
        disabled
        title="În curând"
        className="mt-3 text-xs font-semibold text-[#94a3b8]"
      >
        Alege din Media Library · în curând
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={onFileInputChange}
      />
    </div>
  );
}
