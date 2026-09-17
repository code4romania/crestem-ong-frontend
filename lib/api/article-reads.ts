import { serverApiFetch } from "./server";

export interface ArticleReadRow {
  documentId: string;
  titlu: string;
  tip: string;
  accessedAt: string;
  /** Null when the article's taxonomy relation is incomplete and it has no addressable URL. */
  cale: string | null;
}

/**
 * Records that the current user opened this article. Best-effort: an
 * anonymous visitor (401) or a transient failure must never break the article
 * page, so every error is swallowed here rather than surfaced.
 */
export async function markArticleRead(articleDocumentId: string): Promise<void> {
  try {
    await serverApiFetch("/api/article-reads/mark-read", {
      method: "POST",
      body: JSON.stringify({ articleDocumentId }),
    });
  } catch {
    // Reading the article succeeded; failing to log it shouldn't be visible.
  }
}

export async function getMyArticleReads(): Promise<ArticleReadRow[]> {
  const { data } = await serverApiFetch<{ data: ArticleReadRow[] }>("/api/article-reads/me");
  return data;
}
