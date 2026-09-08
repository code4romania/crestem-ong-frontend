"use client";

import { ImagePlus, Loader2 } from "lucide-react";
import { getMediaUrl } from "@/lib/api/client";
import { usePageImageUpload } from "../../upload";
import { FEATURE_ICONS } from "./icons";
import {
  FEATURE_ICON_KEYS,
  type FeatureCardIconImage,
  type FeatureIconKey,
} from "./schema";

/**
 * The "Pictogramă" field for a feature card. Two mutually exclusive modes:
 * pick from the site's fixed icon collection (a 6-column grid), or upload a
 * custom image that replaces the icon in the same chip. An uploaded image wins;
 * removing it returns the card to preset mode.
 */
export function IconPicker({
  value,
  onChange,
  iconImage,
  onIconImageChange,
}: {
  value: FeatureIconKey;
  onChange: (next: FeatureIconKey) => void;
  iconImage: FeatureCardIconImage | null;
  onIconImageChange: (next: FeatureCardIconImage | null) => void;
}) {
  const {
    onFileInputChange,
    isUploading,
    error: uploadError,
    fileInputRef,
  } = usePageImageUpload((image) => onIconImageChange(image));

  return (
    <div className="space-y-3">
      {iconImage ? (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-white p-2 pl-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getMediaUrl(iconImage.url)}
              alt=""
              className="h-full w-full object-cover"
            />
          </span>
          <span className="truncate text-sm text-[#475569]">
            {iconImage.name || "imagine"}
          </span>
          <span className="ml-auto flex shrink-0 items-center gap-4 pr-1">
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
              onClick={() => onIconImageChange(null)}
              className="text-sm font-semibold text-[#ef4444] hover:opacity-80"
            >
              Elimină
            </button>
          </span>
        </div>
      ) : (
        <>
          <div
            role="radiogroup"
            aria-label="Pictogramă"
            className="grid grid-cols-6 gap-2"
          >
            {FEATURE_ICON_KEYS.map((key) => {
              const Icon = FEATURE_ICONS[key];
              const selected = key === value;
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={key}
                  onClick={() => onChange(key)}
                  className={`flex aspect-square items-center justify-center rounded-xl border-2 transition-colors ${
                    selected
                      ? "border-[#2563eb] bg-[#eef1fd] text-[#2563eb]"
                      : "border-slate-200 bg-white text-[#475569] hover:border-slate-300"
                  }`}
                >
                  <Icon size={18} />
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm font-semibold text-[#475569] transition-colors hover:border-[#2dbe8f] hover:text-[#162040] disabled:opacity-60"
          >
            {isUploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ImagePlus size={16} />
            )}
            {isUploading ? "Se încarcă..." : "Încarcă imagine proprie"}
          </button>

          <button
            type="button"
            disabled
            title="În curând"
            className="text-xs font-semibold text-[#94a3b8]"
          >
            Alege din Media Library · în curând
          </button>
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileInputChange}
      />
      {uploadError && <p className="text-xs text-[#ef4444]">{uploadError}</p>}
    </div>
  );
}
