"use server";

import { getCurrentUser } from "./session-server";
import { isFdscStaff } from "@/lib/roles";
import { SESSION_COOKIE } from "./session-cookies";

export interface UploadAuth {
  apiUrl: string;
  token: string;
}

/**
 * Vercel Functions hard-cap request bodies at 4.5MB — a platform limit that
 * `bodySizeLimit`/`proxyClientMaxBodySize` in `next.config.ts` cannot raise.
 * Any upload near or above that size must go straight from the browser to
 * Strapi instead of through a Server Action, which means the browser needs a
 * bearer token. This hands out a one-time copy of the session JWT for that
 * single direct call — the token otherwise never leaves the httpOnly cookie.
 * Every FDSC-staff upload flow (media library, page-block image/video/
 * document) shares this same check and token.
 */
export async function getUploadAuthAction(): Promise<{
  error?: string;
  auth?: UploadAuth;
}> {
  const user = await getCurrentUser();
  if (!isFdscStaff(user?.role?.type)) {
    return { error: "Nu ai permisiunea necesară pentru această acțiune." };
  }

  const { cookies } = await import("next/headers");
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!token || !apiUrl) {
    return { error: "Sesiune expirată. Reîncarcă pagina și încearcă din nou." };
  }
  return { auth: { apiUrl, token } };
}
