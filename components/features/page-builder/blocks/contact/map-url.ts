/**
 * Harta, fără nicio dependință și fără cheie de API: două URL-uri construite
 * din adresa scrisă de editor.
 *
 * `output=embed` nu e documentat oficial de Google — funcționează de ani, dar
 * dacă dispare, migrarea e la Maps Embed API: același iframe, plus o cheie.
 * Link-ul de mai jos e, în schimb, cel documentat.
 */
export function mapEmbedUrl(address: string): string {
  const trimmed = address.trim();
  if (!trimmed) return "";
  return `https://www.google.com/maps?q=${encodeURIComponent(trimmed)}&output=embed`;
}

export function mapLinkUrl(address: string): string {
  const trimmed = address.trim();
  if (!trimmed) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
}
