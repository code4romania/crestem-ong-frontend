"use server";

import { revalidatePath } from "next/cache";
import { getApiErrorMessage } from "./client";
import { revalidateDashboardPath } from "./revalidate";
import { getPage } from "./pages";
import { serverApiFetch } from "./server";
import { getCurrentUser } from "./session-server";
import { isFdscStaff } from "@/lib/roles";
import type { PageBlock, VisibilityAudience } from "./pages-types";

export interface PageInput {
  titlu: string;
  slug: string;
  /** Parent page documentId, or null for a top-level page. */
  parinte: string | null;
  vizibilitate: VisibilityAudience[];
  blocuri: PageBlock[];
}

const FORBIDDEN = "Nu ai permisiunea necesară pentru această acțiune.";

/**
 * A Server Action is an addressable endpoint, so the staff check lives here as
 * well as in the layout that renders the screens. The backend refuses the same
 * calls through `global::is-fdsc-staff`.
 */
async function refuseNonStaff(): Promise<{ error: string } | null> {
  const user = await getCurrentUser();
  return isFdscStaff(user?.role?.type) ? null : { error: FORBIDDEN };
}

/**
 * A page is addressed by its full path, so the cache key is that path and not
 * the bare slug. Moving a page also changes the path of everything beneath it,
 * and of every menu item and CTA pointing at it, so a changed path invalidates
 * the whole public tree; an edit in place costs only the page itself.
 */
function revalidatePage(
  cale: string,
  { previousCale, wholeTree }: { previousCale?: string; wholeTree?: boolean } = {},
) {
  revalidateDashboardPath("/dashboard/fdsc/pagini");
  revalidatePath(cale);

  const moved = Boolean(previousCale && previousCale !== cale);
  if (previousCale && moved) revalidatePath(previousCale);
  if (moved || wholeTree) revalidatePath("/", "layout");
}

export async function createPageAction(
  input: PageInput,
): Promise<{ error?: string; documentId?: string }> {
  const forbidden = await refuseNonStaff();
  if (forbidden) return forbidden;

  try {
    const { data } = await serverApiFetch<{ data: { documentId: string; cale: string } }>(
      "/api/pages",
      { method: "POST", body: JSON.stringify(input) },
    );
    revalidatePage(data.cale);
    return { documentId: data.documentId };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut crea pagina.") };
  }
}

export async function updatePageAction(
  documentId: string,
  input: PageInput,
  previousCale?: string,
): Promise<{ error?: string }> {
  const forbidden = await refuseNonStaff();
  if (forbidden) return forbidden;

  let cale: string;
  try {
    const { data } = await serverApiFetch<{ data: { cale: string } }>(
      `/api/pages/${documentId}`,
      { method: "PUT", body: JSON.stringify(input) },
    );
    cale = data.cale;
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut salva pagina.") };
  }

  revalidatePage(cale, { previousCale });
  return {};
}

/**
 * The page's own path, read back from the backend. A caller would otherwise
 * have to compute it from the parent chain to know which cache key to drop,
 * which is exactly the duplication deriving the path was meant to avoid.
 */
async function currentCale(documentId: string): Promise<string | null> {
  try {
    return (await getPage(documentId)).cale;
  } catch {
    return null;
  }
}

export async function deletePageAction(documentId: string): Promise<{ error?: string }> {
  const forbidden = await refuseNonStaff();
  if (forbidden) return forbidden;

  const cale = await currentCale(documentId);

  try {
    await serverApiFetch(`/api/pages/${documentId}`, { method: "DELETE" });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut șterge pagina.") };
  }

  // Deleting a parent leaves its subpages at the top level, so their paths move
  // too — the whole public tree is stale either way.
  if (cale) revalidatePage(cale, { wholeTree: true });
  return {};
}

export async function setPagePublishedAction(
  documentId: string,
  published: boolean,
): Promise<{ error?: string }> {
  const forbidden = await refuseNonStaff();
  if (forbidden) return forbidden;

  const cale = await currentCale(documentId);

  try {
    await serverApiFetch(
      `/api/pages/${documentId}/${published ? "publish" : "unpublish"}`,
      { method: "POST" },
    );
  } catch (err) {
    return {
      error: getApiErrorMessage(
        err,
        published ? "Nu am putut publica pagina." : "Nu am putut retrage pagina.",
      ),
    };
  }

  if (cale) revalidatePage(cale);
  return {};
}
