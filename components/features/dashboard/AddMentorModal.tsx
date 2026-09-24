"use client";

import { toast } from "sonner";
import { useState, useTransition } from "react";
import { Loader2, X } from "lucide-react";
import { createFdscUserAction, uploadUserAvatarAction } from "@/lib/api/users-actions";
import type { Dimension } from "@/lib/api/dimensions";
import { hasRichText } from "@/components/features/page-builder/rich-text/has-rich-text";
import { MentorProfileFields, type MentorProfileFieldsValue } from "./MentorProfileFields";
import { ModalOverlay } from "@/components/ui/ModalOverlay";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#00d495]/30 focus:border-[#007d58] transition-colors bg-white text-sm";

export function AddMentorModal({ dimensions, onClose }: { dimensions: Dimension[]; onClose: () => void }) {
  const [nume, setNume] = useState("");
  const [email, setEmail] = useState("");
  const [mentorFields, setMentorFields] = useState<MentorProfileFieldsValue>({
    bio: "",
    ariiDeExpertiza: "",
    selectedDimensions: [],
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
        let avatarId: number | undefined;
        if (mentorFields.avatarFile) {
          const form = new FormData();
          form.append("files", mentorFields.avatarFile);
          const uploadResult = await uploadUserAvatarAction(form);
          if (uploadResult.error) {
            setError(uploadResult.error);
            return;
          }
          avatarId = uploadResult.id;
        }

        const ariiParsed = mentorFields.ariiDeExpertiza
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean);

        const result = await createFdscUserAction({
          role: "mentor",
          nume,
          email,
          ...(hasRichText(mentorFields.bio) ? { bio: mentorFields.bio } : {}),
          ...(avatarId !== undefined ? { avatar: avatarId } : {}),
          ...(mentorFields.selectedDimensions.length > 0
            ? { dimensiuni: mentorFields.selectedDimensions }
            : {}),
          ...(ariiParsed.length > 0 ? { ariiDeExpertiza: ariiParsed } : {}),
        });
        if (result.error || Object.keys(result.fieldErrors ?? {}).length > 0) {
          setFieldErrors(result.fieldErrors ?? {});
          setError(result.error ?? null);
          return;
        }
        toast.success("Persoana resursă a fost creată.");
        onClose();
      } catch {
        setError("A apărut o eroare neașteptată. Încearcă din nou.");
      }
    });
  };

  return (
    <ModalOverlay labelledBy="add-mentor-title">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4">
          <h2 id="add-mentor-title" className="font-heading font-extrabold text-lg" style={{ color: "#1c1c81" }}>
            Persoană resursă
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
            <p role="alert" className="rounded-lg px-3 py-2 text-sm bg-[#fff5f5] border-[1.5px] border-[#fca5a5] text-[#b91c1c]">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="mentor-nume" className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
              Nume complet <span style={{ color: "#007d58" }}>*</span>
            </label>
            <input
              id="mentor-nume"
              type="text"
              className={inputClass}
              value={nume}
              onChange={(e) => setNume(e.target.value)}
              placeholder="ex. Ion Popescu"
            />
            {fieldErrors.nume && (
              <p className="mt-1 text-xs" style={{ color: "#b91c1c" }}>{fieldErrors.nume}</p>
            )}
          </div>

          <div>
            <label htmlFor="mentor-email" className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
              Adresă email <span style={{ color: "#007d58" }}>*</span>
            </label>
            <input
              id="mentor-email"
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ion.popescu@fdsc.ro"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs" style={{ color: "#b91c1c" }}>{fieldErrors.email}</p>
            )}
          </div>

          <MentorProfileFields dimensions={dimensions} value={mentorFields} onChange={setMentorFields} />

          <p className="text-xs text-muted-foreground">
            Utilizatorul va primi o invitație pe email pentru a-și activa contul.
          </p>
        </div>

        <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={isPending} className="px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors disabled:opacity-50 text-[#475569]">
            Anulează
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !nume.trim() || !email.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:brightness-90 transition-opacity disabled:opacity-70"
            style={{ background: "#00d495" }}
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {isPending ? "Se trimite..." : "Trimite invitația"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
