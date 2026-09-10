/**
 * The library's one date format, so nothing that shows a publish date drifts
 * from anything else. `dataPublicarii` is a Strapi `datetime`, so it arrives as
 * a full ISO string, not `YYYY-MM-DD`.
 *
 * Returns `""` for a null or unparseable date — the caller then renders nothing
 * rather than a dash or an empty slot. A caller that wants a placeholder
 * supplies its own.
 */
export function formatArticleDate(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
