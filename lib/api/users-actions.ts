"use server";

import { revalidateDashboardPath } from "./revalidate";
import { serverApiFetch } from "./server";
import { getCurrentUser } from "./session-server";
import { getApiErrorMessage, parseApiError } from "./client";
import { sanitizeRichText } from "@/components/features/page-builder/rich-text/sanitize.server";

const FORBIDDEN_MESSAGE = "Nu ai permisiunea necesară pentru această acțiune.";

/**
 * A mentor bio is rich text from the shared editor. The modals used to sanitise
 * it before calling in, which was never a control — a Server Action is an
 * addressable endpoint. Doing it here also keeps DOMPurify out of the client
 * bundle, where it drags jsdom into the client-SSR chunks and breaks every HTML
 * render once the build is packed into a serverless function.
 */
function withCleanBio<T extends { bio?: string }>(input: T): T {
  return input.bio === undefined ? input : { ...input, bio: sanitizeRichText(input.bio) };
}

/**
 * Creating and editing accounts is the administrator's; `editor-fdsc` reads
 * "Persoane resursă" without the write actions. A Server Action is an
 * addressable endpoint, so the check lives here too and not only in the buttons
 * the page decides to render. The backend refuses the same calls.
 */
async function refuseNonAdministrator(): Promise<{ error: string } | null> {
  const user = await getCurrentUser();
  return user?.role?.type === "super-admin" ? null : { error: FORBIDDEN_MESSAGE };
}

export interface CreateMentorInput {
  role: "mentor";
  nume: string;
  email: string;
  bio?: string;
  avatar?: number;
  dimensiuni?: string[];
  ariiDeExpertiza?: string[];
}

export interface CreateStaffInput {
  role: "super-admin" | "editor-fdsc";
  nume: string;
  email: string;
}

export type CreateFdscUserInput = CreateMentorInput | CreateStaffInput;

export async function createFdscUserAction(
  input: CreateFdscUserInput,
): Promise<{ error?: string; fieldErrors?: Record<string, string> }> {
  const forbidden = await refuseNonAdministrator();
  if (forbidden) return forbidden;

  const path = input.role === "mentor" ? "/api/auth/register/mentor" : "/api/auth/register/staff";
  const { role, ...body } = input.role === "mentor" ? withCleanBio(input) : input;

  try {
    await serverApiFetch(path, {
      method: "POST",
      body: JSON.stringify(input.role === "mentor" ? body : { ...body, role }),
    });
  } catch (err) {
    const parsed = parseApiError(err, "Nu am putut crea utilizatorul.");
    return { error: parsed.message || undefined, fieldErrors: parsed.fieldErrors };
  }

  revalidateDashboardPath("/dashboard/fdsc/utilizatori");
  revalidateDashboardPath("/dashboard/fdsc/persoane-resursa");
  return {};
}

export interface UpdateMentorInput {
  role: "mentor";
  nume: string;
  bio?: string;
  avatar?: number | null;
  dimensiuni?: string[];
  ariiDeExpertiza?: string[];
}

export interface UpdateStaffInput {
  role: "super-admin" | "editor-fdsc";
  nume: string;
}

export type UpdateFdscUserInput = UpdateMentorInput | UpdateStaffInput;

export async function updateFdscUserAction(
  documentId: string,
  input: UpdateFdscUserInput,
): Promise<{ error?: string; fieldErrors?: Record<string, string> }> {
  const forbidden = await refuseNonAdministrator();
  if (forbidden) return forbidden;

  const body =
    input.role === "mentor"
      ? {
          nume: input.nume,
          bio: withCleanBio(input).bio,
          avatar: input.avatar,
          dimensiuni: input.dimensiuni,
          ariiDeExpertiza: input.ariiDeExpertiza,
        }
      : { nume: input.nume };

  try {
    await serverApiFetch(`/api/admin/users/${documentId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  } catch (err) {
    const parsed = parseApiError(err, "Nu am putut actualiza utilizatorul.");
    return { error: parsed.message || undefined, fieldErrors: parsed.fieldErrors };
  }

  revalidateDashboardPath("/dashboard/fdsc/utilizatori");
  revalidateDashboardPath("/dashboard/fdsc/persoane-resursa");
  revalidateDashboardPath("/dashboard/fdsc/persoane-resursa/[documentId]", "page");
  return {};
}

export interface UpdateMentorProfileInput {
  nume: string;
  bio?: string;
  avatar?: number | null;
  dimensiuni?: string[];
  ariiDeExpertiza?: string[];
}

/**
 * The mentor's own self-service edit, as opposed to `updateFdscUserAction`
 * which an administrator uses on someone else's account. Gated on "caller is
 * a mentor" rather than `refuseNonAdministrator`. The backend route
 * (`PATCH /api/mentors/me`) updates the caller's own record regardless of
 * what id is asked for, so there is nothing here for a mentor to target
 * another account with.
 */
export async function updateMentorProfileAction(
  input: UpdateMentorProfileInput,
): Promise<{ error?: string; fieldErrors?: Record<string, string> }> {
  const user = await getCurrentUser();
  if (user?.role?.type !== "mentor") {
    return { error: FORBIDDEN_MESSAGE };
  }

  try {
    await serverApiFetch("/api/mentors/me", {
      method: "PATCH",
      body: JSON.stringify(withCleanBio(input)),
    });
  } catch (err) {
    const parsed = parseApiError(err, "Nu am putut actualiza profilul.");
    return { error: parsed.message || undefined, fieldErrors: parsed.fieldErrors };
  }

  revalidateDashboardPath("/dashboard/mentor/profil");
  return {};
}

export interface UpdateIndividualProfileInput {
  nume: string;
  judet?: string;
  localitate?: string;
}

/**
 * The individual's own self-service edit. Gated on "caller is an individual"
 * the same way `updateMentorProfileAction` is gated on "caller is a mentor" —
 * the backend route (`PATCH /api/individuals/me`) updates the caller's own
 * record regardless of what id is asked for.
 */
export async function updateIndividualProfileAction(
  input: UpdateIndividualProfileInput,
): Promise<{ error?: string; fieldErrors?: Record<string, string> }> {
  const user = await getCurrentUser();
  if (user?.role?.type !== "individual") {
    return { error: FORBIDDEN_MESSAGE };
  }

  try {
    await serverApiFetch("/api/individuals/me", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  } catch (err) {
    const parsed = parseApiError(err, "Nu am putut actualiza profilul.");
    return { error: parsed.message || undefined, fieldErrors: parsed.fieldErrors };
  }

  revalidateDashboardPath("/dashboard/individual");
  return {};
}

export async function uploadUserAvatarAction(
  formData: FormData,
): Promise<{ error?: string; id?: number }> {
  const { cookies } = await import("next/headers");
  const { SESSION_COOKIE } = await import("./session-cookies");
  const { ApiError } = await import("./client");

  const cookieStore = await cookies();
  const jwt = cookieStore.get(SESSION_COOKIE)?.value;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  try {
    const res = await fetch(`${API_URL}/api/upload`, {
      method: "POST",
      headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined,
      body: formData,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message = data?.error?.message ?? "Nu am putut încărca fișierul.";
      throw new ApiError(message, res.status, data?.error?.details);
    }
    const id = Array.isArray(data) ? data[0]?.id : undefined;
    if (typeof id !== "number") {
      return { error: "Nu am putut încărca fișierul." };
    }
    return { id };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut încărca fișierul.") };
  }
}
