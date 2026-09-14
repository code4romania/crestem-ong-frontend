/**
 * Romanian plural for a page count ("pagină" / "pagini"), including the
 * `de`-linker Romanian requires from 20 upward.
 *
 * - `n === 1` → "o pagină"
 * - `2 ≤ n ≤ 19` → "${n} pagini"
 * - `n ≥ 20` → "${n} de pagini"
 */
export function pluralPagini(n: number): string {
  if (n === 1) return "o pagină";
  if (n >= 20) return `${n} de pagini`;
  return `${n} pagini`;
}
