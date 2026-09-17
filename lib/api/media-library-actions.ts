"use server";

import { revalidatePath } from "next/cache";
import { ApiError, getApiErrorMessage } from "./client";
import { revalidateDashboardPath } from "@/lib/api/revalidate";
import { serverApiFetch } from "./server";
import { getCurrentUser } from "./session-server";
import { isFdscStaff } from "@/lib/roles";
import type {
  MediaAssetDetail,
  MediaAssetListResult,
  MediaTag,
  PageUsageRef,
} from "./media-library-types";

const FORBIDDEN = "Nu ai permisiunea necesară pentru această acțiune.";
const LIBRARY_PATH = "/dashboard/fdsc/media-library";

const stripExt = (name: string) => name.replace(/\.[^.]+$/, "");

async function refuseNonStaff(): Promise<{ error: string } | null> {
  const user = await getCurrentUser();
  return isFdscStaff(user?.role?.type) ? null : { error: FORBIDDEN };
}

/**
 * Creates the media-asset row for a file the browser already uploaded directly
 * to Strapi's `/api/upload` (`lib/api/upload-direct.ts`) — bypassing this
 * Server Action for the raw bytes avoids Vercel's hard 4.5MB Function body
 * limit, which a multipart file upload here would otherwise hit.
 */
export async function uploadMediaAssetAction(input: {
  fisierId: number;
  titlu: string;
  descriere?: string;
  eticheteIds?: number[];
}): Promise<{ error?: string; asset?: MediaAssetDetail }> {
  const forbidden = await refuseNonStaff();
  if (forbidden) return forbidden;
  if (!input.titlu.trim()) return { error: "Adaugă un titlu." };

  try {
    const { data } = await serverApiFetch<{ data: MediaAssetDetail }>("/api/media-assets", {
      method: "POST",
      body: JSON.stringify({
        fisierId: input.fisierId,
        titlu: input.titlu,
        descriere: input.descriere,
        eticheteIds: input.eticheteIds,
      }),
    });
    revalidateDashboardPath(LIBRARY_PATH);
    return { asset: data };
  } catch (err) {
    // The upload.file row is now unreachable (the library only shows it once a
    // media-asset owns it). Best-effort purge; keep the original error.
    await serverApiFetch("/api/media-assets/cleanup-orphan-file", {
      method: "POST",
      body: JSON.stringify({ fisierId: input.fisierId }),
    }).catch(() => {});
    return { error: getApiErrorMessage(err, "Nu am putut adăuga fișierul în bibliotecă.") };
  }
}

/**
 * Batch counterpart of `uploadMediaAssetAction`: the browser has already
 * uploaded every file directly to Strapi (same reasoning as above), so this
 * only creates one media-asset per uploaded file (title = the file name, no
 * tags/description yet — those are set afterwards in the batch panel or the
 * per-asset editor). A per-file create failure is recorded in `failed` and its
 * orphaned upload row is best-effort purged; the rest still land.
 */
export async function uploadMediaAssetsBatchAction(
  fisiere: { id: number; name?: string }[],
): Promise<{ error?: string; assets: MediaAssetDetail[]; failed: string[] }> {
  const forbidden = await refuseNonStaff();
  if (forbidden) return { error: forbidden.error, assets: [], failed: [] };

  if (fisiere.length === 0) {
    return { error: "Selectează cel puțin un fișier.", assets: [], failed: [] };
  }

  const assets: MediaAssetDetail[] = [];
  const failed: string[] = [];
  for (const row of fisiere) {
    try {
      const { data } = await serverApiFetch<{ data: MediaAssetDetail }>(
        "/api/media-assets",
        {
          method: "POST",
          body: JSON.stringify({
            fisierId: row.id,
            titlu: stripExt(row.name ?? "fișier"),
          }),
        },
      );
      assets.push(data);
    } catch {
      failed.push(row.name ?? String(row.id));
      await serverApiFetch("/api/media-assets/cleanup-orphan-file", {
        method: "POST",
        body: JSON.stringify({ fisierId: row.id }),
      }).catch(() => {});
    }
  }

  if (assets.length) revalidateDashboardPath(LIBRARY_PATH);
  return { assets, failed };
}

export async function updateMediaAssetAction(
  documentId: string,
  input: { titlu?: string; descriere?: string | null; eticheteIds?: number[]; altText?: string },
): Promise<{ error?: string; asset?: MediaAssetDetail }> {
  const forbidden = await refuseNonStaff();
  if (forbidden) return forbidden;
  try {
    const { data } = await serverApiFetch<{ data: MediaAssetDetail }>(
      `/api/media-assets/${documentId}`,
      { method: "PUT", body: JSON.stringify(input) },
    );
    revalidateDashboardPath(LIBRARY_PATH);
    return { asset: data };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut salva modificările.") };
  }
}

/**
 * Finishes a file replace the browser already sent directly to Strapi's
 * `POST /api/media-assets/:id/replace` (`lib/api/upload-direct.ts`'s
 * `postFileDirect` — bypassing this Server Action for the raw bytes, same
 * reasoning as `uploadMediaAssetAction`). Strapi's response is passed straight
 * through; this only applies the resulting cache invalidation, which the
 * browser can't do itself. The caller is expected to have already handled a
 * non-OK response (e.g. a 409 format mismatch) before calling this.
 */
export async function finalizeMediaAssetReplaceAction(
  replaceResponse: { data: MediaAssetDetail; meta?: { revalidate?: string[] } },
): Promise<{ error?: string; asset?: MediaAssetDetail }> {
  const forbidden = await refuseNonStaff();
  if (forbidden) return forbidden;

  for (const cale of replaceResponse.meta?.revalidate ?? []) revalidatePath(cale);
  revalidateDashboardPath(LIBRARY_PATH);
  revalidatePath("/", "layout");
  return { asset: replaceResponse.data };
}

export async function deleteMediaAssetAction(
  documentId: string,
  opts: { force?: boolean } = {},
): Promise<{ error?: string; ok?: boolean; utilizari?: PageUsageRef[] }> {
  const forbidden = await refuseNonStaff();
  if (forbidden) return forbidden;
  try {
    await serverApiFetch(`/api/media-assets/${documentId}${opts.force ? "?force=true" : ""}`, {
      method: "DELETE",
    });
    revalidateDashboardPath(LIBRARY_PATH);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    if (err instanceof ApiError && err.status === 409) {
      const utilizari = (err.details as { utilizari?: PageUsageRef[] } | undefined)?.utilizari ?? [];
      return { utilizari };
    }
    return { error: getApiErrorMessage(err, "Nu am putut șterge fișierul.") };
  }
}

/**
 * Deletes several assets in one round trip. Always forces past the usage guard
 * (the caller confirms up front), so a file used on pages is removed and its
 * blocks fall back to nothing. Returns which ids went and which failed;
 * revalidates once.
 */
export async function deleteMediaAssetsBatchAction(
  documentIds: string[],
): Promise<{ error?: string; deleted: string[]; failed: string[] }> {
  const forbidden = await refuseNonStaff();
  if (forbidden) return { error: forbidden.error, deleted: [], failed: [] };

  const deleted: string[] = [];
  const failed: string[] = [];
  for (const id of documentIds) {
    try {
      await serverApiFetch(`/api/media-assets/${id}?force=true`, { method: "DELETE" });
      deleted.push(id);
    } catch {
      failed.push(id);
    }
  }

  if (deleted.length) {
    revalidateDashboardPath(LIBRARY_PATH);
    revalidatePath("/", "layout");
  }
  return { deleted, failed };
}

export async function getMediaAssetAction(
  documentId: string,
): Promise<{ error?: string; asset?: MediaAssetDetail }> {
  const forbidden = await refuseNonStaff();
  if (forbidden) return forbidden;
  try {
    const { data } = await serverApiFetch<{ data: MediaAssetDetail }>(
      `/api/media-assets/${documentId}`,
    );
    return { asset: data };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut încărca detaliile fișierului.") };
  }
}

export async function createMediaTagAction(
  nume: string,
): Promise<{
  error?: string;
  tag?: { id: number; documentId: string; nume: string; slug: string };
}> {
  const forbidden = await refuseNonStaff();
  if (forbidden) return forbidden;
  try {
    const { data } = await serverApiFetch<{
      data: { id: number; documentId: string; nume: string; slug: string };
    }>(
      "/api/media-tags",
      { method: "POST", body: JSON.stringify({ nume }) },
    );
    revalidateDashboardPath(LIBRARY_PATH);
    return { tag: data };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut crea eticheta.") };
  }
}

export async function deleteMediaTagAction(
  documentId: string,
): Promise<{ error?: string; ok?: boolean }> {
  const forbidden = await refuseNonStaff();
  if (forbidden) return forbidden;
  try {
    await serverApiFetch(`/api/media-tags/${documentId}`, { method: "DELETE" });
    revalidateDashboardPath(LIBRARY_PATH);
    return { ok: true };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut șterge eticheta.") };
  }
}

export async function listMediaAssetsAction(params: {
  search?: string;
  tip?: string;
  etichete?: string[];
  page?: number;
}): Promise<{ error?: string; result?: MediaAssetListResult }> {
  const forbidden = await refuseNonStaff();
  if (forbidden) return forbidden;
  try {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.tip) query.set("tip", params.tip);
    if (params.etichete?.length) query.set("etichete", params.etichete.join(","));
    if (params.page && params.page > 1) query.set("page", String(params.page));
    const suffix = query.toString() ? `?${query}` : "";
    const result = await serverApiFetch<MediaAssetListResult>(`/api/media-assets${suffix}`);
    return { result };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut încărca biblioteca.") };
  }
}

export async function listMediaTagsAction(): Promise<{ error?: string; tags?: MediaTag[] }> {
  const forbidden = await refuseNonStaff();
  if (forbidden) return forbidden;
  try {
    const { data } = await serverApiFetch<{ data: MediaTag[] }>("/api/media-tags");
    return { tags: data };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut încărca etichetele.") };
  }
}
