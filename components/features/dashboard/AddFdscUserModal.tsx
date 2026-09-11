"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, Loader2, PenSquare, ShieldCheck, UserCog, X } from "lucide-react";
import { createFdscUserAction, uploadUserAvatarAction } from "@/lib/api/users-actions";
import type { Dimension } from "@/lib/api/dimensions";
import { hasRichText, sanitizeRichText } from "@/components/features/page-builder/rich-text/sanitize";
import { MentorProfileFields, type MentorProfileFieldsValue } from "./MentorProfileFields";
import { ModalOverlay } from "@/components/ui/ModalOverlay";

type StaffRole = "super-admin" | "editor-fdsc";
type PickableRole = "mentor" | StaffRole;

const ROLE_CARDS: { role: PickableRole; label: string; icon: typeof UserCog }[] = [
  {
    role: "mentor",
    label: "Persoană resursă",
    icon: UserCog,
  },
  {
    role: "super-admin",
    label: "Admin FDSC",
    icon: ShieldCheck,
  },
  {
    role: "editor-fdsc",
    label: "Editor FDSC",
    icon: PenSquare,
  },
];

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors bg-white text-sm";

export function AddFdscUserModal({ dimensions, onClose }: { dimensions: Dimension[]; onClose: () => void }) {
  const [role, setRole] = useState<PickableRole | null>(null);
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

  const handleBack = () => {
    setError(null);
    setFieldErrors({});
    setRole(null);
  };

  const handleSubmit = () => {
    if (!role) return;
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      try {
        if (role !== "mentor") {
          const result = await createFdscUserAction({ role, nume, email });
          if (result.error || Object.keys(result.fieldErrors ?? {}).length > 0) {
            setFieldErrors(result.fieldErrors ?? {});
            setError(result.error ?? null);
            return;
          }
          onClose();
          return;
        }

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
          ...(hasRichText(mentorFields.bio) ? { bio: sanitizeRichText(mentorFields.bio) } : {}),
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
        onClose();
      } catch {
        setError("A apărut o eroare neașteptată. Încearcă din nou.");
      }
    });
  };

  const roleLabel = ROLE_CARDS.find((c) => c.role === role)?.label ?? "";

  return (
    <ModalOverlay labelledBy="add-fdsc-user-title">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            {role && (
              <button
                type="button"
                onClick={handleBack}
                aria-label="Înapoi"
                disabled={isPending}
                className="text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <h2 id="add-fdsc-user-title" className="font-heading font-extrabold text-lg" style={{ color: "#162040" }}>
              {role ? roleLabel : "Adaugă utilizator"}
            </h2>
          </div>
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

          {!role && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Alege tipul de cont pe care vrei să îl creezi.</p>
              {ROLE_CARDS.map((card) => (
                <button
                  key={card.role}
                  type="button"
                  onClick={() => setRole(card.role)}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-[#2dbe8f] hover:bg-[#2dbe8f]/5 transition-colors text-left"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "rgba(45,190,143,0.12)" }}
                  >
                    <card.icon size={18} style={{ color: "#2dbe8f" }} />
                  </div>
                  <p className="font-semibold" style={{ color: "#162040" }}>{card.label}</p>
                </button>
              ))}
            </div>
          )}

          {role && (
            <>
              <div>
                <label htmlFor="fdsc-user-nume" className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
                  Nume complet <span style={{ color: "#2dbe8f" }}>*</span>
                </label>
                <input
                  id="fdsc-user-nume"
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
                <label htmlFor="fdsc-user-email" className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
                  Adresă email <span style={{ color: "#2dbe8f" }}>*</span>
                </label>
                <input
                  id="fdsc-user-email"
                  type="email"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ion.popescu@fdsc.ro"
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>{fieldErrors.email}</p>
                )}
              </div>

              {role === "mentor" && (
                <MentorProfileFields
                  dimensions={dimensions}
                  value={mentorFields}
                  onChange={setMentorFields}
                />
              )}

              <p className="text-xs text-muted-foreground">
                Utilizatorul va primi o invitație pe email pentru a-și activa contul.
              </p>
            </>
          )}
        </div>

        {role && (
          <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={isPending} className="px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors disabled:opacity-50 text-[#475569]">
              Anulează
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || !nume.trim() || !email.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-70"
              style={{ background: "#2dbe8f" }}
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              {isPending ? "Se trimite..." : "Trimite invitația"}
            </button>
          </div>
        )}
      </div>
    </ModalOverlay>
  );
}
