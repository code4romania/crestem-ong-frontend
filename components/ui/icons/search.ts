function normalise(text: string): string {
  return text.trim().toLowerCase().replace(/[\s_]+/g, "-");
}

/**
 * lucide.dev-style search over icon names and their English tags. Ranked by
 * rank tier (exact name → name prefix → name contains → exact tag → tag
 * contains), alphabetically within a tier. Empty query → `[]`.
 */
export function searchIcons(
  query: string,
  tags: Record<string, string[]>,
): string[] {
  const q = normalise(query);
  if (!q) return [];
  const qWords = q.replace(/-/g, " ");

  const ranked: { name: string; rank: number }[] = [];
  for (const [name, iconTags] of Object.entries(tags)) {
    let rank: number | null = null;
    if (name === q) rank = 0;
    else if (name.startsWith(q)) rank = 1;
    else if (name.includes(q)) rank = 2;
    else {
      const lowered = iconTags.map((tag) => tag.toLowerCase());
      if (lowered.includes(qWords)) rank = 3;
      else if (lowered.some((tag) => tag.includes(qWords))) rank = 4;
    }
    if (rank !== null) ranked.push({ name, rank });
  }

  return ranked
    .sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name))
    .map((entry) => entry.name);
}
