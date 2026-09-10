/**
 * Types and labels for the library taxonomy, kept apart from
 * `library-categories.ts` so client components can import them without pulling
 * in `serverApiFetch` — and with it `next/headers`, which only server code may
 * touch. Same split as `pages-types.ts`.
 */

/**
 * The icon palette, identical to the backend's `LIBRARY_ICON_KEYS` in
 * `src/api/library-category/validation/library-category.ts` and to this repo's
 * own `CATEGORY_ICON_KEYS` in `blocks/category-grid/schema.ts`. Kept as a
 * literal here rather than shared: there is no shared package between the two
 * repos, and this list changes about never.
 */
export const LIBRARY_ICON_KEYS = [
  "folder",
  "settings",
  "scale",
  "message",
  "trending",
  "users",
  "award",
  "book",
  "globe",
  "heart",
  "briefcase",
  "calendar",
] as const;

export type LibraryIconKey = (typeof LIBRARY_ICON_KEYS)[number];

export interface LibrarySubcategory {
  documentId: string;
  nume: string;
  slug: string;
  descriere: string;
  icon: LibraryIconKey;
  /** Articles filed here, drafts included. */
  numarArticole: number;
}

export interface LibraryCategory extends LibrarySubcategory {
  /**
   * A category's own `numarArticole` is the sum of these — an article attaches
   * to a subcategory, never to a bare category.
   */
  copii: LibrarySubcategory[];
}
