import { serverApiFetch } from "./server";
import type { LibraryCategory } from "./library-categories-types";

export * from "./library-categories-types";

/**
 * The whole tree in one call, unpaginated, matching the endpoint. The taxonomy
 * is tens of records and every consumer — the management screen, the article
 * wizard's dropdown, the block editor — wants all of it.
 */
export async function listLibraryCategories(): Promise<LibraryCategory[]> {
  const { data } = await serverApiFetch<{ data: LibraryCategory[] }>("/api/library-categories");
  return data;
}
