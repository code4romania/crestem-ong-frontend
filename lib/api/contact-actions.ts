"use server";

import { revalidateDashboardPath } from "./revalidate";
import { getApiErrorMessage } from "./client";
import { serverApiFetch } from "./server";
import { getCurrentUser } from "./session-server";
import { isFdscStaff } from "@/lib/roles";
import { validateContactForm, type ContactFormInput, type ContactFormErrors } from "./contact-validation";
import { CONTACT_STATUSES, type ContactStatus } from "./contact-types";

export interface SubmitContactInput extends ContactFormInput {
  /** Honeypot. Gol pentru un om; completat, requestul e ignorat de backend. */
  website: string;
}

export type SubmitContactResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: ContactFormErrors };

/**
 * Trimiterea formularului public. Validarea din interfață nu e un control —
 * o Server Action e un endpoint adresabil, deci validăm din nou aici, și încă
 * o dată în backend.
 */
export async function submitContactAction(
  input: SubmitContactInput,
): Promise<SubmitContactResult> {
  const fieldErrors = validateContactForm(input);
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Verifică datele completate.", fieldErrors };
  }

  try {
    await serverApiFetch(
      "/api/contacts",
      {
        method: "POST",
        body: JSON.stringify({
          name: input.name.trim(),
          email: input.email.trim(),
          organization: input.organization.trim(),
          subject: input.subject.trim(),
          message: input.message.trim(),
          consent: true,
          website: input.website,
        }),
      },
      // Un vizitator cu o sesiune veche în cookie nu trebuie să trimită JWT
      // către o rută publică.
      { anonymous: true },
    );
  } catch (err) {
    return { ok: false, error: getApiErrorMessage(err, "Mesajul nu a putut fi trimis.") };
  }

  return { ok: true };
}

const MANAGEMENT_PATH = "/dashboard/fdsc/mesaje-contact";

async function requireStaff(): Promise<string | null> {
  const user = await getCurrentUser();
  return isFdscStaff(user?.role?.type)
    ? null
    : "Nu ai permisiunea necesară pentru această acțiune.";
}

export async function updateContactStatusAction(
  documentId: string,
  status: ContactStatus,
): Promise<{ error?: string }> {
  const denied = await requireStaff();
  if (denied) return { error: denied };

  if (!CONTACT_STATUSES.includes(status)) {
    return { error: "Status invalid." };
  }

  try {
    await serverApiFetch(`/api/contacts/${documentId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Statusul nu a putut fi modificat.") };
  }

  revalidateDashboardPath(MANAGEMENT_PATH);
  return {};
}

export async function deleteContactAction(
  documentId: string,
): Promise<{ error?: string }> {
  const denied = await requireStaff();
  if (denied) return { error: denied };

  try {
    await serverApiFetch(`/api/contacts/${documentId}`, { method: "DELETE" });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Mesajul nu a putut fi șters.") };
  }

  revalidateDashboardPath(MANAGEMENT_PATH);
  return {};
}
