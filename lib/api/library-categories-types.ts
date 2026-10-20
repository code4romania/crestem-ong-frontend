/**
 * Types and labels for the library taxonomy, kept apart from
 * `library-categories.ts` so client components can import them without pulling
 * in `serverApiFetch` — and with it `next/headers`, which only server code may
 * touch. Same split as `pages-types.ts`.
 */

export interface LibrarySubcategory {
  documentId: string;
  nume: string;
  slug: string;
  descriere: string;
  /**
   * Stored icon value: `lucide:<name>`, or a legacy key of the old twelve-icon
   * palette (`folder`, `book`…). Read it with scope `library` — see
   * `components/ui/icons`.
   */
  icon: string;
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
