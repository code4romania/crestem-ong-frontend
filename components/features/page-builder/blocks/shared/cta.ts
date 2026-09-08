import { z } from "zod";

/**
 * The shape every button in every block shares. A CTA points either at a page
 * of this site (`pagina`, a documentId) or at a typed address (`href`) for
 * external links and app routes like `/autentificare`.
 *
 * `pagina` wins: the backend rewrites `href` to that page's real path on the
 * public read, so a link follows its target when the page is renamed or moved
 * under a different parent. `href` is what every renderer still reads, which is
 * why the field stays on the stored shape.
 */
export const ctaSchema = z.object({
  label: z.string().trim().default(""),
  href: z.string().trim().default(""),
  pagina: z.string().trim().default(""),
  /** Ask the page holding this link to adopt the target; see the CTA field. */
  subPagina: z.boolean().default(false),
});

export type CtaValue = z.infer<typeof ctaSchema>;

export const CTA_DEFAULTS: CtaValue = { label: "", href: "", pagina: "", subPagina: false };

/** Whether a CTA has somewhere to go, by either route. */
export function ctaHasTarget(cta: { href?: string; pagina?: string }): boolean {
  return Boolean(cta.pagina || cta.href);
}
