"use client";

import { useState, useTransition } from "react";
import { Loader2, X } from "lucide-react";
import { updateMentorProfileAction, uploadUserAvatarAction } from "@/lib/api/users-actions";
import { sanitizeRichText } from "@/components/features/page-builder/rich-text/sanitize";
import { getMediaUrl } from "@/lib/api/client";
import type { Dimension } from "@/lib/api/dimensions";
import type { MentorProfile } from "@/lib/api/mentor-profile";
import { MentorProfileFields, type MentorProfileFieldsValue } from "./MentorProfileFields";
import { ModalOverlay } from "@/components/ui/ModalOverlay";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition-colors bg-white text-sm";

const disabledInputClass =
  "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 text-sm cursor-not-allowed";

export function EditMentorProfileModal({
  profile,
  dimensions,
  onClose,
}: {
  profile: MentorProfile;
  dimensions: Dimension[];
  onClose: () => void;
}) {
  const [nume, setNume] = useState(profile.nume ?? "");
  const [mentorFields, setMentorFields] = useState<MentorProfileFieldsValue>({
    bio: profile.bio ?? "",
    ariiDeExpertiza: (profile.ariiDeExpertiza ?? []).join(", "),
    selectedDimensions: profile.dimensiuni ?? [],
    avatarFile: null,
    avatarRemoved: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      try {
        let avatarId: number | null | undefined;
        if (mentorFields.avatarFile) {
          const form = new FormData();
          form.append("files", mentorFields.avatarFile);
          const uploadResult = await uploadUserAvatarAction(form);
          if (uploadResult.error) {
            setError(uploadResult.error);
            return;
          }
          avatarId = uploadResult.id;
        } else if (mentorFields.avatarRemoved) {
          avatarId = null;
        }

        const ariiParsed = mentorFields.ariiDeExpertiza
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean);

        const result = await updateMentorProfileAction({
          nume,
          bio: sanitizeRichText(mentorFields.bio),
          ...(avatarId !== undefined ? { avatar: avatarId } : {}),
          dimensiuni: mentorFields.selectedDimensions,
          ariiDeExpertiza: ariiParsed,
        });
        if (result.error || Object.keys(result.fieldErrors ?? {}).length > 0) {
          setFieldErrors(result.fieldErrors ?? {});
          setError(result.error ?? null);
          return;
        }
        onClose();
      } catch {
        setError("A apărut o eroare neașteptată. Încearcă din nou.");
      }
    });
  };

  return (
    <ModalOverlay labelledBy="edit-mentor-profile-title">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4">
          <h2
            id="edit-mentor-profile-title"
            className="font-heading font-extrabold text-lg"
            style={{ color: "#162040" }}
          >
            Editează profilul
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Închide"
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto">
          {error && (
            <p role="alert" className="rounded-lg px-3 py-2 text-sm bg-[#fff5f5] border-[1.5px] border-[#fca5a5] text-[#ef4444]">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="edit-mentor-profile-nume" className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
              Nume complet <span style={{ color: "#2563eb" }}>*</span>
            </label>
            <input
              id="edit-mentor-profile-nume"
              type="text"
              className={inputClass}
              value={nume}
              onChange={(e) => setNume(e.target.value)}
              placeholder="ex. Ion Popescu"
            />
            {fieldErrors.nume && (
              <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>{fieldErrors.nume}</p>
            )}
          </div>

          <div>
            <label htmlFor="edit-mentor-profile-email" className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
              Adresă email
            </label>
            <input
              id="edit-mentor-profile-email"
              type="email"
              value={profile.email}
              disabled
              className={disabledInputClass}
            />
            <p className="mt-1 text-xs text-muted-foreground">Adresa de email nu poate fi modificată aici.</p>
          </div>

          <MentorProfileFields
            dimensions={dimensions}
            value={mentorFields}
            onChange={setMentorFields}
            existingAvatarUrl={profile.avatar ? getMediaUrl(profile.avatar.url) : null}
          />
        </div>

        <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={isPending} className="px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors disabled:opacity-50 text-[#475569]">
            Anulează
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !nume.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-70"
            style={{ background: "#2563eb" }}
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {isPending ? "Se salvează..." : "Salvează"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
