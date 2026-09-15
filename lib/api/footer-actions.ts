"use server";

import { revalidatePath } from "next/cache";
import { getApiErrorMessage } from "./client";
import { sanitizeFooterRichText } from "@/lib/footer-rich-text.server";
import { revalidateDashboardPath } from "./revalidate";
import { serverApiFetch } from "./server";
import { getCurrentUser } from "./session-server";
import { isFdscStaff } from "@/lib/roles";
import type { SocialLink } from "./footer-types";

export interface UpdateFooterInput {
  description: string;
  copyright: string;
  socials: SocialLink[];
}

/**
 * Saves the footer's left side. A Server Action is an addressable endpoint, so
 * the staff check lives here as well as in the layout that renders the screen.
 */
export async function updateFooterAction(
  input: UpdateFooterInput,
): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!isFdscStaff(user?.role?.type)) {
    return { error: "Nu ai permisiunea necesară pentru această acțiune." };
  }

  try {
    await serverApiFetch("/api/footer", {
      method: "PUT",
      // The Server Action is an addressable endpoint, so sanitising in the
      // editor was never a control. It happens here, on the way to the backend.
      body: JSON.stringify({
        ...input,
        description: sanitizeFooterRichText(input.description),
      }),
    });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut salva footerul.") };
  }

  revalidateDashboardPath("/dashboard/fdsc/meniuri");
  // The footer is rendered by the root layout, so every public page holds a
  // copy of it in its cache entry.
  revalidatePath("/", "layout");
  return {};
}
