"use server";

import { revalidatePath } from "next/cache";
import { ApiError, getApiErrorMessage } from "./client";
import { revalidateDashboardPath } from "@/lib/api/revalidate";
import { serverApiFetch } from "./server";
import { getCurrentUser } from "./session-server";
import { SESSION_COOKIE } from "./session-cookies";
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

async function uploadRawFile(file: File): Promise<number> {
  const { cookies } = await import("next/headers");
  const jwt = (await cookies()).get(SESSION_COOKIE)?.value;
  const form = new FormData();
  form.append("files", file);
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
    method: "POST",
    headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined,
    body: form,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(data?.error?.message ?? "Încărcarea fișierului a eșuat.", res.status);
  }
  const uploaded = Array.isArray(data) ? data[0] : undefined;
  if (typeof uploaded?.id !== "number") throw new ApiError("Răspuns neașteptat la încărcare.", 502);
  return uploaded.id;
}

export async function uploadMediaAssetAction(
  formData: FormData,
): Promise<{ error?: string; asset?: MediaAssetDetail }> {
  const forbidden = await refuseNonStaff();
  if (forbidden) return forbidden;

  const file = formData.get("file");
  const titlu = String(formData.get("titlu") ?? "").trim();
  if (!(file instanceof File)) return { error: "Selectează un fișier." };
  if (!titlu) return { error: "Adaugă un titlu." };

  const descriereRaw = formData.get("descriere");
  const eticheteRaw = formData.get("eticheteIds");
  let eticheteIds: number[] | undefined;
  if (typeof eticheteRaw === "string" && eticheteRaw) {
    try {
      eticheteIds = JSON.parse(eticheteRaw);
    } catch {
      return { error: "Etichete invalide." };
    }
  }

  let fisierId: number;
  try {
    fisierId = await uploadRawFile(file);
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut adăuga fișierul în bibliotecă.") };
  }

  try {
    const { data } = await serverApiFetch<{ data: MediaAssetDetail }>("/api/media-assets", {
      method: "POST",
      body: JSON.stringify({
        fisierId,
        titlu,
        descriere: typeof descriereRaw === "string" && descriereRaw ? descriereRaw : undefined,
        eticheteIds,
      }),
    });
    revalidateDashboardPath(LIBRARY_PATH);
    return { asset: data };
  } catch (err) {
    // The upload.file row is now unreachable (the library only shows it once a
    // media-asset owns it). Best-effort purge; keep the original error.
    await serverApiFetch("/api/media-assets/cleanup-orphan-file", {
      method: "POST",
      body: JSON.stringify({ fisierId }),
    }).catch(() => {});
    return { error: getApiErrorMessage(err, "Nu am putut adăuga fișierul în bibliotecă.") };
  }
}

/**
 * Batch counterpart of `uploadMediaAssetAction`: uploads the whole selection in
 * one `/api/upload` call, then creates one media-asset per file (title = the
 * file name, no tags/description yet — those are set afterwards in the batch
 * panel or the per-asset editor). A per-file create failure is recorded in
 * `failed` and its orphaned upload row is best-effort purged; the rest still
 * land. A failure of the upload call itself aborts the batch with `error`.
 */
export async function uploadMediaAssetsBatchAction(
  formData: FormData,
): Promise<{ error?: string; assets: MediaAssetDetail[]; failed: string[] }> {
  const forbidden = await refuseNonStaff();
  if (forbidden) return { error: forbidden.error, assets: [], failed: [] };

  const files = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return { error: "Selectează cel puțin un fișier.", assets: [], failed: [] };
  }

  const { cookies } = await import("next/headers");
  const jwt = (await cookies()).get(SESSION_COOKIE)?.value;
  const uploadForm = new FormData();
  for (const f of files) uploadForm.append("files", f);

  let uploaded: { id: number; name?: string }[];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
      method: "POST",
      headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined,
      body: uploadForm,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !Array.isArray(data)) {
      throw new ApiError(
        data?.error?.message ?? "Încărcarea fișierelor a eșuat.",
        res.status,
      );
    }
    uploaded = data;
  } catch (err) {
    return {
      error: getApiErrorMessage(err, "Nu am putut încărca fișierele."),
      assets: [],
      failed: [],
    };
  }

  const assets: MediaAssetDetail[] = [];
  const failed: string[] = [];
  for (const row of uploaded) {
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

export async function replaceMediaAssetFileAction(
  documentId: string,
  formData: FormData,
): Promise<{ error?: string; asset?: MediaAssetDetail }> {
  const forbidden = await refuseNonStaff();
  if (forbidden) return forbidden;

  const file = formData.get("files");
  if (!(file instanceof File)) return { error: "Selectează un fișier." };

  const { cookies } = await import("next/headers");
  const jwt = (await cookies()).get(SESSION_COOKIE)?.value;
  const body = new FormData();
  body.append("files", file);

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/media-assets/${documentId}/replace`,
      { method: "POST", headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined, body },
    );
    const data = await res.json().catch(() => null);
    // 409 = the new file's format differs from the current one. The backend
    // message names the required format; surface it as a plain error.
    if (res.status === 409) {
      return { error: data?.error?.message ?? "Fișierul nou are alt format decât cel curent." };
    }
    if (!res.ok) throw new ApiError(data?.error?.message ?? "Înlocuirea a eșuat.", res.status);
    for (const cale of (data?.meta?.revalidate ?? []) as string[]) revalidatePath(cale);
    revalidateDashboardPath(LIBRARY_PATH);
    revalidatePath("/", "layout");
    return { asset: data.data };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut înlocui fișierul.") };
  }
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
