"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { registerIndividual } from "@/lib/api/auth";
import { ApiError, isZodFlattenError } from "@/lib/api/client";
import { PasswordInput } from "./PasswordInput";
import { TermsCheckbox } from "./TermsCheckbox";
import {
  PASSWORDS_MATCH_ERROR,
  confirmedPasswordSchema,
  passwordSchema,
  passwordsMatch,
} from "@/lib/validation/password";

const registerIndividualSchema = z
  .object({
    nume: z.string().trim().min(3, "Numele trebuie să aibă minim 3 caractere"),
    telefon: z.string().trim(),
    email: z.string().trim().min(1, "Câmp obligatoriu").email("Email invalid"),
    password: passwordSchema,
    confirmedPassword: confirmedPasswordSchema,
    acordTermeniSiConditii: z
      .boolean()
      .refine((v) => v === true, { message: "Este necesar acordul tău pentru a continua" }),
  })
  .refine(passwordsMatch, PASSWORDS_MATCH_ERROR);

type RegisterIndividualFormValues = z.infer<typeof registerIndividualSchema>;

const EMPTY: RegisterIndividualFormValues = {
  nume: "",
  telefon: "",
  email: "",
  password: "",
  confirmedPassword: "",
  acordTermeniSiConditii: false,
};

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors bg-white text-sm disabled:opacity-60 disabled:cursor-not-allowed";

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
        {label} {required && <span style={{ color: "#2dbe8f" }}>*</span>}
        {!required && (
          <span className="font-normal text-muted-foreground ml-1">(opțional)</span>
        )}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export function RegisterIndividualForm() {
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterIndividualFormValues>({
    resolver: zodResolver(registerIndividualSchema),
    defaultValues: EMPTY,
  });

  const acordTermeniSiConditii = watch("acordTermeniSiConditii");

  const onSubmit = async (data: RegisterIndividualFormValues) => {
    setApiError(null);
    try {
      await registerIndividual({
        nume: data.nume,
        email: data.email,
        password: data.password,
        telefon: data.telefon.trim() || undefined,
        acordTermeniSiConditii: data.acordTermeniSiConditii,
      });
      setSubmittedEmail(data.email);
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError && isZodFlattenError(err.details)) {
        const unmapped: string[] = [];
        let mappedAny = false;
        for (const [field, messages] of Object.entries(err.details.fieldErrors ?? {})) {
          const message = messages?.[0];
          if (!message) continue;
          if (field in EMPTY) {
            setError(field as keyof RegisterIndividualFormValues, { message });
            mappedAny = true;
          } else {
            unmapped.push(message);
          }
        }
        const bannerMessages = [...(err.details.formErrors ?? []), ...unmapped];
        if (bannerMessages.length > 0) setApiError(bannerMessages[0]);
        else if (!mappedAny) setApiError(err.message);
      } else {
        setApiError(
          err instanceof ApiError
            ? err.message
            : "Nu am putut trimite înregistrarea. Încearcă din nou.",
        );
      }
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-border shadow-sm p-12 text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "rgba(45,190,143,0.12)" }}
        >
          <CheckCircle size={38} style={{ color: "#2dbe8f" }} />
        </div>
        <h2 className="mb-3 font-heading font-extrabold text-2xl" style={{ color: "#162040" }}>
          Contul a fost creat cu succes!
        </h2>
        <p className="text-muted-foreground mb-8" style={{ maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
          Te poți autentifica oricând folosind adresa{" "}
          <strong style={{ color: "#162040" }}>{submittedEmail}</strong>.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/autentificare"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "#162040" }}
          >
            Autentifică-te
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-border transition-colors hover:bg-muted"
            style={{ color: "#162040" }}
          >
            Înapoi la pagina principală
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
    >
      {apiError && (
        <div
          role="alert"
          className="m-8 mb-0 flex items-start gap-2.5 rounded-xl p-4 text-sm"
          style={{ background: "#fff5f5", border: "1.5px solid #fca5a5", color: "#ef4444" }}
        >
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          {apiError}
        </div>
      )}

      <div className="px-8 py-7 space-y-5">
        <Field label="Nume complet" required error={errors.nume?.message}>
          <input
            type="text"
            placeholder="Prenume Nume"
            className={inputClass}
            {...register("nume")}
          />
        </Field>

        <Field label="Telefon" error={errors.telefon?.message}>
          <input
            type="tel"
            placeholder="07XX XXX XXX"
            className={inputClass}
            {...register("telefon")}
          />
        </Field>

        <Field label="Email" required error={errors.email?.message}>
          <input
            type="email"
            placeholder="email@exemplu.ro"
            className={inputClass}
            {...register("email")}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Parolă" required error={errors.password?.message}>
            <PasswordInput
              placeholder="Min. 8 caractere"
              className={inputClass}
              {...register("password")}
            />
          </Field>
          <Field label="Confirmă parola" required error={errors.confirmedPassword?.message}>
            <PasswordInput
              placeholder="Repetă parola"
              className={inputClass}
              {...register("confirmedPassword")}
            />
          </Field>
        </div>

        <TermsCheckbox
          registration={register("acordTermeniSiConditii")}
          checked={acordTermeniSiConditii}
          error={errors.acordTermeniSiConditii?.message}
        />
      </div>

      <div
        className="px-8 py-6 border-t border-border flex flex-col sm:flex-row items-center gap-4"
        style={{ background: "#f8faff" }}
      >
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
          style={{ background: "#2dbe8f", boxShadow: "0 4px 16px rgba(45,190,143,0.3)" }}
        >
          {isSubmitting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <CheckCircle size={18} />
          )}
          Creează cont
        </button>
      </div>
    </form>
  );
}
