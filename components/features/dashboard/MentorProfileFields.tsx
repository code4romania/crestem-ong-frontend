"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, DragEvent, MouseEvent } from "react";
import { Upload, X } from "lucide-react";
import type { Dimension } from "@/lib/api/dimensions";
import { RichTextField } from "@/components/features/page-builder/rich-text/RichTextField";

const ACCEPTED_AVATAR_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors bg-white text-sm";

export interface MentorProfileFieldsValue {
  bio: string;
  ariiDeExpertiza: string;
  selectedDimensions: string[];
  avatarFile: File | null;
  /** True once the user has explicitly removed the existing avatar (edit mode only). */
  avatarRemoved: boolean;
}

export function MentorProfileFields({
  dimensions,
  value,
  onChange,
  existingAvatarUrl,
}: {
  dimensions: Dimension[];
  value: MentorProfileFieldsValue;
  onChange: (value: MentorProfileFieldsValue) => void;
  existingAvatarUrl?: string | null;
}) {
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);

  const avatarPreviewUrl = useMemo(
    () => (value.avatarFile ? URL.createObjectURL(value.avatarFile) : null),
    [value.avatarFile],
  );

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  const displayedAvatarUrl =
    avatarPreviewUrl ?? (!value.avatarRemoved ? (existingAvatarUrl ?? null) : null);

  const processAvatarFile = (file: File | null) => {
    setAvatarError(null);
    if (!file) {
      onChange({ ...value, avatarFile: null });
      return;
    }
    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError("Format neacceptat. Folosește PNG, JPG sau WebP.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("Fișierul este prea mare. Dimensiunea maximă este 2MB.");
      return;
    }
    onChange({ ...value, avatarFile: file, avatarRemoved: false });
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    processAvatarFile(e.target.files?.[0] ?? null);
  };

  const handleAvatarDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDraggingAvatar(false);
    processAvatarFile(e.dataTransfer.files?.[0] ?? null);
  };

  const handleRemoveAvatar = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setAvatarError(null);
    onChange({ ...value, avatarFile: null, avatarRemoved: true });
  };

  const toggleDimension = (key: string) => {
    onChange({
      ...value,
      selectedDimensions: value.selectedDimensions.includes(key)
        ? value.selectedDimensions.filter((k) => k !== key)
        : [...value.selectedDimensions, key],
    });
  };

  return (
    <>
      <div>
        <p className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
          Poză de profil
        </p>
        <div className="relative">
          <label
            htmlFor="fdsc-user-avatar"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingAvatar(true);
            }}
            onDragLeave={() => setIsDraggingAvatar(false)}
            onDrop={handleAvatarDrop}
            className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-6 text-center cursor-pointer transition-colors ${
              isDraggingAvatar
                ? "border-[#2dbe8f] bg-[#2dbe8f]/5"
                : "border-border bg-slate-50 hover:bg-slate-100"
            }`}
          >
            {displayedAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayedAvatarUrl}
                alt="Previzualizare poză de profil"
                className="h-14 w-14 rounded-full object-cover border border-border"
              />
            ) : (
              <Upload size={18} className="text-muted-foreground" />
            )}
            <p className="text-xs font-medium" style={{ color: "#162040" }}>
              {value.avatarFile ? value.avatarFile.name : "Trage și plasează o poză aici sau click pentru a încărca"}
            </p>
            <p className="text-xs text-muted-foreground">PNG, JPG sau WebP. Maxim 2MB.</p>
            <input
              id="fdsc-user-avatar"
              type="file"
              accept={ACCEPTED_AVATAR_TYPES.join(",")}
              onChange={handleAvatarChange}
              className="sr-only"
            />
          </label>
          {displayedAvatarUrl && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              aria-label="Elimină poza"
              className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-border text-muted-foreground hover:text-[#ef4444] hover:border-[#fca5a5] transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
        {avatarError && <p className="mt-1.5 text-xs" style={{ color: "#ef4444" }}>{avatarError}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
          Bio
        </label>
        <RichTextField
          value={value.bio}
          onChange={(bio) => onChange({ ...value, bio })}
        />
      </div>

      <div>
        <p className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
          Specializare pe dimensiuni
        </p>
        <div className="flex flex-wrap gap-2">
          {dimensions.map((dimension) => {
            const selected = value.selectedDimensions.includes(dimension.key);
            return (
              <button
                key={dimension.key}
                type="button"
                onClick={() => toggleDimension(dimension.key)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
                style={
                  selected
                    ? { background: "#2dbe8f", borderColor: "#2dbe8f", color: "#fff" }
                    : { background: "#fff", borderColor: "#e2e8f0", color: "#475569" }
                }
              >
                {dimension.name}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="fdsc-user-arii" className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
          Arii de expertiză
        </label>
        <input
          id="fdsc-user-arii"
          type="text"
          className={inputClass}
          value={value.ariiDeExpertiza}
          onChange={(e) => onChange({ ...value, ariiDeExpertiza: e.target.value })}
          placeholder="separate prin virgulă"
        />
      </div>
    </>
  );
}
