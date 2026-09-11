"use client";

import { useState, useTransition } from "react";
import { Loader2, X } from "lucide-react";
import { updateFdscUserAction, uploadUserAvatarAction } from "@/lib/api/users-actions";
import { getMediaUrl } from "@/lib/api/client";
import type { Dimension } from "@/lib/api/dimensions";
import type { AdminUser } from "@/lib/api/users";
import { ROLE_BADGES } from "@/lib/roles";
import { sanitizeRichText } from "@/components/features/page-builder/rich-text/sanitize";
import { MentorProfileFields, type MentorProfileFieldsValue } from "./MentorProfileFields";
import { ModalOverlay } from "@/components/ui/ModalOverlay";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition-colors bg-white text-sm";

const disabledInputClass =
  "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 text-sm cursor-not-allowed";

export function EditFdscUserModal({
  user,
  dimensions,
  onClose,
}: {
  user: AdminUser;
  dimensions: Dimension[];
  onClose: () => void;
}) {
  const roleType = user.role?.type;
  const isMentor = roleType === "mentor";

  const [nume, setNume] = useState(user.nume ?? "");
  const [mentorFields, setMentorFields] = useState<MentorProfileFieldsValue>({
    bio: user.bio ?? "",
    ariiDeExpertiza: (user.ariiDeExpertiza ?? []).join(", "),
    selectedDimensions: user.dimensiuni ?? [],
    avatarFile: null,
    avatarRemoved: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const roleLabel = user.role ? ROLE_BADGES[user.role.type].label : "";

  const handleSubmit = () => {
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      try {
        if (!isMentor) {
          if (roleType !== "super-admin" && roleType !== "editor-fdsc") {
            setError("Acest tip de cont nu poate fi editat din acest ecran.");
            return;
          }
          const result = await updateFdscUserAction(user.documentId, {
            role: roleType,
            nume,
          });
          if (result.error || Object.keys(result.fieldErrors ?? {}).length > 0) {
            setFieldErrors(result.fieldErrors ?? {});
            setError(result.error ?? null);
            return;
          }
          onClose();
          return;
        }

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

        const result = await updateFdscUserAction(user.documentId, {
          role: "mentor",
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
    <ModalOverlay labelledBy="edit-fdsc-user-title">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4">
          <h2 id="edit-fdsc-user-title" className="font-heading font-extrabold text-lg" style={{ color: "#162040" }}>
            Editează {roleLabel.toLowerCase()}
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
            <label htmlFor="edit-fdsc-user-nume" className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
              Nume complet <span style={{ color: "#2563eb" }}>*</span>
            </label>
            <input
              id="edit-fdsc-user-nume"
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
            <label htmlFor="edit-fdsc-user-email" className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
              Adresă email
            </label>
            <input
              id="edit-fdsc-user-email"
              type="email"
              value={user.email}
              disabled
              className={disabledInputClass}
            />
            <p className="mt-1 text-xs text-muted-foreground">Adresa de email nu poate fi modificată.</p>
          </div>

          {isMentor && (
            <MentorProfileFields
              dimensions={dimensions}
              value={mentorFields}
              onChange={setMentorFields}
              existingAvatarUrl={user.avatar ? getMediaUrl(user.avatar.url) : null}
            />
          )}
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
