import { ApiError } from "./client";
import { serverApiFetch } from "./server";
import type { PublicCategory, PublicArticleListResult } from "./biblioteca-public-types";
import type { ArticleDetail } from "./articles-types";

export * from "./biblioteca-public-types";

/**
 * A public library read, retried anonymously when the visitor's cookie carries
 * a JWT the backend rejects. These routes deliberately keep auth on so an
 * entitled visitor sees restricted content, which means a bad token 401s them —
 * and a public page must not crash over a stale cookie.
 */
async function readPublic<T>(path: string): Promise<T> {
  try {
    return await serverApiFetch<T>(path);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return await serverApiFetch<T>(path, undefined, { anonymous: true });
    }
    throw err;
  }
}

export async function listPublicCategories(): Promise<PublicCategory[]> {
  const { data } = await readPublic<{ data: PublicCategory[] }>("/api/public/library-categories");
  return data;
}

/**
 * The category page's browse: search, two filters and paging, all by slug or
 * free text — never a documentId. `meta.tipuri` comes back from the server
 * uncoupled from the `tip`/`q` filters, so it must be used as returned rather
 * than derived from `data`.
 */
export async function listPublicArticlesBrowse(
  params: {
    categorie?: string;
    subcategorie?: string;
    tip?: string;
    q?: string;
    page?: number;
  } = {},
): Promise<PublicArticleListResult> {
  const query = new URLSearchParams();
  if (params.categorie) query.set("categorie", params.categorie);
  if (params.subcategorie) query.set("subcategorie", params.subcategorie);
  if (params.tip) query.set("tip", params.tip);
  if (params.q) query.set("q", params.q);
  if (params.page && params.page > 1) query.set("page", String(params.page));
  const suffix = query.toString() ? `?${query}` : "";

  return readPublic<PublicArticleListResult>(`/api/public/articles${suffix}`);
}

/**
 * One article by its full public path. Returns null when it is missing or the
 * visitor may not see it — the backend answers 404 for both, deliberately, so a
 * restricted article does not confirm its own existence.
 */
export async function getPublicArticle(path: string): Promise<ArticleDetail | null> {
  try {
    const { data } = await readPublic<{ data: ArticleDetail }>(
      `/api/public/articles/by-path?path=${encodeURIComponent(path)}`,
    );
    return data;
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 403)) return null;
    throw err;
  }
}
