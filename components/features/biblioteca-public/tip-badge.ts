/**
 * `tip` is free text, so no fixed palette can be keyed to it. Hashing the word
 * into a small fixed set gives every type a stable colour — "Template" is always
 * the same violet — without anyone maintaining a vocabulary.
 */
const PALETTE = [
  { bg: "#f5f3ff", fg: "#7c3aed" },
  { bg: "#eff6ff", fg: "#2563eb" },
  { bg: "#fef2f2", fg: "#dc2626" },
  { bg: "#ecfdf5", fg: "#059669" },
  { bg: "#fffbeb", fg: "#d97706" },
  { bg: "#ecfeff", fg: "#0891b2" },
];

export function tipBadgeColors(tip: string): { bg: string; fg: string } {
  let hash = 0;
  for (const char of tip.trim().toLowerCase()) {
    hash = (hash * 31 + char.charCodeAt(0)) % 100000;
  }
  return PALETTE[hash % PALETTE.length];
}
