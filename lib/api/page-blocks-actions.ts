"use server";

import { serverApiFetch } from "./server";
import { revalidateDashboardPath } from "@/lib/api/revalidate";
import { getCurrentUser } from "./session-server";
import { isFdscStaff } from "@/lib/roles";

const LIBRARY_PATH = "/dashboard/fdsc/media-library";

const stripExt = (name: string) => name.replace(/\.[^.]+$/, "");

/**
 * Best-effort: mirror a just-uploaded page-block file into the Media Library
 * (`media-asset`) so it shows up next to manually-added assets and can be
 * reused from the "Alege din bibliotecă" picker on other blocks — matching what
 * `uploadMediaAssetsBatchAction` does (title = file name without extension, no
 * tags). The block only needs the `/api/upload` result to work, so any failure
 * here is logged and swallowed and the upload row is left in place for the
 * block/page media resolver. A 409 means the file is already registered.
 */
async function registerInMediaLibrary(
  fisierId: number,
  rawName: unknown,
  fallbackTitlu: string,
): Promise<void> {
  const stripped =
    typeof rawName === "string" ? stripExt(rawName).trim() : "";
  const titlu = (stripped || fallbackTitlu).slice(0, 200);
  try {
    await serverApiFetch("/api/media-assets", {
      method: "POST",
      body: JSON.stringify({ fisierId, titlu }),
    });
    revalidateDashboardPath(LIBRARY_PATH);
  } catch (err) {
    console.error(
      "[page-blocks-actions] media-library registration failed",
      fisierId,
      err,
    );
  }
}

export interface UploadedPageImage {
  id: number;
  url: string;
  name: string;
}

/** The Strapi `/api/upload` file the browser already uploaded directly. */
interface DirectUploadedFile {
  id: number;
  url: string;
  name?: string;
  ext?: string;
  size?: number;
}

/**
 * Registers a page-block image the browser already uploaded directly to
 * Strapi's `/api/upload` (`lib/api/upload-direct.ts`) — bypassing this Server
 * Action for the raw bytes avoids Vercel's hard 4.5MB Function body limit,
 * which a multipart file upload here would otherwise hit. Mirrors it into the
 * Media Library and returns the `{ id, url, name }` shape the page builder
 * holds in block data.
 *
 * A Server Action is an addressable endpoint, so the FDSC-staff check lives here
 * as well as in the layout that renders the builder.
 */
export async function uploadPageImageAction(
  file: DirectUploadedFile,
): Promise<{ error?: string; image?: UploadedPageImage }> {
  const user = await getCurrentUser();
  if (!isFdscStaff(user?.role?.type)) {
    return { error: "Nu ai permisiunea necesară pentru această acțiune." };
  }

  await registerInMediaLibrary(file.id, file.name, "Imagine");
  return {
    image: {
      id: file.id,
      url: file.url,
      name: typeof file.name === "string" ? file.name : "imagine",
    },
  };
}

export interface UploadedPageVideo {
  id: number;
  url: string;
  name: string;
}

/**
 * Same as `uploadPageImageAction` but for a video file already uploaded
 * directly to Strapi — only differs in the return key and fallback title.
 */
export async function uploadPageVideoAction(
  file: DirectUploadedFile,
): Promise<{ error?: string; video?: UploadedPageVideo }> {
  const user = await getCurrentUser();
  if (!isFdscStaff(user?.role?.type)) {
    return { error: "Nu ai permisiunea necesară pentru această acțiune." };
  }

  await registerInMediaLibrary(file.id, file.name, "Fișier video");
  return {
    video: {
      id: file.id,
      url: file.url,
      name: typeof file.name === "string" ? file.name : "video",
    },
  };
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
 * XLSX, …) already uploaded directly to Strapi. Also passes through `ext` and
 * `size` from that upload response so the Documents block can render the type
 * badge and "· 128 KB" line without a second request.
 */
export async function uploadPageDocumentAction(
  file: DirectUploadedFile,
): Promise<{ error?: string; document?: UploadedPageDocument }> {
  const user = await getCurrentUser();
  if (!isFdscStaff(user?.role?.type)) {
    return { error: "Nu ai permisiunea necesară pentru această acțiune." };
  }

  await registerInMediaLibrary(file.id, file.name, "Document");
  return {
    document: {
      id: file.id,
      url: file.url,
      name: typeof file.name === "string" ? file.name : "document",
      ext: typeof file.ext === "string" ? file.ext : "",
      size: typeof file.size === "number" ? file.size : null,
    },
  };
}
