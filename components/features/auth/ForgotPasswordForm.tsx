"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MailCheck, Loader2 } from "lucide-react";
import { forgotPassword } from "@/lib/api/auth";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Câmp obligatoriu")
    .email("Email invalid"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#00d495]/30 focus:border-[#007d58] transition-colors bg-white text-sm";

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  /**
   * The confirmation is deliberately identical whether the address has an
   * account, has none, or the request failed outright — anything else turns
   * this form into an account-enumeration oracle. The backend answers the same
   * way for the same reason.
   */
  const onSubmit = async (data: ForgotPasswordValues) => {
    try {
      await forgotPassword({ email: data.email });
    } catch {
      // Swallowed on purpose: see above.
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-border shadow-sm p-10 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: "rgba(0,212,149,0.12)" }}
        >
          <MailCheck size={32} style={{ color: "#007d58" }} />
        </div>
        <h2 className="mb-2 font-heading font-extrabold text-xl" style={{ color: "#1c1c81" }}>
          Verifică-ți emailul
        </h2>
        <p className="text-muted-foreground mb-6">
          Dacă există un cont cu această adresă, ți-am trimis un email cu pașii
          următori. Dacă nu ajunge în câteva minute, verifică și folderul de spam.
        </p>
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

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="bg-white rounded-2xl border border-border shadow-sm p-8 space-y-5"
    >
      <div>
        <label htmlFor="forgot-email" className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
          Email
        </label>
        <input
          id="forgot-email"
          type="email"
          autoComplete="email"
          placeholder="email@exemplu.ro"
          className={inputClass}
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-1 text-xs" style={{ color: "#b91c1c" }}>
            {errors.email.message}
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
        Trimite linkul de resetare
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Ți-ai amintit parola?{" "}
        <Link href="/autentificare" className="font-semibold" style={{ color: "#007d58" }}>
          Autentifică-te
        </Link>
      </p>
    </form>
  );
}
