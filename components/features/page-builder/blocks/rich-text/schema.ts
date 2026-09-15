import { z } from "zod";
import { hasRichText } from "../../rich-text/has-rich-text";

export const richTextSchema = z
  .object({
    titlu: z.string().trim().default(""),
    /**
     * HTML produced by the shared TipTap editor. Sanitised server-side on the
     * way to the backend (`sanitizeBlocks`), not here: this schema also runs in
     * the editor, and DOMPurify must stay out of the client bundle.
     */
    continut: z.string().default(""),
    aliniere: z.enum(["stanga", "centru", "dreapta"]).default("stanga"),
  })
  .refine((d) => hasRichText(d.continut), {
    path: ["continut"],
    message: "Conținutul nu poate fi gol",
  });

export type RichTextData = z.infer<typeof richTextSchema>;

/**
 * Plain literal, not `schema.parse({})` — the `.refine` chain makes that throw.
 * `continut: ""` is intentionally invalid so a blank draft can't pass validation
 * when the admin clicks "Adaugă blocul".
 */
export const RICH_TEXT_DEFAULTS: RichTextData = {
  titlu: "",
  continut: "",
  aliniere: "stanga",
};
