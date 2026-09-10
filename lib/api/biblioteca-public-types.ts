/**
 * Types for the public library, kept apart from `biblioteca-public.ts` so client
 * components can import them without pulling in `serverApiFetch` — and with it
 * `next/headers`, which only server code may touch. Same split as
 * `pages-types.ts`.
 */

import type { LibraryIconKey } from "./library-categories-types";
import type { ArticleSummary } from "./articles-types";

export type { LibraryIconKey };

export interface PublicSubcategory {
  documentId: string;
  nume: string;
  slug: string;
  descriere: string;
  /** Articles this visitor may actually open — not the staff count, which includes drafts. */
  numarArticole: number;
}

export interface PublicCategory extends PublicSubcategory {
  icon: LibraryIconKey;
  copii: PublicSubcategory[];
}

/**
 * The category page's read. `meta.tipuri` is the set of `tip` values present
 * in the category before the `tip` and `q` filters apply — computed by the
 * backend, not derived from `data`, so picking a `tip` never strands the
 * visitor with a dropdown offering only the type they just chose.
 */
export interface PublicArticleListResult {
  data: ArticleSummary[];
  meta: {
    pagination: { page: number; pageSize: number; total: number; pageCount: number };
    tipuri: string[];
  };
}
