/**
 * Types for library articles, kept apart from `articles.ts` so client
 * components can import them without pulling in `serverApiFetch`. The block and
 * audience types are shared with pages rather than redeclared — an article
 * stores exactly the same block tree.
 */

import type { PageBlock, VisibilityAudience } from "./pages-types";

export type { PageBlock, VisibilityAudience };

/** A category or subcategory as an article reports it. */
export interface ArticleTaxonomyRef {
  documentId: string;
  nume: string;
  slug: string;
}

export interface ArticleSummary {
  documentId: string;
  titlu: string;
  slug: string;
  rezumat: string;
  /**
   * The article's public URL, derived by the backend from the subcategory and
   * its parent: `/biblioteca/juridic-fiscal/fiscalitate/ghid-fiscal`. Null when
   * the taxonomy relation is incomplete.
   */
  cale: string | null;
  /** Derived from `subcategorie.parinte` — never stored on the article itself. */
  categorie: ArticleTaxonomyRef | null;
  subcategorie: ArticleTaxonomyRef | null;
  autor: string;
  etichete: string[];
  tip: string;
  publicat: boolean;
  vizibilitate: VisibilityAudience[];
  /** Set on the first publish and never recleared, so a draft may still carry one. */
  dataPublicarii: string | null;
  actualizat: string;
}

export interface ArticleDetail extends ArticleSummary {
  blocuri: PageBlock[];
}

export interface ArticleListResult {
  data: ArticleSummary[];
  meta: { pagination: { page: number; pageSize: number; total: number; pageCount: number } };
}

/**
 * An article as the block editor's picker and the canvas preview need it: the
 * card fields the renderer reads, plus both taxonomy ids so the category
 * filter can be applied without walking a tree.
 *
 * Produced whole by `GET /api/articles/options` — unpaginated and already
 * sorted newest-first by `dataPublicarii`, so no client-side projection or
 * re-sort stands between the endpoint and the picker.
 */
export interface ArticleOption {
  documentId: string;
  titlu: string;
  rezumat: string;
  cale: string | null;
  /** The category's display name, matching what the backend injects. */
  categorie: string | null;
  categorieId: string | null;
  subcategorieId: string | null;
  etichete: string[];
  tip: string;
  /**
   * Publication state and audience, carried so the builder canvas can mark a
   * card the public read would drop. `options` is deliberately unfiltered — an
   * editor picks from their own drafts too — so the filtering the public page
   * applies has to be visible here instead.
   */
  stare: "schita" | "publicat";
  vizibilitate: VisibilityAudience[];
  dataPublicarii: string | null;
}

