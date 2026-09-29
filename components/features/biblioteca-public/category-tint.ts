export interface CategoryTint {
  bg: string;
  fg: string;
}

/**
 * One accent per icon, so a category's mark and its tint are one decision.
 * Keyed by resolved lucide name; these are the twelve icons categories could
 * use before the full lucide set, and they keep their exact original colours.
 */
const LEGACY_TINTS: Record<string, CategoryTint> = {
  folder: { bg: "#dcfafb", fg: "#5656e5" },
  settings: { bg: "#dcfafb", fg: "#5656e5" },
  scale: { bg: "#fef2f2", fg: "#dc2626" },
  "message-square": { bg: "#ecfdf5", fg: "#047857" },
  "trending-up": { bg: "#fffbeb", fg: "#b45309" },
  users: { bg: "#f5f3ff", fg: "#7c3aed" },
  award: { bg: "#ecfdf5", fg: "#047857" },
  "book-open": { bg: "#dcfafb", fg: "#5656e5" },
  globe: { bg: "#ecfeff", fg: "#0e7490" },
  heart: { bg: "#fdf2f8", fg: "#db2777" },
  briefcase: { bg: "#f8fafc", fg: "#475569" },
  calendar: { bg: "#fffbeb", fg: "#b45309" },
};

/** The distinct colour pairs above, for every other icon. */
const PALETTE: CategoryTint[] = [
  ...new Map(
    Object.values(LEGACY_TINTS).map((tint) => [tint.bg + tint.fg, tint]),
  ).values(),
];

/**
 * Tint for a category card's icon chip. Any icon outside the original twelve
 * gets a colour from the same palette, picked by a stable hash of its name so
 * a category keeps its colour across renders and a grid stays varied.
 */
export function categoryTint(iconName: string): CategoryTint {
  const legacy = LEGACY_TINTS[iconName];
  if (legacy) return legacy;
  let hash = 0;
  for (const char of iconName) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}
