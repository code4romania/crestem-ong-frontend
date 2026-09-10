import { serverApiFetch } from "./server";
import type { ArticleDetail, ArticleListResult, ArticleOption } from "./articles-types";

export * from "./articles-types";

export async function listArticles(params: { search?: string; page?: number } = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.page && params.page > 1) query.set("page", String(params.page));
  const suffix = query.toString() ? `?${query}` : "";

  return serverApiFetch<ArticleListResult>(`/api/articles${suffix}`);
}

/**
 * Every article, trimmed for the `article-grid` block's picker and the builder's
 * canvas preview. Unpaginated and sorted newest-first by `dataPublicarii`,
 * matching the endpoint — `listArticles` is paginated at 20, which a picker
 * cannot work with. Same shape and purpose as `listPageOptions`.
 */
export async function listArticleOptions(): Promise<ArticleOption[]> {
  const { data } = await serverApiFetch<{ data: ArticleOption[] }>("/api/articles/options");
  return data;
}

export async function getArticle(documentId: string): Promise<ArticleDetail> {
  const { data } = await serverApiFetch<{ data: ArticleDetail }>(`/api/articles/${documentId}`);
  return data;
}
