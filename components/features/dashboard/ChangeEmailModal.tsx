"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, MailCheck, X } from "lucide-react";
import { toast } from "sonner";
import { requestEmailChangeAction } from "@/lib/api/auth-actions";
import { PasswordInput } from "@/components/features/auth/PasswordInput";
import { ModalOverlay } from "@/components/ui/ModalOverlay";

/** Mirrors `requestEmailChangeSchema` in the backend's auth validation. */
const changeEmailSchema = z.object({
  currentPassword: z.string().min(1, "Introdu parola curentă"),
  email: z
    .email("Adresă de email invalidă")
    .min(6, "Adresa de email este prea scurtă"),
});

type ChangeEmailValues = z.infer<typeof changeEmailSchema>;

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors disabled:opacity-60";

export function ChangeEmailModal({ onClose }: { onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState<{ email: string } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangeEmailValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { currentPassword: "", email: "" },
  });

  const onSubmit = (data: ChangeEmailValues) => {
    startTransition(async () => {
      const result = await requestEmailChangeAction(data);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      if (!result.emailSent) {
        toast.error(
          "Nu am putut trimite emailul de confirmare. Încearcă din nou mai târziu.",
        );
        return;
      }
      setSent({ email: data.email });
    });
  };

  return (
    <ModalOverlay labelledBy="change-email-title">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col">
        <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id="change-email-title" className="font-heading font-extrabold text-lg" style={{ color: "#162040" }}>
              Schimbă adresa de mail
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {sent
                ? "Ți-am trimis un email de confirmare pe noua adresă."
                : "Confirmă parola curentă, apoi introdu noua adresă."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Închide"
            className="text-muted-foreground hover:text-foreground shrink-0 disabled:opacity-60"
          >
            <X size={20} />
          </button>
        </div>

        {sent ? (
          <>
            <div className="px-6 py-5 space-y-4 overflow-y-auto">
              <div className="flex items-start gap-3">
                <MailCheck size={20} className="shrink-0 mt-0.5" style={{ color: "#2dbe8f" }} />
                <p className="text-sm" style={{ color: "#162040" }}>
                  Adresa va deveni{" "}
                  <span className="font-semibold">{sent.email}</span> după
                  confirmare. Până atunci te autentifici cu adresa actuală.
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                Ți-am trimis un email de confirmare la noua adresă. Dacă nu
                ajunge în câteva minute, verifică și folderul de spam.
              </p>
            </div>

            <div className="px-6 py-4 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors text-[#475569]"
              >
                Închide
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col min-h-0">
            <div className="px-6 py-5 space-y-4 overflow-y-auto">
              <div>
                <label htmlFor="email-change-password" className="block text-xs font-semibold mb-1" style={{ color: "#475569" }}>
                  Parola curentă
                </label>
                <PasswordInput
                  id="email-change-password"
                  className={inputClass}
                  disabled={isPending}
                  autoFocus
                  {...register("currentPassword")}
                />
                {errors.currentPassword && (
                  <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="email-change-address" className="block text-xs font-semibold mb-1" style={{ color: "#475569" }}>
                  Adresa nouă de email
                </label>
                <input
                  id="email-change-address"
                  type="email"
                  autoComplete="email"
                  className={inputClass}
                  disabled={isPending}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors text-[#475569] disabled:opacity-60"
              >
                Anulează
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-70"
                style={{ background: "#2dbe8f" }}
              >
                {isPending && <Loader2 size={14} className="animate-spin" />}
                {isPending ? "Se trimite..." : "Confirmă"}
              </button>
            </div>
          </form>
        )}
      </div>
    </ModalOverlay>
  );
}
