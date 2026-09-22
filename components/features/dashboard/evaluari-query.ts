export const EVALUARI_BASE_PATH = "/dashboard/evaluari";

/** The whole state of the Evaluări list that lives in the URL. */
export interface EvaluariQuery {
  tab: string;
  search?: string;
  ongs?: string[];
  programs?: string[];
  status?: string;
  page?: number;
}

/**
 * The single place the list's URL is written. The tabs, the filters and the
 * pagination all build their links here, so a filter cannot be carried by one
 * of them and silently dropped by another.
 */
export function evaluariHref(
  { tab, search, ongs, programs, status, page }: EvaluariQuery,
  basePath: string = EVALUARI_BASE_PATH,
) {
  const params = new URLSearchParams();
  params.set("tab", tab);
  if (search) params.set("search", search);
  if (ongs?.length) params.set("ongs", ongs.join(","));
  if (programs?.length) params.set("programs", programs.join(","));
  if (status) params.set("status", status);
  // Page 1 is the default the page component falls back to — leaving it out
  // keeps the address of a first page identical however it was reached.
  if (page && page > 1) params.set("page", String(page));
  return `${basePath}?${params.toString()}`;
}

/** Whether anything is narrowing the list — drives the reset control. */
export function hasActiveEvaluariFilters({
  search,
  ongs,
  programs,
  status,
}: Omit<EvaluariQuery, "tab" | "page">) {
  return Boolean(search || ongs?.length || programs?.length || status);
}
