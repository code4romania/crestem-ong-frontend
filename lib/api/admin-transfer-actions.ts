"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { revalidateDashboardPath } from "./revalidate";
import { serverApiFetch } from "./server";
import { getApiErrorMessage, parseApiError } from "./client";
import {
  REFRESH_COOKIE,
  ROLE_COOKIE,
  SESSION_COOKIE,
  refreshCookieOptions,
  roleCookieOptions,
  sessionCookieOptions,
} from "./session-cookies";
import { dashboardSegmentForRole } from "@/lib/dashboard-routes";
import type { TransferTargetInput } from "./admin-transfer";

type ActionResult = { error?: string; fieldErrors?: Record<string, string>; warning?: string };

interface EmailSendResponse {
  emailSent: boolean;
  message: string;
}

const ONG_PROFILE_PATH = "/dashboard/ong/profil";
const fdscOngPath = (ongDocumentId: string) => `/dashboard/fdsc/organizatii/${ongDocumentId}`;

async function create(path: string, body: unknown, revalidate: string): Promise<ActionResult> {
  try {
    const res = await serverApiFetch<EmailSendResponse>(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
    revalidateDashboardPath(revalidate);
    return res.emailSent ? {} : { warning: res.message };
  } catch (err) {
    const parsed = parseApiError(err, "Nu am putut trimite propunerea de transfer.");
    return { error: parsed.message || undefined, fieldErrors: parsed.fieldErrors };
  }
}

async function post(path: string, fallback: string, revalidate?: string): Promise<ActionResult> {
  try {
    await serverApiFetch(path, { method: "POST" });
  } catch (err) {
    return { error: getApiErrorMessage(err, fallback) };
  }
  if (revalidate) revalidateDashboardPath(revalidate);
  return {};
}

/** A failed send comes back as `emailSent: false` on a 200, not as an error. */
async function resend(path: string): Promise<ActionResult> {
  try {
    const res = await serverApiFetch<EmailSendResponse>(path, { method: "POST" });
    return res.emailSent ? {} : { error: res.message };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut retrimite emailul.") };
  }
}

// ---- ONG admin (US-1, US-2, US-4) ----

export async function createAdminTransferAction(
  input: TransferTargetInput & { password: string },
): Promise<ActionResult> {
  return create("/api/admin-transfers", input, ONG_PROFILE_PATH);
}

export async function cancelAdminTransferAction(documentId: string): Promise<ActionResult> {
  return post(
    `/api/admin-transfers/${documentId}/cancel`,
    "Nu am putut anula transferul.",
    ONG_PROFILE_PATH,
  );
}

export async function resendAdminTransferAction(documentId: string): Promise<ActionResult> {
  return resend(`/api/admin-transfers/${documentId}/resend`);
}

// ---- FDSC Admin (US-5) ----

export async function fdscCreateAdminTransferAction(
  ongDocumentId: string,
  input: TransferTargetInput,
): Promise<ActionResult> {
  return create(`/api/ongs/${ongDocumentId}/admin-transfer`, input, fdscOngPath(ongDocumentId));
}

export async function fdscCancelAdminTransferAction(ongDocumentId: string): Promise<ActionResult> {
  return post(
    `/api/ongs/${ongDocumentId}/admin-transfer/cancel`,
    "Nu am putut anula transferul.",
    fdscOngPath(ongDocumentId),
  );
}

export async function fdscResendAdminTransferAction(ongDocumentId: string): Promise<ActionResult> {
  return resend(`/api/ongs/${ongDocumentId}/admin-transfer/resend`);
}

// ---- Recipient (US-3) ----

/**
 * Accepting turns the caller into `ngo-admin`, so the routing cookie is
 * re-stamped here rather than letting the next request land on the member
 * dashboard and bounce through the re-sync endpoint.
 */
async function stampAdminRoute() {
  const segment = dashboardSegmentForRole("ngo-admin");
  if (segment) (await cookies()).set(ROLE_COOKIE, segment, roleCookieOptions);
  revalidatePath("/dashboard", "layout");
}

export async function acceptAdminTransferAction(
  token: string,
): Promise<{ error?: string; redirectTo?: string }> {
  try {
    await serverApiFetch("/api/admin-transfers/accept", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut accepta propunerea.") };
  }
  await stampAdminRoute();
  return { redirectTo: "/dashboard" };
}

export async function declineAdminTransferAction(token: string): Promise<ActionResult> {
  try {
    await serverApiFetch("/api/admin-transfers/decline", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut refuza propunerea.") };
  }
  return {};
}

export interface AcceptNewAccountInput {
  token: string;
  password: string;
  confirmedPassword: string;
  acordTermeniSiConditii: boolean;
}

/** US-3 step 8: the new admin leaves this call signed in. */
export async function acceptNewAccountTransferAction(
  input: AcceptNewAccountInput,
): Promise<{ error?: string; fieldErrors?: Record<string, string>; redirectTo?: string }> {
  let res: { jwt: string; refreshToken?: string };
  try {
    res = await serverApiFetch<{ jwt: string; refreshToken?: string }>(
      "/api/admin-transfers/accept-new",
      { method: "POST", body: JSON.stringify(input) },
      { anonymous: true },
    );
  } catch (err) {
    const parsed = parseApiError(err, "Nu am putut activa contul.");
    return { error: parsed.message || undefined, fieldErrors: parsed.fieldErrors };
  }
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, res.jwt, sessionCookieOptions);
  if (res.refreshToken) {
    cookieStore.set(REFRESH_COOKIE, res.refreshToken, refreshCookieOptions);
  }
  await stampAdminRoute();
  return { redirectTo: "/dashboard" };
}

export async function declineNewAccountTransferAction(token: string): Promise<ActionResult> {
  try {
    await serverApiFetch(
      "/api/admin-transfers/decline-new",
      { method: "POST", body: JSON.stringify({ token }) },
      { anonymous: true },
    );
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut refuza propunerea.") };
  }
  return {};
}
