import { serverApiFetch } from "./server";
import { sanitizeRichText } from "@/components/features/page-builder/rich-text/sanitize.server";
import type { LibraryCategory } from "./library-categories-types";

export * from "./library-categories-types";

/**
 * The whole tree in one call, unpaginated, matching the endpoint. The taxonomy
 * is tens of records and every consumer — the management screen, the article
 * wizard's dropdown, the block editor — wants all of it.
 *
 * `descriere` is sanitised here too, not only on the way in via
 * `library-categories-actions.ts` — the same belt-and-suspenders as
 * `getMentorProfile`, covering rows saved before this field carried rich text.
 */
export async function listLibraryCategories(): Promise<LibraryCategory[]> {
  const { data } = await serverApiFetch<{ data: LibraryCategory[] }>("/api/library-categories");
  return data.map((category) => ({ ...category, descriere: sanitizeRichText(category.descriere) }));
}
