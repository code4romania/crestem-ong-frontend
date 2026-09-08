"use client";

import { useRef, useState, useTransition } from "react";
import { Film, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Toggle } from "@/components/ui/Toggle";
import { uploadPageVideoAction } from "@/lib/api/page-blocks-actions";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "../../upload";
import type { BlockFieldErrors } from "../../types";
import type { VideoData } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors disabled:opacity-60";
const errorClass = "mt-1 text-xs text-[#ef4444]";
const hintClass = "mt-1 text-xs text-[#94a3b8]";

const URL_PLACEHOLDER: Record<VideoData["sursaTip"], string> = {
  youtube: "https://www.youtube.com/watch?v=...",
  vimeo: "https://vimeo.com/...",
  fisier: "https://.../fisier.mp4",
};

export function VideoEditor({
  value,
  onChange,
  errors,
}: {
  value: VideoData;
  onChange: (next: VideoData) => void;
  errors: BlockFieldErrors;
}) {
  const [isUploading, startUpload] = useTransition();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (patch: Partial<VideoData>) => onChange({ ...value, ...patch });

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploadError(null);
    if (file.size > MAX_UPLOAD_BYTES) {
      const message = `Fișierul depășește limita de ${MAX_UPLOAD_LABEL}. Alege un fișier mai mic.`;
      setUploadError(message);
      toast.error(message);
      return;
    }
    startUpload(async () => {
      const form = new FormData();
      form.append("files", file);
      try {
        const result = await uploadPageVideoAction(form);
        if (result.error || !result.video) {
          const message =
            result.error ?? "Nu am putut încărca fișierul video.";
          setUploadError(message);
          toast.error(message);
          return;
        }
        set({ fisier: result.video });
      } catch {
        const message = "Nu am putut încărca fișierul video.";
        setUploadError(message);
        toast.error(message);
      }
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <span className={labelClass}>Sursă video</span>
        <SegmentedControl
          ariaLabel="Sursă video"
          value={value.sursaTip}
          onChange={(sursaTip) =>
            set(
              sursaTip === "fisier"
                ? { sursaTip, controale: true }
                : { sursaTip },
            )
          }
          options={[
            { value: "youtube", label: "YouTube" },
            { value: "vimeo", label: "Vimeo" },
            { value: "fisier", label: "Fișier" },
          ]}
        />
      </div>

      {value.sursaTip === "fisier" ? (
        <div>
          <span className={labelClass}>Fișier video</span>
          {value.fisier ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white px-4 py-3">
              <span className="truncate text-sm text-[#475569]">
                {value.fisier.name || "video"}
              </span>
              <span className="flex shrink-0 items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="text-sm font-semibold text-[#2563eb] hover:opacity-80 disabled:opacity-60"
                >
                  {isUploading ? "Se încarcă..." : "Schimbă"}
                </button>
                <button
                  type="button"
                  onClick={() => set({ fisier: null })}
                  className="text-sm font-semibold text-[#ef4444] hover:opacity-80"
                >
                  Elimină
                </button>
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-8 text-sm font-semibold text-[#475569] transition-colors hover:border-[#2dbe8f] hover:text-[#162040] disabled:opacity-60"
            >
              {isUploading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Film size={20} />
              )}
              {isUploading ? "Se încarcă..." : "Selectează fișier video"}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFile}
          />
          {uploadError && <p className={errorClass}>{uploadError}</p>}

          <label htmlFor="video-sursa-url" className={`${labelClass} mt-3`}>
            sau lipește un URL
          </label>
          <input
            id="video-sursa-url"
            className={inputClass}
            value={value.sursaUrl}
            onChange={(e) => set({ sursaUrl: e.target.value })}
            placeholder={URL_PLACEHOLDER.fisier}
            aria-invalid={Boolean(errors.sursaUrl)}
          />
          <p className={hintClass}>
            Fișierul încărcat are prioritate față de URL. Media Library urmează.
          </p>
          {errors.sursaUrl && <p className={errorClass}>{errors.sursaUrl}</p>}
        </div>
      ) : (
        <div>
          <label htmlFor="video-sursa-url" className={labelClass}>
            Link {value.sursaTip === "youtube" ? "YouTube" : "Vimeo"}{" "}
            <span className="text-[#ef4444]">*</span>
          </label>
          <input
            id="video-sursa-url"
            className={inputClass}
            value={value.sursaUrl}
            onChange={(e) => set({ sursaUrl: e.target.value })}
            placeholder={URL_PLACEHOLDER[value.sursaTip]}
            aria-invalid={Boolean(errors.sursaUrl)}
          />
          {errors.sursaUrl && <p className={errorClass}>{errors.sursaUrl}</p>}
        </div>
      )}

      <div>
        <label htmlFor="video-alt" className={labelClass}>
          Alt text video
        </label>
        <input
          id="video-alt"
          className={inputClass}
          value={value.altText}
          onChange={(e) => set({ altText: e.target.value })}
          placeholder="Descriere pentru cititoare de ecran"
        />
      </div>

      <div>
        <label htmlFor="video-titlu" className={labelClass}>
          Titlu
        </label>
        <input
          id="video-titlu"
          className={inputClass}
          value={value.titlu}
          onChange={(e) => set({ titlu: e.target.value })}
          placeholder="ex. Povestea acceleratorului"
        />
      </div>

      <div>
        <label htmlFor="video-descriere" className={labelClass}>
          Descriere
        </label>
        <textarea
          id="video-descriere"
          rows={3}
          className={inputClass}
          value={value.descriere}
          onChange={(e) => set({ descriere: e.target.value })}
          placeholder="Context scurt afișat deasupra player-ului"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="video-legenda" className={labelClass}>
            Legendă video
          </label>
          <input
            id="video-legenda"
            className={inputClass}
            value={value.legenda}
            onChange={(e) => set({ legenda: e.target.value })}
            placeholder="ex. Filmat la demo day, 2024"
          />
        </div>
        <div>
          <label htmlFor="video-credit" className={labelClass}>
            Credit / Sursă
          </label>
          <input
            id="video-credit"
            className={inputClass}
            value={value.credit}
            onChange={(e) => set({ credit: e.target.value })}
            placeholder="ex. Video: Crestem ONG"
          />
        </div>
      </div>

      <div>
        <span className={labelClass}>Lățime player</span>
        <SegmentedControl
          ariaLabel="Lățime player"
          value={value.latime}
          onChange={(latime) => set({ latime })}
          options={[
            { value: "compacta", label: "Compactă" },
            { value: "standard", label: "Standard" },
            { value: "lata", label: "Lată" },
            { value: "full", label: "Full width" },
          ]}
        />
      </div>

      <div>
        <span className={labelClass}>Raport</span>
        <SegmentedControl
          ariaLabel="Raport"
          value={value.raport}
          onChange={(raport) => set({ raport })}
          options={[
            { value: "16:9", label: "16:9" },
            { value: "4:3", label: "4:3" },
            { value: "original", label: "Original" },
          ]}
        />
        {value.raport === "original" && value.sursaTip !== "fisier" && (
          <p className={hintClass}>
            Pentru YouTube/Vimeo, „Original” revine la 16:9 (embed-ul nu are
            raport intrinsec).
          </p>
        )}
      </div>

      <fieldset className="space-y-3">
        <legend className={labelClass}>Opțiuni player</legend>
        {(
          [
            { key: "autoplay", label: "Autoplay" },
            { key: "controale", label: "Afișează controalele" },
            { key: "loop", label: "Loop" },
            { key: "mut", label: "Mut" },
          ] as const
        ).map(({ key, label }) => {
          // A local <video> without controls can't be started or paused, so the
          // toggle is forced on and locked for file sources.
          const lockedOn = key === "controale" && value.sursaTip === "fisier";
          return (
            <div
              key={key}
              className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3"
            >
              <span className="text-sm font-semibold text-[#162040]">
                {label}
              </span>
              <Toggle
                ariaLabel={label}
                checked={lockedOn ? true : value[key]}
                disabled={lockedOn}
                onChange={(next) => set({ [key]: next } as Partial<VideoData>)}
              />
            </div>
          );
        })}
        {errors.controale && <p className={errorClass}>{errors.controale}</p>}
        {value.autoplay && !value.mut && (
          <p className={hintClass}>
            Browserele pornesc autoplay doar dacă video-ul e și „Mut” — va fi
            redat fără sunet.
          </p>
        )}
      </fieldset>
    </div>
  );
}
