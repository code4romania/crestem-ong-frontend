"use server";

import { getApiErrorMessage, ApiError } from "./client";
import { getCurrentUser } from "./session-server";
import { SESSION_COOKIE } from "./session-cookies";
import { isFdscStaff } from "@/lib/roles";

export interface UploadedPageImage {
  id: number;
  url: string;
  name: string;
}

/**
 * Uploads one image for a page block to Strapi's `/api/upload` and returns the
 * created file's `id` + `url`. The page builder holds these in block data; a
 * future `page` content type will reference the same file by `id`.
 *
 * A Server Action is an addressable endpoint, so the FDSC-staff check lives here
 * as well as in the layout that renders the builder.
 */
export async function uploadPageImageAction(
  formData: FormData,
): Promise<{ error?: string; image?: UploadedPageImage }> {
  const user = await getCurrentUser();
  if (!isFdscStaff(user?.role?.type)) {
    return { error: "Nu ai permisiunea necesară pentru această acțiune." };
  }

  const { cookies } = await import("next/headers");
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
      const message = data?.error?.message ?? "Nu am putut încărca imaginea.";
      throw new ApiError(message, res.status, data?.error?.details);
    }
    const file = Array.isArray(data) ? data[0] : undefined;
    if (typeof file?.id !== "number" || typeof file?.url !== "string") {
      return { error: "Nu am putut încărca imaginea." };
    }
    return {
      image: {
        id: file.id,
        url: file.url,
        name: typeof file.name === "string" ? file.name : "imagine",
      },
    };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut încărca imaginea.") };
  }
}

export interface UploadedPageVideo {
  id: number;
  url: string;
  name: string;
}

/**
 * Same as `uploadPageImageAction` but for a video file — Strapi's `/api/upload`
 * is content-type agnostic, so this only differs in the user-facing wording and
 * the return key. The Video block stores the returned `{ id, url }`.
 */
export async function uploadPageVideoAction(
  formData: FormData,
): Promise<{ error?: string; video?: UploadedPageVideo }> {
  const user = await getCurrentUser();
  if (!isFdscStaff(user?.role?.type)) {
    return { error: "Nu ai permisiunea necesară pentru această acțiune." };
  }

  const { cookies } = await import("next/headers");
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
      const message = data?.error?.message ?? "Nu am putut încărca fișierul video.";
      throw new ApiError(message, res.status, data?.error?.details);
    }
    const file = Array.isArray(data) ? data[0] : undefined;
    if (typeof file?.id !== "number" || typeof file?.url !== "string") {
      return { error: "Nu am putut încărca fișierul video." };
    }
    return {
      video: {
        id: file.id,
        url: file.url,
        name: typeof file.name === "string" ? file.name : "video",
      },
    };
  } catch (err) {
    return {
      error: getApiErrorMessage(err, "Nu am putut încărca fișierul video."),
    };
  }
}

export interface UploadedPageDocument {
  id: number;
  url: string;
  name: string;
  /** Strapi's `ext`, e.g. `".pdf"` — the Documents block shows it as a badge. */
  ext: string;
  /** Strapi reports file size in KB. `null` when the response omits it. */
  size: number | null;
}

/**
 * Same as `uploadPageVideoAction` but for a downloadable document (PDF, DOCX,
 * XLSX, …). Also passes through `ext` and `size` from Strapi's upload response
 * so the Documents block can render the type badge and "· 128 KB" line without
 * a second request.
 */
export async function uploadPageDocumentAction(
  formData: FormData,
): Promise<{ error?: string; document?: UploadedPageDocument }> {
  const user = await getCurrentUser();
  if (!isFdscStaff(user?.role?.type)) {
    return { error: "Nu ai permisiunea necesară pentru această acțiune." };
  }

  const { cookies } = await import("next/headers");
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
      console.error(
        "[uploadPageDocumentAction] Strapi upload failed",
        res.status,
        data,
      );
      const message = data?.error?.message ?? "Nu am putut încărca documentul.";
      throw new ApiError(message, res.status, data?.error?.details);
    }
    const file = Array.isArray(data) ? data[0] : undefined;
    if (typeof file?.id !== "number" || typeof file?.url !== "string") {
      console.error(
        "[uploadPageDocumentAction] unexpected upload response shape",
        data,
      );
      return { error: "Nu am putut încărca documentul." };
    }
    return {
      document: {
        id: file.id,
        url: file.url,
        name: typeof file.name === "string" ? file.name : "document",
        ext: typeof file.ext === "string" ? file.ext : "",
        size: typeof file.size === "number" ? file.size : null,
      },
    };
  } catch (err) {
    console.error("[uploadPageDocumentAction] threw", err);
    return {
      error: getApiErrorMessage(err, "Nu am putut încărca documentul."),
    };
  }
}
