import type { ArticleOption, RelatedArticleRef } from "./articles-types";

function sharedTagCount(a: string[], b: string[]): number {
  const set = new Set(b);
  return a.filter((tag) => set.has(tag)).length;
}

/**
 * The top 10 other published articles ranked by shared-tag count, for the
 * editor to pick up to 3 from. Runs over `listArticleOptions()`'s already
 * unpaginated read — no dedicated backend endpoint exists for this.
 */
export function rankRelatedCandidates(
  target: { documentId: string; etichete: string[] },
  candidates: ArticleOption[],
): RelatedArticleRef[] {
  return candidates
    .filter((candidate) => candidate.documentId !== target.documentId)
    .filter((candidate) => candidate.stare === "publicat")
    .map((candidate) => ({
      candidate,
      score: sharedTagCount(target.etichete, candidate.etichete),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (b.candidate.dataPublicarii ?? "").localeCompare(a.candidate.dataPublicarii ?? "");
    })
    .slice(0, 10)
    .map(({ candidate }) => ({
      documentId: candidate.documentId,
      titlu: candidate.titlu,
      cale: candidate.cale,
      etichete: candidate.etichete,
      tip: candidate.tip,
    }));
}
