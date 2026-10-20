"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { serverApiFetch } from "./server";
import { getApiErrorMessage } from "./client";
import {
  SESSION_COOKIE,
  REFRESH_COOKIE,
  sessionCookieOptions,
  refreshCookieOptions,
} from "./session-cookies";

export interface ChangePasswordInput {
  currentPassword: string;
  password: string;
  confirmedPassword: string;
}

interface ChangePasswordResponse {
  jwt: string;
  refreshToken?: string;
}

export async function changePasswordAction(
  input: ChangePasswordInput,
): Promise<{ ok: true } | { error: string }> {
  try {
    const res = await serverApiFetch<ChangePasswordResponse>("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify(input),
    });

    // Changing the password revokes every refresh token and issues a fresh pair.
    // Without rewriting the cookies the session dies as soon as the old JWT expires.
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, res.jwt, sessionCookieOptions);
    if (res.refreshToken) {
      cookieStore.set(REFRESH_COOKIE, res.refreshToken, refreshCookieOptions);
    }

    return { ok: true };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut schimba parola. Încearcă din nou.") };
  }
}

export interface RequestEmailChangeInput {
  currentPassword: string;
  email: string;
}

/**
 * The confirmation link is mailed to the new address — `emailSent` is false
 * when delivery failed, and the token is then unreachable until a retry.
 */
export async function requestEmailChangeAction(
  input: RequestEmailChangeInput,
): Promise<{ ok: true; emailSent: boolean } | { error: string }> {
  try {
    const res = await serverApiFetch<{ emailSent: boolean }>(
      "/api/auth/change-email",
      { method: "POST", body: JSON.stringify(input) },
    );
    return { ok: true, emailSent: res.emailSent };
  } catch (err) {
    return {
      error: getApiErrorMessage(err, "Nu am putut schimba adresa de email. Încearcă din nou."),
    };
  }
}

export async function confirmEmailChangeAction(
  token: string,
): Promise<{ error: string }> {
  let newEmail: string;

  try {
    const res = await serverApiFetch<{ email: string }>(
      "/api/auth/change-email/confirm",
      { method: "POST", body: JSON.stringify({ token }) },
    );

    // Every session was just revoked backend-side; drop the local cookies too
    // so the user lands on the login screen and signs in with the new address.
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
    cookieStore.delete(REFRESH_COOKIE);

    newEmail = res.email;
  } catch (err) {
    return {
      error: getApiErrorMessage(err, "Nu am putut confirma schimbarea adresei. Încearcă din nou."),
    };
  }

  // Confirming spends the token, so the page can no longer re-render its own
  // route: the cookie writes above make Next refresh it, the preview call then
  // fails on the spent token and the success state is replaced by "link
  // invalid". Leaving for a token-free URL is what keeps the result visible.
  // redirect() throws, so it has to stay outside the try/catch.
  redirect(`/schimbare-email?confirmat=${encodeURIComponent(newEmail)}`);
}
