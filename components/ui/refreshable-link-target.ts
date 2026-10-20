/**
 * What clicking a menu entry should do, given where the visitor already is.
 *
 * - `navigate`: an ordinary link click — let Next handle it.
 * - `refresh`: the address is the one already open, so re-fetch it in place.
 * - `reset-and-refresh`: same page, different query string (filters, paging);
 *   swap the address for the link's own and re-fetch.
 */
export type SamePageAction = "navigate" | "refresh" | "reset-and-refresh";

/** Strips a trailing slash so `/biblioteca/` and `/biblioteca` count as one page. */
function normalizePath(path: string) {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

/** Drops the leading `?` so an absent and an empty query string compare equal. */
function normalizeQuery(query: string) {
  return query.startsWith("?") ? query.slice(1) : query;
}

export function samePageAction(
  href: string,
  pathname: string,
  search: string,
): SamePageAction {
  // Anything that is not an in-app path — an external address, a mail link, a
  // bare fragment — is never "the page we are on".
  if (!href.startsWith("/")) return "navigate";

  const [beforeHash] = href.split("#");
  const [hrefPath, hrefQuery = ""] = beforeHash.split("?");

  if (normalizePath(hrefPath) !== normalizePath(pathname)) return "navigate";
  return normalizeQuery(hrefQuery) === normalizeQuery(search) ? "refresh" : "reset-and-refresh";
}
