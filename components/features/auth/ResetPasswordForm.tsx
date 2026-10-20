"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { resetPassword } from "@/lib/api/auth";
import { parseApiError } from "@/lib/api/client";
import { PasswordInput } from "./PasswordInput";
import {
  PASSWORDS_MATCH_ERROR,
  PASSWORD_RULES_HINT,
  confirmedPasswordSchema,
  passwordSchema,
  passwordsMatch,
} from "@/lib/validation/password";

const resetSchema = z
  .object({
    password: passwordSchema,
    confirmedPassword: confirmedPasswordSchema,
  })
  .refine(passwordsMatch, PASSWORDS_MATCH_ERROR);

type ResetFormValues = z.infer<typeof resetSchema>;

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#00d495]/30 focus:border-[#007d58] transition-colors bg-white text-sm";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [apiError, setApiError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmedPassword: "" },
  });

  if (!token) {
    return (
      <div className="bg-white rounded-2xl border border-border shadow-sm p-8 text-center">
        <AlertCircle size={32} className="mx-auto mb-3" style={{ color: "#b91c1c" }} />
        <h2 className="font-heading font-bold text-lg mb-2" style={{ color: "#1c1c81" }}>
          Link invalid
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Linkul de resetare este incomplet sau invalid. Verifică linkul din email
          sau cere unul nou.
        </p>
        <Link
          href="/parola-uitata"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:brightness-90"
          style={{ background: "#00d495", boxShadow: "0 4px 16px rgba(0,212,149,0.3)" }}
        >
          Cere un link nou
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-border shadow-sm p-10 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: "rgba(0,212,149,0.12)" }}
        >
          <CheckCircle size={32} style={{ color: "#007d58" }} />
        </div>
        <h2 className="mb-2 font-heading font-extrabold text-xl" style={{ color: "#1c1c81" }}>
          Parola a fost schimbată!
        </h2>
        <p className="text-muted-foreground mb-6">Te poți autentifica acum cu noua parolă.</p>
        <Link
          href="/autentificare"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:brightness-90"
          style={{ background: "#00d495", boxShadow: "0 4px 16px rgba(0,212,149,0.3)" }}
        >
          Mergi la autentificare
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: ResetFormValues) => {
    setApiError(null);
    try {
      await resetPassword({
        token,
        password: data.password,
        confirmedPassword: data.confirmedPassword,
      });
      setDone(true);
    } catch (err) {
      const { message, fieldErrors } = parseApiError(
        err,
        "Nu am putut reseta parola. Încearcă din nou.",
      );
      for (const [field, fieldMessage] of Object.entries(fieldErrors)) {
        if (field === "password" || field === "confirmedPassword") {
          setError(field, { message: fieldMessage });
        }
      }
      // An expired or already-used token has no input to attach to.
      setApiError(message || fieldErrors.token || null);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="bg-white rounded-2xl border border-border shadow-sm p-8 space-y-5"
    >
      {apiError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl p-4 text-sm"
          style={{ background: "#fff5f5", border: "1.5px solid #fca5a5", color: "#b91c1c" }}
        >
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          {apiError}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
          Parolă nouă
        </label>
        <PasswordInput
          autoComplete="new-password"
          placeholder="Min. 8 caractere"
          className={inputClass}
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-1 text-xs" style={{ color: "#b91c1c" }}>
            {errors.password.message}
          </p>
        )}
        <p className="mt-1.5 text-xs text-muted-foreground">{PASSWORD_RULES_HINT}</p>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
          Confirmă parola
        </label>
        <PasswordInput
          autoComplete="new-password"
          placeholder="Repetă parola"
          className={inputClass}
          {...register("confirmedPassword")}
        />
        {errors.confirmedPassword && (
          <p className="mt-1 text-xs" style={{ color: "#b91c1c" }}>
            {errors.confirmedPassword.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white transition-all hover:brightness-90 disabled:opacity-60"
        style={{ background: "#00d495", boxShadow: "0 4px 16px rgba(0,212,149,0.3)" }}
      >
        {isSubmitting && <Loader2 size={18} className="animate-spin" />}
        Salvează parola nouă
      </button>
    </form>
  );
}
