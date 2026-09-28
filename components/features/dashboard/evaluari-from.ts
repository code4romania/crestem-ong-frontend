export const EVALUARI_LIST_PATH = "/dashboard/evaluari";

/**
 * The list's rows open pages that live under Organizații. They carry the list's
 * own URL in this param so those pages can send the user back to the list they
 * came from — filters, tab and page intact — rather than into the
 * organization's account.
 */
export const EVALUARI_FROM_PARAM = "from";

export function withEvaluariFrom(href: string, listHref: string) {
  return `${href}?${EVALUARI_FROM_PARAM}=${encodeURIComponent(listHref)}`;
}

/**
 * The param arrives from the address bar, so only the Evaluări list itself is
 * accepted as a destination — anything else would make the back link an open
 * redirect.
 */
export function evaluariFromParam(value: string | string[] | undefined): string | null {
  if (typeof value !== "string" || !value.startsWith(EVALUARI_LIST_PATH)) return null;
  const next = value.charAt(EVALUARI_LIST_PATH.length);
  return next === "" || next === "?" ? value : null;
}

/** Which tab of the list a `from` URL points at. */
export function evaluariFromTab(listHref: string) {
  const query = listHref.split("?")[1] ?? "";
  return new URLSearchParams(query).get("tab") ?? "utilizatori";
}
