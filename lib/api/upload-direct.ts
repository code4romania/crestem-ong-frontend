import { errorMessage } from "./client";
import { getUploadAuthAction } from "./upload-auth-actions";

export interface StrapiUploadedFile {
  id: number;
  url: string;
  name?: string;
  ext?: string;
  size?: number;
}

interface StrapiErrorBody {
  error?: { message?: string };
}

/**
 * Uploads files straight from the browser to Strapi's `/api/upload`, bypassing
 * the Server Action that would otherwise hit Vercel's hard 4.5MB Function body
 * limit for anything above that size. Throws with a user-facing message on
 * failure — callers should wrap in try/catch and toast it.
 */
export async function uploadFilesDirect(
  files: File[],
): Promise<StrapiUploadedFile[]> {
  const authResult = await getUploadAuthAction();
  if (authResult.error || !authResult.auth) {
    throw new Error(
      authResult.error ?? "Nu am putut obține autorizarea pentru încărcare.",
    );
  }
  const { apiUrl, token } = authResult.auth;

  const form = new FormData();
  for (const file of files) form.append("files", file);

  const res = await fetch(`${apiUrl}/api/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !Array.isArray(data)) {
    throw new Error(
      errorMessage(
        (data as StrapiErrorBody | null)?.error?.message,
        "Încărcarea fișierului a eșuat.",
      ),
    );
  }
  return data as StrapiUploadedFile[];
}

/**
 * Same direct-to-Strapi pattern for a custom endpoint that expects the raw
 * file body directly (e.g. the media-asset "replace" route) rather than the
 * generic `/api/upload`. Returns the raw status/body so callers can branch on
 * backend-specific status codes (e.g. a 409 format mismatch) themselves.
 */
export async function postFileDirect(
  path: string,
  form: FormData,
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const authResult = await getUploadAuthAction();
  if (authResult.error || !authResult.auth) {
    throw new Error(
      authResult.error ?? "Nu am putut obține autorizarea pentru încărcare.",
    );
  }
  const { apiUrl, token } = authResult.auth;

  const res = await fetch(`${apiUrl}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}
