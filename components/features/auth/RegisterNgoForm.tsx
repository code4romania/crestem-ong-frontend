"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, CheckCircle, ChevronDown, Loader2 } from "lucide-react";
import { registerNgo } from "@/lib/api/auth";
import { ApiError, isZodFlattenError } from "@/lib/api/client";
import { listCities, listCounties } from "@/lib/api/geo";
import type { City, County } from "@/lib/api/geo";
import { PasswordInput } from "./PasswordInput";
import { TermsCheckbox } from "./TermsCheckbox";
import {
  PASSWORDS_MATCH_ERROR,
  confirmedPasswordSchema,
  passwordSchema,
  passwordsMatch,
} from "@/lib/validation/password";

const registerNgoSchema = z
  .object({
    numeOng: z.string().trim().min(1, "Câmp obligatoriu"),
    cui: z
      .string()
      .trim()
      .min(1, "Câmp obligatoriu")
      .regex(/^(RO\s?)?\d{2,10}$/i, "Format invalid (ex. RO 12345678)"),
    judet: z.string().min(1, "Selectează județul"),
    localitate: z.string().min(1, "Selectează localitatea"),
    nume: z.string().trim().min(1, "Câmp obligatoriu"),
    telefon: z
      .string()
      .trim()
      .min(1, "Câmp obligatoriu")
      .min(8, "Numărul de telefon este invalid"),
    email: z.string().trim().min(1, "Câmp obligatoriu").email("Email invalid"),
    password: passwordSchema,
    confirmedPassword: confirmedPasswordSchema,
    acordTermeniSiConditii: z
      .boolean()
      .refine((v) => v === true, { message: "Este necesar acordul tău pentru a continua" }),
  })
  .refine(passwordsMatch, PASSWORDS_MATCH_ERROR);

type RegisterNgoFormValues = z.infer<typeof registerNgoSchema>;

const EMPTY: RegisterNgoFormValues = {
  numeOng: "",
  cui: "",
  judet: "",
  localitate: "",
  nume: "",
  telefon: "",
  email: "",
  password: "",
  confirmedPassword: "",
  acordTermeniSiConditii: false,
};

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#00d495]/30 focus:border-[#007d58] transition-colors bg-white text-sm disabled:opacity-60 disabled:cursor-not-allowed";

const selectClass = `${inputClass} appearance-none pr-10`;

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
      <label
        className="block text-sm font-semibold mb-1.5"
        style={{ color: "#334155" }}
      >
        {label} {required && <span style={{ color: "#007d58" }}>*</span>}
        {!required && (
          <span className="font-normal text-muted-foreground ml-1">
            (opțional)
          </span>
        )}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs" style={{ color: "#b91c1c" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export function RegisterNgoForm() {
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [submittedNumeOng, setSubmittedNumeOng] = useState("");

  const [counties, setCounties] = useState<County[]>([]);
  const [loadingCounties, setLoadingCounties] = useState(true);
  const [countiesError, setCountiesError] = useState(false);

  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [citiesError, setCitiesError] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterNgoFormValues>({
    resolver: zodResolver(registerNgoSchema),
    defaultValues: EMPTY,
  });

  const judet = watch("judet");
  const acordTermeniSiConditii = watch("acordTermeniSiConditii");

  useEffect(() => {
    listCounties()
      .then((res) => setCounties(res.data))
      .catch(() => setCountiesError(true))
      .finally(() => setLoadingCounties(false));
  }, []);

  useEffect(() => {
    if (!judet) return;
    let active = true;
    listCities(judet)
      .then((res) => {
        if (active) setCities(res.data);
      })
      .catch(() => {
        if (active) setCitiesError(true);
      })
      .finally(() => {
        if (active) setLoadingCities(false);
      });
    return () => {
      active = false;
    };
  }, [judet]);

  const onSubmit = async (data: RegisterNgoFormValues) => {
    setApiError(null);
    try {
      await registerNgo({
        nume: data.nume,
        telefon: data.telefon,
        email: data.email,
        password: data.password,
        cui: data.cui,
        numeOng: data.numeOng,
        judet: data.judet,
        localitate: data.localitate,
        acordTermeniSiConditii: data.acordTermeniSiConditii,
      });
      setSubmittedEmail(data.email);
      setSubmittedNumeOng(data.numeOng);
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError && isZodFlattenError(err.details)) {
        const unmapped: string[] = [];
        let mappedAny = false;
        for (const [field, messages] of Object.entries(
          err.details.fieldErrors ?? {},
        )) {
          const message = messages?.[0];
          if (!message) continue;
          if (field in EMPTY) {
            setError(field as keyof RegisterNgoFormValues, { message });
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
          style={{ background: "rgba(0,212,149,0.12)" }}
        >
          <CheckCircle size={38} style={{ color: "#007d58" }} />
        </div>
        <h2
          className="mb-3 font-heading font-extrabold text-2xl"
          style={{ color: "#1c1c81" }}
        >
          Contul a fost creat cu succes!
        </h2>
        <p
          className="text-muted-foreground mb-2"
          style={{ maxWidth: 420, margin: "0 auto 0.5rem" }}
        >
          Am creat contul pentru{" "}
          <strong style={{ color: "#1c1c81" }}>{submittedNumeOng}</strong>. Te poți
          autentifica imediat folosind adresa{" "}
          <strong style={{ color: "#1c1c81" }}>{submittedEmail}</strong>.
        </p>
        <p
          className="text-muted-foreground mb-8"
          style={{ maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}
        >
          După autentificare poți începe o evaluare independentă a organizației
          tale, poți adăuga membri în echipă și poți participa la programele
          alocate de echipa Crestem ONG.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/autentificare"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "#1c1c81" }}
          >
            Autentifică-te
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
          style={{
            background: "#fff5f5",
            border: "1.5px solid #fca5a5",
            color: "#b91c1c",
          }}
        >
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          {apiError}
        </div>
      )}

      <div className="px-8 py-7 space-y-5">
        <Field label="Numele ONG-ului" required error={errors.numeOng?.message}>
          <input
            type="text"
            placeholder="ex. Asociația Crestem Împreună"
            className={inputClass}
            {...register("numeOng")}
          />
        </Field>

        <Field
          label="CUI (Cod Unic de Înregistrare)"
          required
          error={errors.cui?.message}
        >
          <input
            type="text"
            placeholder="ex. RO 12345678"
            className={inputClass}
            {...register("cui")}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Județ" required error={errors.judet?.message}>
            <div className="relative">
              <select
                disabled={loadingCounties}
                className={selectClass}
                {...register("judet", {
                  onChange: (e: ChangeEvent<HTMLSelectElement>) => {
                    setValue("localitate", "");
                    setCities([]);
                    setCitiesError(false);
                    setLoadingCities(!!e.target.value);
                  },
                })}
              >
                <option value="">
                  {loadingCounties ? "Se încarcă județele..." : "Selectează județul"}
                </option>
                {counties.map((c) => (
                  <option key={c.documentId} value={c.documentId}>
                    {c.nume}
                  </option>
                ))}
              </select>
              {loadingCounties ? (
                <Loader2
                  size={16}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin pointer-events-none"
                  style={{ color: "#5b6779" }}
                />
              ) : (
                <ChevronDown
                  size={16}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "#5b6779" }}
                />
              )}
            </div>
            {countiesError && (
              <p className="mt-1 text-xs" style={{ color: "#b91c1c" }}>
                Nu am putut încărca lista de județe. Reîncarcă pagina.
              </p>
            )}
          </Field>
          <Field label="Localitate" required error={errors.localitate?.message}>
            <div className="relative">
              <select
                disabled={!judet || loadingCities}
                className={selectClass}
                {...register("localitate")}
              >
                <option value="">
                  {!judet
                    ? "Selectează județul mai întâi"
                    : loadingCities
                      ? "Se încarcă localitățile..."
                      : "Selectează localitatea"}
                </option>
                {cities.map((c) => (
                  <option key={c.documentId} value={c.documentId}>
                    {c.nume}
                  </option>
                ))}
              </select>
              {loadingCities ? (
                <Loader2
                  size={16}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin pointer-events-none"
                  style={{ color: "#5b6779" }}
                />
              ) : (
                <ChevronDown
                  size={16}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "#5b6779" }}
                />
              )}
            </div>
            {citiesError && (
              <p className="mt-1 text-xs" style={{ color: "#b91c1c" }}>
                Nu am putut încărca lista de localități.
              </p>
            )}
          </Field>
        </div>
      </div>

      <div
        className="px-8 py-5 border-t border-b border-border"
        style={{ background: "#f8faff" }}
      >
        <p
          className="font-semibold text-sm uppercase tracking-wider"
          style={{ color: "#1c1c81" }}
        >
          Persoana de contact
        </p>
      </div>

      <div className="px-8 py-7 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Nume complet" required error={errors.nume?.message}>
            <input
              type="text"
              placeholder="ex. Ion Popescu"
              className={inputClass}
              {...register("nume")}
            />
          </Field>
          <Field label="Telefon" required error={errors.telefon?.message}>
            <input
              type="tel"
              placeholder="07XX XXX XXX"
              className={inputClass}
              {...register("telefon")}
            />
          </Field>
        </div>

        <Field label="Email" required error={errors.email?.message}>
          <input
            type="email"
            placeholder="email@organizatia.ro"
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
          className="w-full sm:w-auto flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white transition-all hover:brightness-90 disabled:opacity-60"
          style={{
            background: "#00d495",
            boxShadow: "0 4px 16px rgba(0,212,149,0.3)",
          }}
        >
          {isSubmitting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <CheckCircle size={18} />
          )}
          Trimite înregistrarea
        </button>
      </div>
    </form>
  );
}
