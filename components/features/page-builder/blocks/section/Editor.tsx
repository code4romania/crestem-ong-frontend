"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Toggle } from "@/components/ui/Toggle";
import { getMediaUrl } from "@/lib/api/client";
import { uploadPageImageAction } from "@/lib/api/page-blocks-actions";
import { BackgroundPicker } from "./BackgroundPicker";
import { SpacingRadioGroup } from "./SpacingRadioGroup";
import { slugifyAnchor, type SectionData } from "./schema";
import type { BlockFieldErrors } from "../../types";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors disabled:opacity-60";
const hintClass = "mt-1 text-xs text-[#94a3b8]";
const errorClass = "mt-1 text-xs text-[#ef4444]";
const optionalHint = "font-normal normal-case text-[#94a3b8]";

export function SectionEditor({
  value,
  onChange,
  errors,
}: {
  value: SectionData;
  onChange: (next: SectionData) => void;
  errors: BlockFieldErrors;
}) {
  const [isUploading, startUpload] = useTransition();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (patch: Partial<SectionData>) => onChange({ ...value, ...patch });

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploadError(null);
    startUpload(async () => {
      const form = new FormData();
      form.append("files", file);
      const result = await uploadPageImageAction(form);
      if (result.error || !result.image) {
        setUploadError(result.error ?? "Nu am putut încărca imaginea.");
        return;
      }
      set({ imagine: result.image });
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="section-nume-intern" className={labelClass}>
          Nume intern{" "}
          <span className={optionalHint}>(vizibil doar în CMS)</span>
        </label>
        <input
          id="section-nume-intern"
          className={inputClass}
          value={value.numeIntern}
          onChange={(e) => set({ numeIntern: e.target.value })}
          placeholder="Despre program"
        />
        <p className={hintClass}>
          Nu apare pe site-ul public. Folosit pentru organizarea paginilor lungi.
        </p>
      </div>

      <div>
        <span className={labelClass}>Fundal</span>
        <BackgroundPicker
          value={value.fundal}
          onChange={(fundal) => set({ fundal })}
        />
      </div>

      {value.fundal === "imagine" && (
        <div>
          <span className={labelClass}>Imagine</span>
          {value.imagine ? (
            <div className="overflow-hidden rounded-xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getMediaUrl(value.imagine.url)}
                alt=""
                className="h-48 w-full object-cover"
              />
              <div className="flex items-center justify-between gap-3 border-t border-border bg-white px-4 py-2.5">
                <span className="truncate text-sm text-[#475569]">
                  {value.imagine.name || "imagine"}
                </span>
                <span className="flex shrink-0 items-center gap-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="text-sm font-semibold text-[#2563eb] hover:opacity-80 disabled:opacity-60"
                  >
                    {isUploading ? "Se încarcă..." : "Schimbă imaginea"}
                  </button>
                  <button
                    type="button"
                    onClick={() => set({ imagine: null })}
                    className="text-sm font-semibold text-[#ef4444] hover:opacity-80"
                  >
                    Elimină imaginea
                  </button>
                </span>
              </div>
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
                <ImagePlus size={20} />
              )}
              {isUploading ? "Se încarcă..." : "Selectează imagine"}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
          {errors.imagine && <p className={errorClass}>{errors.imagine}</p>}
          {uploadError && <p className={errorClass}>{uploadError}</p>}

          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
            <span>
              <span className="block text-sm font-semibold text-[#162040]">
                Overlay pentru lizibilitate
              </span>
              <span className="block text-xs text-[#94a3b8]">
                Adaugă un strat semi-transparent pentru contrast
              </span>
            </span>
            <Toggle
              ariaLabel="Overlay pentru lizibilitate"
              checked={value.overlay}
              onChange={(overlay) => set({ overlay })}
            />
          </div>
        </div>
      )}

      <div>
        <span className={labelClass}>Lățime conținut</span>
        <SegmentedControl
          ariaLabel="Lățime conținut"
          value={value.latimeContinut}
          onChange={(latimeContinut) => set({ latimeContinut })}
          options={[
            { value: "compacta", label: "Compactă" },
            { value: "standard", label: "Standard" },
            { value: "lata", label: "Lată" },
            { value: "full", label: "Full width" },
          ]}
        />
        <p className={hintClass}>
          Definește lățimea conținutului interior, nu al fundalului.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SpacingRadioGroup
          name="section-spatiere-sus"
          legend="Spațiere sus"
          value={value.spatiereSus}
          onChange={(spatiereSus) => set({ spatiereSus })}
        />
        <SpacingRadioGroup
          name="section-spatiere-jos"
          legend="Spațiere jos"
          value={value.spatiereJos}
          onChange={(spatiereJos) => set({ spatiereJos })}
        />
      </div>

      <div>
        <label htmlFor="section-id" className={labelClass}>
          Id secțiune / anchor <span className={optionalHint}>(opțional)</span>
        </label>
        <input
          id="section-id"
          className={inputClass}
          value={value.idSectiune}
          onChange={(e) => set({ idSectiune: slugifyAnchor(e.target.value) })}
          placeholder="eligibilitate"
        />
        <p className={hintClass}>
          Poate fi utilizat pentru linkuri către această secțiune din aceeași
          pagină.
        </p>
      </div>
    </div>
  );
}
