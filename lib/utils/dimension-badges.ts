import { hashIndex } from "./hash";

// No canonical color exists per dimension name — hash the key into a fixed
// palette so each dimension gets a stable, distinct color across the app.
const DIMENSION_BADGE_COLORS = [
  { bg: "#fdf2f8", dot: "#db2777", text: "#be185d" },
  { bg: "#fefce8", dot: "#ca8a04", text: "#a16207" },
  { bg: "#dcfafb", dot: "#5656e5", text: "#1d4ed8" },
  { bg: "#f0fdf4", dot: "#16a34a", text: "#15803d" },
  { bg: "#faf5ff", dot: "#9333ea", text: "#7e22ce" },
  { bg: "#fff7ed", dot: "#ea580c", text: "#c2410c" },
];

export function dimensionBadgeFor(key: string) {
  return DIMENSION_BADGE_COLORS[hashIndex(key, DIMENSION_BADGE_COLORS.length)];
}
