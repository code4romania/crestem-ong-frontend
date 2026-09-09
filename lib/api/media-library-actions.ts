"use server";

import { revalidatePath } from "next/cache";
import { ApiError, getApiErrorMessage } from "./client";
import { serverApiFetch } from "./server";
import { getCurrentUser } from "./session-server";
import { SESSION_COOKIE } from "./session-cookies";
import { isFdscStaff } from "@/lib/roles";
import type { MediaAssetDetail, PageUsageRef } from "./media-library-types";

const FORBIDDEN = "Nu ai permisiunea necesară pentru această acțiune.";
const LIBRARY_PATH = "/dashboard/fdsc/media-library";

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

  try {
    const fisierId = await uploadRawFile(file);
    const { data } = await serverApiFetch<{ data: MediaAssetDetail }>("/api/media-assets", {
      method: "POST",
      body: JSON.stringify({
        fisierId,
        titlu,
        descriere: typeof descriereRaw === "string" && descriereRaw ? descriereRaw : undefined,
        eticheteIds,
      }),
    });
    revalidatePath(LIBRARY_PATH);
    return { asset: data };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut adăuga fișierul în bibliotecă.") };
  }
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
    revalidatePath(LIBRARY_PATH);
    return { asset: data };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut salva modificările.") };
  }
}

export async function replaceMediaAssetFileAction(
  documentId: string,
  formData: FormData,
  opts: { force?: boolean } = {},
): Promise<{ error?: string; asset?: MediaAssetDetail; mismatch?: boolean }> {
  const forbidden = await refuseNonStaff();
  if (forbidden) return forbidden;

  const file = formData.get("files");
  if (!(file instanceof File)) return { error: "Selectează un fișier." };

  const { cookies } = await import("next/headers");
  const jwt = (await cookies()).get(SESSION_COOKIE)?.value;
  const body = new FormData();
  body.append("files", file);

  const suffix = opts.force ? "?force=true" : "";
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/media-assets/${documentId}/replace${suffix}`,
      { method: "POST", headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined, body },
    );
    const data = await res.json().catch(() => null);
    if (res.status === 409) return { mismatch: true };
    if (!res.ok) throw new ApiError(data?.error?.message ?? "Înlocuirea a eșuat.", res.status);
    for (const cale of (data?.meta?.revalidate ?? []) as string[]) revalidatePath(cale);
    revalidatePath(LIBRARY_PATH);
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
    revalidatePath(LIBRARY_PATH);
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

export async function createMediaTagAction(
  nume: string,
): Promise<{ error?: string; tag?: { nume: string; slug: string } }> {
  const forbidden = await refuseNonStaff();
  if (forbidden) return forbidden;
  try {
    const { data } = await serverApiFetch<{ data: { nume: string; slug: string } }>(
      "/api/media-tags",
      { method: "POST", body: JSON.stringify({ nume }) },
    );
    revalidatePath(LIBRARY_PATH);
    return { tag: data };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut crea eticheta.") };
  }
}
