import type { OngEvaluationRespondent } from "@/lib/api/ongs";
import type { DimensionComment } from "@/lib/api/reports";

/**
 * Arguments grouped by dimension, attributed. FDSC staff and mentors are the
 * only readers of members' arguments, so respondents are named here; the ONG
 * admin never receives them.
 *
 * Pass `attributed: false` on a single respondent's own page, where repeating
 * their name above every argument says nothing.
 */
export function collectComments(
  respondents: OngEvaluationRespondent[],
  { attributed = true }: { attributed?: boolean } = {},
): Record<string, DimensionComment[]> {
  const byDimension: Record<string, DimensionComment[]> = {};
  for (const respondent of respondents) {
    for (const block of respondent.dimensions ?? []) {
      const text = (block.comment ?? "").trim();
      if (!block.submitted || !text) continue;
      byDimension[block.dimensionKey] ??= [];
      byDimension[block.dimensionKey].push({
        author: attributed ? respondent.user?.nume ?? null : null,
        text,
      });
    }
  }
  return byDimension;
}
