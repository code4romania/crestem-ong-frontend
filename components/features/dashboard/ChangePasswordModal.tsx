"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { changePasswordAction } from "@/lib/api/auth-actions";
import { PasswordInput } from "@/components/features/auth/PasswordInput";
import { ModalOverlay } from "@/components/ui/ModalOverlay";

/** Mirrors `changePasswordSchema` in the backend's auth validation. */
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Introdu parola curentă"),
    password: z
      .string()
      .min(8, "Parola trebuie să aibă minim 8 caractere")
      .regex(/[A-Z]/, "Parola trebuie să conțină cel puțin o literă mare")
      .regex(/[0-9]/, "Parola trebuie să conțină cel puțin o cifră")
      .regex(/[^A-Za-z0-9]/, "Parola trebuie să conțină cel puțin un caracter special"),
    confirmedPassword: z.string().min(1, "Câmp obligatoriu"),
  })
  .refine((data) => data.password === data.confirmedPassword, {
    message: "Parolele nu coincid",
    path: ["confirmedPassword"],
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

const passwordInputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#00d495]/30 focus:border-[#007d58] transition-colors disabled:opacity-60";

export function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", password: "", confirmedPassword: "" },
  });

  const onSubmit = (data: ChangePasswordValues) => {
    startTransition(async () => {
      const result = await changePasswordAction(data);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Parola a fost schimbată cu succes.");
      onClose();
    });
  };

  return (
    <ModalOverlay labelledBy="change-password-title">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col"
      >
        <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id="change-password-title" className="font-heading font-extrabold text-lg" style={{ color: "#1c1c81" }}>
              Schimbă parola
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Confirmă parola curentă, apoi alege una nouă.
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

        <div className="px-6 py-5 space-y-4 overflow-y-auto">
          <div>
            <label htmlFor="current-password" className="block text-xs font-semibold mb-1" style={{ color: "#475569" }}>
              Parola curentă
            </label>
            <PasswordInput
              id="current-password"
              className={passwordInputClass}
              disabled={isPending}
              autoFocus
              {...register("currentPassword")}
            />
            {errors.currentPassword && (
              <p className="mt-1 text-xs" style={{ color: "#b91c1c" }}>
                {errors.currentPassword.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="new-password" className="block text-xs font-semibold mb-1" style={{ color: "#475569" }}>
              Parola nouă
            </label>
            <PasswordInput
              id="new-password"
              className={passwordInputClass}
              disabled={isPending}
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 text-xs" style={{ color: "#b91c1c" }}>
                {errors.password.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-xs font-semibold mb-1" style={{ color: "#475569" }}>
              Confirmă parola nouă
            </label>
            <PasswordInput
              id="confirm-password"
              className={passwordInputClass}
              disabled={isPending}
              {...register("confirmedPassword")}
            />
            {errors.confirmedPassword && (
              <p className="mt-1 text-xs" style={{ color: "#b91c1c" }}>
                {errors.confirmedPassword.message}
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
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:brightness-90 transition-opacity disabled:opacity-70"
            style={{ background: "#00d495" }}
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {isPending ? "Se salvează..." : "Salvează parola"}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}
