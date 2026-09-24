"use client";

import { useId, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { submitContactAction } from "@/lib/api/contact-actions";
import { validateContactForm, type ContactFormErrors } from "@/lib/api/contact-validation";
import { useRenderMode } from "../shared/render-mode";

const EMPTY = {
  name: "",
  email: "",
  organization: "",
  subject: "",
  message: "",
  consent: false,
};

export function ContactForm({
  title,
  subjects,
  privacyUrl,
}: {
  title: string;
  subjects: string[];
  privacyUrl: string;
}) {
  const mode = useRenderMode();
  const ids = useId();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  // În canvas-ul editorului și în previzualizare formularul se vede, dar nu
  // trimite: altfel fiecare probă a editorului ar crea un mesaj real.
  const isPreview = mode !== "public";

  function set<K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (isPreview || sending) return;

    const found = validateContactForm(values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setFormError(null);
      return;
    }

    setSending(true);
    setFormError(null);
    try {
      const result = await submitContactAction({ ...values, website: honeypot });
      if (result.ok) {
        setSent(true);
        return;
      }
      setErrors(result.fieldErrors ?? {});
      setFormError(result.error);
    } catch {
      setFormError("A apărut o eroare neașteptată. Încearcă din nou.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      // `h-full` umple celula de grilă când coloana de informații e mai înaltă;
      // `min-h` ține panoul aproape de înălțimea formularului pe care îl
      // înlocuiește, ca secțiunea să nu sară vizual la trimitere.
      <div className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center">
        {/* Decorativ: mesajul de dedesubt spune deja ce s-a întâmplat. */}
        <span
          aria-hidden
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eafaf4] text-[#007d58]"
        >
          <CheckCircle2 size={28} />
        </span>
        <h2 className="mt-4 font-heading text-2xl font-extrabold text-[#1c1c81]">Mulțumim!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Mesajul tău a fost trimis. Revenim cu un răspuns cât de curând.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#007d58] focus:ring-2 focus:ring-[#00d495]/20";
  const label = "mb-1.5 block text-sm font-semibold text-[#1c1c81]";

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
    >
      <h2 className="font-heading text-2xl font-extrabold text-[#1c1c81]">{title}</h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor={`${ids}-name`}>
            Numele tău *
          </label>
          <input
            id={`${ids}-name`}
            className={field}
            placeholder="Ion Popescu"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${ids}-name-error` : undefined}
          />
          {errors.name && (
            <p id={`${ids}-name-error`} className="mt-1 text-xs text-[#dc2626]">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label className={label} htmlFor={`${ids}-email`}>
            Email *
          </label>
          <input
            id={`${ids}-email`}
            type="email"
            className={field}
            placeholder="email@organizatia.ro"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${ids}-email-error` : undefined}
          />
          {errors.email && (
            <p id={`${ids}-email-error`} className="mt-1 text-xs text-[#dc2626]">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <label className={label} htmlFor={`${ids}-org`}>
          Organizația ta
        </label>
        <input
          id={`${ids}-org`}
          className={field}
          placeholder="Denumirea ONG-ului"
          value={values.organization}
          onChange={(e) => set("organization", e.target.value)}
          aria-invalid={Boolean(errors.organization)}
          aria-describedby={errors.organization ? `${ids}-org-error` : undefined}
        />
        {errors.organization && (
          <p id={`${ids}-org-error`} className="mt-1 text-xs text-[#dc2626]">
            {errors.organization}
          </p>
        )}
      </div>

      <div className="mt-4">
        <label className={label} htmlFor={`${ids}-subject`}>
          Subiect *
        </label>
        {subjects.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Niciun subiect configurat pentru acest formular.
          </p>
        ) : (
          <select
            id={`${ids}-subject`}
            className={field}
            value={values.subject}
            onChange={(e) => set("subject", e.target.value)}
            aria-invalid={Boolean(errors.subject)}
            aria-describedby={errors.subject ? `${ids}-subject-error` : undefined}
          >
            <option value="">Selectează un subiect</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        )}
        {errors.subject && (
          <p id={`${ids}-subject-error`} className="mt-1 text-xs text-[#dc2626]">
            {errors.subject}
          </p>
        )}
      </div>

      <div className="mt-4">
        <label className={label} htmlFor={`${ids}-message`}>
          Mesajul tău *
        </label>
        <textarea
          id={`${ids}-message`}
          rows={6}
          className={`${field} resize-y`}
          placeholder="Scrie mesajul tău aici..."
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? `${ids}-message-error` : undefined}
        />
        {errors.message && (
          <p id={`${ids}-message-error`} className="mt-1 text-xs text-[#dc2626]">
            {errors.message}
          </p>
        )}
      </div>

      {/* Honeypot: ascuns în afara ecranului, nu cu `display: none` — unele
          boturi sar peste câmpurile ascunse prin CSS. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${ids}-website`}>Website</label>
        <input
          id={`${ids}-website`}
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="mt-5 flex items-start gap-2.5">
        <input
          id={`${ids}-consent`}
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-slate-300"
          checked={values.consent}
          onChange={(e) => set("consent", e.target.checked)}
          aria-invalid={Boolean(errors.consent)}
          aria-describedby={errors.consent ? `${ids}-consent-error` : undefined}
        />
        <label htmlFor={`${ids}-consent`} className="text-sm text-muted-foreground">
          Sunt de acord cu{" "}
          {privacyUrl ? (
            <a href={privacyUrl} className="text-[#007d58] underline">
              politica de confidențialitate
            </a>
          ) : (
            <span className="underline">politica de confidențialitate</span>
          )}{" "}
          și prelucrarea datelor personale.
        </label>
      </div>
      {errors.consent && (
        <p id={`${ids}-consent-error`} className="mt-1 text-xs text-[#dc2626]">
          {errors.consent}
        </p>
      )}

      <button
        type="submit"
        disabled={sending || isPreview || subjects.length === 0}
        className="mt-5 w-full rounded-xl bg-[#1c1c81] py-3.5 font-heading font-bold text-white disabled:opacity-60"
      >
        {sending ? "Se trimite..." : "Trimite mesajul"}
      </button>

      {isPreview && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Trimiterea este dezactivată în editor.
        </p>
      )}
      {formError && <p className="mt-2 text-center text-sm text-[#dc2626]">{formError}</p>}
    </form>
  );
}
