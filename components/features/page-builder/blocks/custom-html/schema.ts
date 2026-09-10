import { z } from "zod";

/**
 * "Cod HTML" — one section of page source, pasted whole and stored whole.
 *
 * A single field on purpose: the markup, its stylesheet and its scripts are
 * injected differently (see `CustomHtml.tsx`), but they are split out of this
 * string at render time by `splitHtmlSource`, never edited apart. There is only
 * one copy of the code, so nothing can drift.
 *
 * The source is deliberately NOT sanitised: this block exists to carry the
 * site's hand-written sections across unchanged, scripts included, and a
 * sanitiser permissive enough for them would not be one. What makes that
 * acceptable is where the block can be placed — the page editor lives under
 * `/dashboard/fdsc`, behind `isFdscStaff`, so only FDSC staff can ever write
 * this field. Widening that guard would turn this block into stored XSS.
 */
export const customHtmlSchema = z
  .object({
    /** Internal name shown in the builder's block list. Never rendered. */
    eticheta: z.string().trim().default(""),
    sursa: z.string().default(""),
    latime: z.enum(["continut", "ecran"]).default("continut"),
  })
  .refine((d) => d.sursa.trim() !== "", {
    path: ["sursa"],
    message: "Adaugă codul HTML",
  });

export type CustomHtmlData = z.infer<typeof customHtmlSchema>;

/**
 * Plain literal, not `schema.parse({})` — the `.refine` makes that throw. An
 * empty `sursa` is intentionally invalid, so a blank draft cannot be added.
 */
export const CUSTOM_HTML_DEFAULTS: CustomHtmlData = {
  eticheta: "",
  sursa: "",
  latime: "continut",
};
