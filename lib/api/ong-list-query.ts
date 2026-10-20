/** The filters the FDSC organizations list reads, all of them optional. */
export interface OngListParams {
  page: number;
  search: string;
  /** A county documentId, as the filter dropdown supplies it. */
  judet: string;
  /** A program documentId. */
  program: string;
}

/**
 * The query string for one page of the organizations list. Shared by the
 * server-rendered first page and the browser's own requests for the pages after
 * it, so both ask for exactly the same thing.
 *
 * Defaults are left out rather than sent empty: it keeps the URLs readable and
 * the backend treats a missing key and a blank one the same way.
 */
export function ongListQuery({ page, search, judet, program }: OngListParams): string {
  const query = new URLSearchParams();
  if (page > 1) query.set("page", String(page));
  const term = search.trim();
  if (term) query.set("search", term);
  if (judet) query.set("judet", judet);
  if (program) query.set("program", program);
  return query.toString();
}
