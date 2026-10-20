"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { revalidateDashboardPath } from "./revalidate";
import { serverApiFetch } from "./server";
import { getApiErrorMessage, parseApiError } from "./client";
import type { MyOng } from "./ongs";
import { ROLE_COOKIE, roleCookieOptions } from "./session-cookies";
import { dashboardSegmentForRole } from "@/lib/dashboard-routes";

export async function deleteOngAction(documentId: string): Promise<{ error?: string }> {
  try {
    await serverApiFetch(`/api/ongs/${documentId}`, { method: "DELETE" });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut șterge organizația.") };
  }

  revalidateDashboardPath("/dashboard/fdsc/organizatii");
  return {};
}

/**
 * `Șterge ONG` from the Admin ONG's own Acțiuni menu.
 *
 * Same endpoint as `deleteOngAction` — the backend decides ownership, this only
 * differs in what happens afterwards. Deleting the organization ends the
 * caller's membership, so an admin with no other affiliation is demoted to
 * `individual` on the spot and the ONG dashboard starts turning them away.
 * The destination is therefore read back from `/api/auth/me` *after* the
 * deletion rather than guessed: an admin who still runs another organization
 * stays `ngo-admin` and belongs back on the ONG dashboard.
 */
export async function deleteMyOngAction(
  documentId: string,
): Promise<{ error?: string; redirectTo?: string }> {
  try {
    await serverApiFetch(`/api/ongs/${documentId}`, { method: "DELETE" });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut șterge organizația.") };
  }

  revalidatePath("/dashboard", "layout");

  const { getCurrentUser, getDashboardPathForRole } = await import("./session-server");
  let redirectTo = "/dashboard";
  try {
    const user = await getCurrentUser();
    redirectTo = getDashboardPathForRole(user?.role?.type) ?? redirectTo;
    // The demotion also changes which dashboard folder the proxy must rewrite
    // to, so re-stamp the routing cookie here rather than let the next request
    // land on the ONG dashboard and bounce through the re-sync endpoint.
    const segment = dashboardSegmentForRole(user?.role?.type);
    if (segment) {
      (await cookies()).set(ROLE_COOKIE, segment, roleCookieOptions);
    }
  } catch {
    // The organization is gone either way; fall back to the individual
    // dashboard, which is where a demoted admin belongs.
  }
  return { redirectTo };
}

export interface UpdateMyOngInput {
  logo?: number | null;
  domeniuPrincipal?: string;
  domeniuSecundar?: string;
  website?: string;
  socialMedia?: string;
  descriere?: string;
  cuvinteCheie?: string;
}

export async function updateMyOngAction(
  input: UpdateMyOngInput,
): Promise<{ error?: string; data?: MyOng }> {
  try {
    const res = await serverApiFetch<{ data: MyOng }>("/api/ongs/me", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    revalidateDashboardPath("/dashboard/ong/profil");
    return { data: res.data };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut actualiza profilul organizației.") };
  }
}

export interface InviteOngMemberInput {
  nume: string;
  email: string;
  rol: string;
}

interface InviteOngMemberResponse {
  message: string;
  emailSent: boolean;
  alreadyMember?: boolean;
}

/**
 * A failed email send comes back as `emailSent: false` on a 200 — the member
 * was still added, so it surfaces as a `warning`, not an `error`.
 */
export async function inviteOngMemberAction(
  input: InviteOngMemberInput,
): Promise<{ error?: string; fieldErrors?: Record<string, string>; warning?: string; message?: string }> {
  let res: InviteOngMemberResponse;
  try {
    res = await serverApiFetch<InviteOngMemberResponse>("/api/auth/register/member", {
      method: "POST",
      body: JSON.stringify(input),
    });
  } catch (err) {
    const parsed = parseApiError(err, "Nu am putut trimite invitația.");
    return { error: parsed.message || undefined, fieldErrors: parsed.fieldErrors };
  }

  revalidateDashboardPath("/dashboard/ong/utilizatori");
  if (!res.emailSent && !res.alreadyMember) return { warning: res.message };
  return { message: res.message };
}

/**
 * Resend keys off the numeric `id`, not `documentId` — the two identifiers are
 * not interchangeable and the remove endpoint takes the other one.
 *
 * The backend signs a fresh token and overwrites `resetPasswordToken`, so every
 * activation link already on screen dies here. The caller must re-render the
 * table afterwards or the admin copies a URL that now 400s.
 */
export async function resendMemberInvitationAction(id: number): Promise<{ error?: string }> {
  try {
    await serverApiFetch(`/api/auth/register/member/${id}/resend`, { method: "POST" });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut retrimite invitația.") };
  }

  revalidateDashboardPath("/dashboard/ong/utilizatori");
  return {};
}

export async function removeOngMemberAction(documentId: string): Promise<{ error?: string }> {
  try {
    await serverApiFetch(`/api/ongs/members/${documentId}`, { method: "DELETE" });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut elimina utilizatorul.") };
  }

  revalidateDashboardPath("/dashboard/ong/utilizatori");
  return {};
}

export async function acceptJoinRequestAction(
  documentId: string,
  rol: string,
): Promise<{ error?: string }> {
  try {
    await serverApiFetch(`/api/ongs/join-requests/${documentId}/accept`, {
      method: "POST",
      body: JSON.stringify({ rol }),
    });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut confirma cererea.") };
  }

  revalidateDashboardPath("/dashboard/ong/utilizatori");
  return {};
}

export async function rejectJoinRequestAction(documentId: string): Promise<{ error?: string }> {
  try {
    await serverApiFetch(`/api/ongs/join-requests/${documentId}/reject`, { method: "POST" });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut respinge cererea.") };
  }

  revalidateDashboardPath("/dashboard/ong/utilizatori");
  return {};
}

export async function uploadFileAction(
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
    // Strapi's /api/upload returns an array of created file objects.
    const id = Array.isArray(data) ? data[0]?.id : undefined;
    return { id };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut încărca fișierul.") };
  }
}

/**
 * Sends `name`/`evaluation`/`file` in one multipart request — the backend
 * validates the evaluation/ONG relationship first and only creates the upload
 * once that passes, so a rejected request never leaves an orphaned file
 * behind the way the old upload-then-create flow could.
 */
export async function createFdscReportAction(
  ongDocumentId: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const { cookies } = await import("next/headers");
  const { SESSION_COOKIE } = await import("./session-cookies");
  const { ApiError } = await import("./client");

  const cookieStore = await cookies();
  const jwt = cookieStore.get(SESSION_COOKIE)?.value;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  try {
    const res = await fetch(`${API_URL}/api/ongs/${ongDocumentId}/fdsc-reports`, {
      method: "POST",
      headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined,
      body: formData,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message = data?.error?.message ?? "Nu am putut încărca raportul.";
      throw new ApiError(message, res.status, data?.error?.details);
    }
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut încărca raportul.") };
  }

  revalidateDashboardPath(`/dashboard/fdsc/organizatii/${ongDocumentId}/rapoarte`);
  return {};
}

export async function deleteFdscReportAction(
  ongDocumentId: string,
  reportDocumentId: string,
): Promise<{ error?: string }> {
  try {
    await serverApiFetch(`/api/ongs/${ongDocumentId}/fdsc-reports/${reportDocumentId}`, {
      method: "DELETE",
    });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut șterge raportul.") };
  }

  revalidatePath(`/dashboard/fdsc/organizatii/${ongDocumentId}/rapoarte`);
  return {};
}
