import { z } from "zod";

/**
 * `true` when `raw` parses as an absolute `https:` URL. HTTP is rejected: a
 * public page served over HTTPS blocks an `http:` iframe as mixed active
 * content, so such a block would save but never render.
 */
export function isEmbedUrl(raw: string): boolean {
  const value = raw.trim();
  if (!value) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export const embedSchema = z
  .object({
    titlu: z.string().trim().default(""),
    url: z.string().trim().default(""),
    /**
     * Not in the written spec (Titlu + Link), but an <iframe> has no intrinsic
     * height — a ratio is the minimum needed to render it. A map, a form and a
     * calendar each want a different one.
     */
    raport: z.enum(["16:9", "4:3", "1:1"]).default("16:9"),
  })
  .superRefine((d, ctx) => {
    if (!isEmbedUrl(d.url)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["url"],
        message: "Adaugă un link valid (începe cu https://)",
      });
    }
  });

export type EmbedData = z.infer<typeof embedSchema>;

/**
 * Plain literal, not `schema.parse({})` — the `.superRefine` makes that throw.
 * `url: ""` is intentionally invalid so a blank draft can't pass validation
 * when the admin clicks "Adaugă blocul".
 */
export const EMBED_DEFAULTS: EmbedData = {
  titlu: "",
  url: "",
  raport: "16:9",
};
