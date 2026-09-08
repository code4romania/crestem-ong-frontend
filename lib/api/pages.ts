import { ApiError } from "./client";
import { serverApiFetch } from "./server";
import type { PageDetail, PageListResult, PageOption } from "./pages-types";

export * from "./pages-types";

export async function listPages(params: { search?: string; page?: number } = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.page && params.page > 1) query.set("page", String(params.page));
  const suffix = query.toString() ? `?${query}` : "";

  return serverApiFetch<PageListResult>(`/api/pages${suffix}`);
}

export async function getPage(documentId: string): Promise<PageDetail> {
  const { data } = await serverApiFetch<{ data: PageDetail }>(`/api/pages/${documentId}`);
  return data;
}

async function readPublicPage(path: string, anonymous: boolean): Promise<PageDetail> {
  // The path travels as a query rather than a route segment: a nested page's
  // path carries slashes, which a `:slug` param cannot hold.
  const { data } = await serverApiFetch<{ data: PageDetail }>(
    `/api/public/pages?path=${encodeURIComponent(path)}`,
    undefined,
    { anonymous },
  );
  return data;
}

// A 403 means the caller isn't entitled to this page, which is a 404 to them —
// the backend never reveals that a restricted page exists.
function isMissingToCaller(err: unknown) {
  return err instanceof ApiError && (err.status === 404 || err.status === 403);
}

/** The public read, by full path. Returns null when the page is missing or not visible. */
export async function getPublicPage(path: string): Promise<PageDetail | null> {
  try {
    return await readPublicPage(path, false);
  } catch (err) {
    // 401 means the session cookie carries a JWT the backend rejects (expired,
    // or signed with a rotated secret). `/api/public/pages` keeps auth on
    // so an entitled visitor sees restricted pages, so a bad token 401s there —
    // and the proxy that repairs cookies only matches `/dashboard` and `/api`,
    // never a public page. Read it anonymously rather than crashing the render.
    if (err instanceof ApiError && err.status === 401) {
      try {
        return await readPublicPage(path, true);
      } catch (retryErr) {
        if (isMissingToCaller(retryErr)) return null;
        throw retryErr;
      }
    }

    if (isMissingToCaller(err)) return null;
    throw err;
  }
}

/**
 * Every page, trimmed for the menu editor's page picker. Unpaginated, matching
 * the endpoint — the picker has to offer all of them at once.
 */
export async function listPageOptions(): Promise<PageOption[]> {
  const { data } = await serverApiFetch<{ data: PageOption[] }>("/api/pages/options");
  return data;
}
