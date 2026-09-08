"use client";

import { useEffect, useRef, useTransition } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getMediaUrl } from "@/lib/api/client";
import { uploadPageImageAction } from "@/lib/api/page-blocks-actions";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "../../upload";
import type { GalleryImage } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors";

/**
 * The "Adaugă imagini" repeater for the Gallery block. Unlike the single-image
 * editors it uploads a whole multi-select at once (one Server Action call per
 * file, same 5 MB client guard as `usePageImageUpload`) and edits each image's
 * `alt` / `caption` inline in a vertical list — the config panel is too narrow
 * for a thumbnail grid with per-tile fields.
 */
export function GalleryImageList({
  value,
  onChange,
  error,
}: {
  value: GalleryImage[];
  onChange: (next: GalleryImage[]) => void;
  error?: string;
}) {
  const [isUploading, startUpload] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // The upload below resolves after the user may have edited other fields (or
  // added more images); commit against the newest props, not the ones captured
  // when the upload started.
  const latestValue = useRef(value);
  const latestOnChange = useRef(onChange);
  useEffect(() => {
    latestValue.current = value;
    latestOnChange.current = onChange;
  });

  const setField = (index: number, patch: Partial<GalleryImage>) =>
    onChange(value.map((img, i) => (i === index ? { ...img, ...patch } : img)));

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

    const tooBig = files.filter((f) => f.size > MAX_UPLOAD_BYTES);
    const withinLimit = files.filter((f) => f.size <= MAX_UPLOAD_BYTES);
    if (tooBig.length > 0) {
      toast.error(
        `${tooBig.length} ${
          tooBig.length === 1 ? "imagine depășește" : "imagini depășesc"
        } limita de ${MAX_UPLOAD_LABEL} și ${
          tooBig.length === 1 ? "a fost ignorată" : "au fost ignorate"
        }.`,
      );
    }
    if (withinLimit.length === 0) return;

    startUpload(async () => {
      const added: GalleryImage[] = [];
      let failed = 0;
      for (const file of withinLimit) {
        const form = new FormData();
        form.append("files", file);
        try {
          const result = await uploadPageImageAction(form);
          if (result.error || !result.image) {
            failed += 1;
            continue;
          }
          added.push({
            id: result.image.id,
            url: result.image.url,
            name: result.image.name,
            alt: "",
            caption: "",
          });
        } catch {
          failed += 1;
        }
      }
      if (failed > 0) {
        toast.error(
          `Nu am putut încărca ${failed} ${
            failed === 1 ? "imagine" : "imagini"
          }.`,
        );
      }
      if (added.length > 0)
        latestOnChange.current([...latestValue.current, ...added]);
    });
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#475569]">
          Imagini ({value.length})
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
              <ImagePlus size={15} />
            )}
            {isUploading ? "Se încarcă..." : "Adaugă imagini"}
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
            <ImagePlus size={20} />
          )}
          {isUploading ? "Se încarcă..." : "Adaugă imagini"}
        </button>
      ) : (
        <ul className="space-y-2">
          {value.map((img, index) => {
            const needsText = !img.alt && !img.caption;
            return (
            <li
              key={`${img.id}-${index}`}
              className="flex gap-3 rounded-xl border border-border bg-slate-50/60 p-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getMediaUrl(img.url)}
                alt=""
                title={
                  needsText
                    ? "Fără text alternativ sau descriere — recomandat pentru imaginile informative"
                    : undefined
                }
                className={`h-16 w-16 shrink-0 rounded-lg object-cover ${
                  needsText ? "ring-2 ring-[#f59e0b]" : ""
                }`}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div>
                  <label
                    htmlFor={`gallery-alt-${index}`}
                    className={labelClass}
                  >
                    Text alternativ
                    <span className="ml-1.5 font-normal normal-case text-[#94a3b8]">
                      (opțional)
                    </span>
                  </label>
                  <input
                    id={`gallery-alt-${index}`}
                    className={inputClass}
                    value={img.alt}
                    onChange={(e) => setField(index, { alt: e.target.value })}
                    placeholder="Descriere accesibilă a imaginii"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`gallery-caption-${index}`}
                    className={labelClass}
                  >
                    Descriere
                    <span className="ml-1.5 font-normal normal-case text-[#94a3b8]">
                      (opțional)
                    </span>
                  </label>
                  <input
                    id={`gallery-caption-${index}`}
                    className={inputClass}
                    value={img.caption}
                    onChange={(e) =>
                      setField(index, { caption: e.target.value })
                    }
                    placeholder="Text afișat sub imagine"
                  />
                </div>
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
                  aria-label="Elimină imaginea"
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
        className="mt-2 text-xs font-semibold text-[#94a3b8]"
      >
        Alege din Media Library · în curând
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onFileInputChange}
      />
    </div>
  );
}
