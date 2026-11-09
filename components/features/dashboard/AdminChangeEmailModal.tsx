"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, MailCheck, X } from "lucide-react";
import { toast } from "sonner";
import { userDisplayName } from "@/lib/api/auth";
import type { AdminUser } from "@/lib/api/users";
import { changeMentorEmailAction } from "@/lib/api/users-actions";
import { ModalOverlay } from "@/components/ui/ModalOverlay";

const changeEmailSchema = z.object({
  email: z
    .email("Adresă de email invalidă")
    .min(6, "Adresa de email este prea scurtă"),
});

type ChangeEmailValues = z.infer<typeof changeEmailSchema>;

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#00d495]/30 focus:border-[#007d58] transition-colors disabled:opacity-60";

type Mode = "invite-resent" | "confirmation-sent";

/** The administrator changes a "persoană resursă" email — no password step. */
export function AdminChangeEmailModal({
  user,
  onClose,
}: {
  user: AdminUser;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState<{ email: string; mode: Mode } | null>(null);
  const isPendingAccount = user.accountStatus === "pending";
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ChangeEmailValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { email: "" },
  });

  // The list shows stale data until the route is re-fetched.
  const handleClose = () => {
    if (sent) router.refresh();
    onClose();
  };

  const onSubmit = (data: ChangeEmailValues) => {
    startTransition(async () => {
      const result = await changeMentorEmailAction(user.documentId, data.email);
      if (result.fieldErrors?.email) {
        setError("email", { message: result.fieldErrors.email });
        return;
      }
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setSent({ email: data.email, mode: result.mode ?? "confirmation-sent" });
    });
  };

  return (
    <ModalOverlay labelledBy="admin-change-email-title">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col">
        <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id="admin-change-email-title" className="font-heading font-extrabold text-lg" style={{ color: "#1c1c81" }}>
              Schimbă emailul
            </h2>
            <p className="mt-1 text-sm text-muted-foreground wrap-break-word">
              {userDisplayName(user)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
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
                <MailCheck size={20} className="shrink-0 mt-0.5" style={{ color: "#007d58" }} />
                <p className="text-sm wrap-break-word" style={{ color: "#1c1c81" }}>
                  {sent.mode === "invite-resent" ? (
                    <>
                      Adresa a fost schimbată în{" "}
                      <span className="font-semibold">{sent.email}</span>, iar
                      invitația a fost retrimisă acolo.
                    </>
                  ) : (
                    <>
                      Am trimis un link de confirmare la{" "}
                      <span className="font-semibold">{sent.email}</span>. Până
                      când persoana îl confirmă, contul rămâne pe adresa
                      actuală.
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border">
              <button
                type="button"
                onClick={handleClose}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors text-[#475569]"
              >
                Închide
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col min-h-0">
            <div className="px-6 py-5 space-y-4 overflow-y-auto">
              <p className="text-sm text-muted-foreground">
                {isPendingAccount
                  ? "Adresa se schimbă imediat și invitația se retrimite pe noua adresă."
                  : "Persoana va primi pe noua adresă un link de confirmare valabil 7 zile. Până confirmă, contul rămâne pe adresa actuală."}
              </p>
              <div>
                <p className="block text-xs font-semibold mb-1" style={{ color: "#475569" }}>
                  Adresa curentă
                </p>
                <p className="text-sm wrap-break-word" style={{ color: "#1c1c81" }}>
                  {user.email}
                </p>
              </div>
              <div>
                <label htmlFor="admin-email-change-address" className="block text-xs font-semibold mb-1" style={{ color: "#475569" }}>
                  Adresa nouă de email
                </label>
                <input
                  id="admin-email-change-address"
                  type="email"
                  autoComplete="off"
                  autoFocus
                  className={inputClass}
                  disabled={isPending}
                  aria-invalid={errors.email ? true : undefined}
                  {...register("email")}
                />
                {errors.email && (
                  <p role="alert" className="mt-1 text-xs" style={{ color: "#b91c1c" }}>
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border flex items-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors text-[#475569] disabled:opacity-60"
              >
                Anulează
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:brightness-90 transition-opacity disabled:opacity-70"
                style={{ background: "#00d495" }}
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
