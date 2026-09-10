"use server";

import { revalidatePath } from "next/cache";
import { getApiErrorMessage } from "./client";
import { revalidateDashboardPath } from "./revalidate";
import { serverApiFetch } from "./server";
import { getCurrentUser } from "./session-server";
import { isFdscStaff } from "@/lib/roles";
import type { LibraryIconKey } from "./library-categories-types";

export interface CategoryInput {
  nume: string;
  slug: string;
  /** Parent category documentId, or null for a top-level category. */
  parinte: string | null;
  descriere: string;
  icon: LibraryIconKey;
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
 * A category's slug is a segment of every article path beneath it, so a change
 * here moves those URLs. The whole public tree is the honest invalidation.
 */
function revalidateTaxonomy() {
  revalidateDashboardPath("/dashboard/fdsc/biblioteca/categorii");
  revalidateDashboardPath("/dashboard/fdsc/biblioteca");
  revalidatePath("/biblioteca", "layout");
}

export async function createCategoryAction(
  input: CategoryInput,
): Promise<{ error?: string; documentId?: string }> {
  const forbidden = await refuseNonStaff();
  if (forbidden) return forbidden;

  try {
    const { data } = await serverApiFetch<{ data: { documentId: string } }>(
      "/api/library-categories",
      { method: "POST", body: JSON.stringify(input) },
    );
    revalidateTaxonomy();
    return { documentId: data.documentId };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut crea categoria.") };
  }
}

export async function updateCategoryAction(
  documentId: string,
  input: Partial<CategoryInput>,
): Promise<{ error?: string }> {
  const forbidden = await refuseNonStaff();
  if (forbidden) return forbidden;

  try {
    await serverApiFetch(`/api/library-categories/${documentId}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut salva categoria.") };
  }

  revalidateTaxonomy();
  return {};
}

export async function deleteCategoryAction(documentId: string): Promise<{ error?: string }> {
  const forbidden = await refuseNonStaff();
  if (forbidden) return forbidden;

  try {
    await serverApiFetch(`/api/library-categories/${documentId}`, { method: "DELETE" });
  } catch (err) {
    // The backend answers 409 with the count — "Subcategoria are 2 articole.
    // Mută-le sau șterge-le mai întâi." — which is the message worth showing.
    return { error: getApiErrorMessage(err, "Nu am putut șterge categoria.") };
  }

  revalidateTaxonomy();
  return {};
}
