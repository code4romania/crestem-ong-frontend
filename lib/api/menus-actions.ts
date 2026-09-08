"use server";

import { revalidatePath } from "next/cache";
import { getApiErrorMessage } from "./client";
import { revalidateDashboardPath } from "./revalidate";
import { serverApiFetch } from "./server";
import { getCurrentUser } from "./session-server";
import { isFdscStaff } from "@/lib/roles";
import type { MenuItem, MenuLocation } from "./menus";

/**
 * Replaces a menu's whole item tree. Add, edit, delete, reorder and re-nest all
 * come through here — menu items are Strapi components with no identifier of
 * their own, so the tree is the unit of change.
 *
 * A Server Action is an addressable endpoint, so the staff check lives here as
 * well as in the layout that renders the screen. The backend refuses the same
 * call through `global::is-fdsc-staff`.
 */
export async function updateMenuItemsAction(
  location: MenuLocation,
  items: MenuItem[],
): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!isFdscStaff(user?.role?.type)) {
    return { error: "Nu ai permisiunea necesară pentru această acțiune." };
  }

  try {
    await serverApiFetch(`/api/menus/${location}`, {
      method: "PUT",
      body: JSON.stringify({ items }),
    });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut salva meniul.") };
  }

  revalidateDashboardPath("/dashboard/fdsc/meniuri");
  // The navbar and footer live in the root layout, so every public page's cache
  // entry carries a copy of the menu.
  revalidatePath("/", "layout");
  return {};
}
