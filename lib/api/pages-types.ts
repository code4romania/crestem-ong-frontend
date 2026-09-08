/**
 * Types and labels for pages, kept apart from `pages.ts` so client
 * components can import them without pulling in `serverApiFetch` — and with it
 * `next/headers`, which only server code may touch.
 */

export const VISIBILITY_AUDIENCES = [
  "public",
  "fdsc",
  "mentor",
  "ngo-admin",
  "ngo-member",
  "individual",
] as const;

export type VisibilityAudience = (typeof VISIBILITY_AUDIENCES)[number];

export const AUDIENCE_LABEL: Record<VisibilityAudience, string> = {
  public: "Public",
  fdsc: "FDSC",
  mentor: "Persoană resursă",
  "ngo-admin": "Admin ONG",
  "ngo-member": "Membru ONG",
  individual: "Cont individual",
};

/** One placed block. Matches `BlockInstance` in the page builder. */
export interface PageBlock {
  id: string;
  type: string;
  data: unknown;
}

export interface PageSummary {
  documentId: string;
  titlu: string;
  slug: string;
  /**
   * The page's full URL path, parents included: `/programe/accelerator`. Derived
   * by the backend from the `parinte` chain, never stored, so it is always the
   * address the page actually answers at.
   */
  cale: string;
  /** The parent page's documentId, or null for a top-level page. */
  parinte: string | null;
  publicat: boolean;
  vizibilitate: VisibilityAudience[];
  actualizat: string;
}

export interface PageDetail extends PageSummary {
  blocuri: PageBlock[];
}

export interface PageListResult {
  data: PageSummary[];
  meta: { pagination: { page: number; pageSize: number; total: number; pageCount: number } };
}

/** A page as the menu editor's picker needs it: enough to choose, and to warn. */
export interface PageOption {
  documentId: string;
  titlu: string;
  slug: string;
  /** The page's full path, so a picker can show where the link actually goes. */
  cale: string;
  parinte: string | null;
  publicat: boolean;
}
