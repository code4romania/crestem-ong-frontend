/**
 * Validarea formularului public, într-un modul fără dependințe: o folosesc și
 * componenta client (ca să arate erorile pe loc), și Server Action-ul (unde e
 * un control real — acțiunea e un endpoint adresabil, la fel ca în
 * `footer-actions.ts`).
 */
export interface ContactFormInput {
  name: string;
  email: string;
  organization: string;
  subject: string;
  message: string;
  consent: boolean;
}

export type ContactFormErrors = Partial<Record<keyof ContactFormInput, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactForm(input: ContactFormInput): ContactFormErrors {
  const errors: ContactFormErrors = {};

  const name = input.name.trim();
  if (!name) errors.name = "Numele este obligatoriu";
  else if (name.length > 120) errors.name = "Numele poate avea cel mult 120 de caractere";

  const email = input.email.trim();
  if (!email) errors.email = "Emailul este obligatoriu";
  else if (!EMAIL.test(email)) errors.email = "Adresa de email nu este validă";
  else if (email.length > 160) errors.email = "Emailul poate avea cel mult 160 de caractere";

  if (input.organization.trim().length > 160) {
    errors.organization = "Denumirea organizației poate avea cel mult 160 de caractere";
  }

  const subject = input.subject.trim();
  if (!subject) errors.subject = "Alege un subiect";
  else if (subject.length > 160) errors.subject = "Subiectul poate avea cel mult 160 de caractere";

  const message = input.message.trim();
  if (!message) errors.message = "Mesajul este obligatoriu";
  else if (message.length < 3) errors.message = "Mesajul trebuie să aibă cel puțin 3 caractere";
  else if (message.length > 5000) errors.message = "Mesajul poate avea cel mult 5000 de caractere";

  if (!input.consent) {
    errors.consent = "Trebuie să fii de acord cu politica de confidențialitate";
  }

  return errors;
}
