import { z } from "zod";
import { CTA_DEFAULTS, ctaHasTarget, ctaSchema } from "../shared/cta";
import { sanitizeRichText, hasRichText } from "../../rich-text/sanitize";

const uploadedImageSchema = z.object({
  id: z.number(),
  url: z.string(),
  name: z.string().default(""),
});

export const imageTextSchema = z
  .object({
    // Uploaded via `uploadPageImageAction`, or selected from the Media Library
    // once that admin page exists — the editor shows a "în curând" stub for it,
    // same as `image` / `image-caption` / `hero-large-split`.
    image: uploadedImageSchema.nullable().default(null),
    altText: z.string().trim().default(""),
    supratitlu: z.string().trim().default(""),
    titlu: z.string().trim().default(""),
    /**
     * HTML produced by the shared TipTap editor. Sanitised on the way in so
     * stored data is always within the editor's allowlist, regardless of source.
     */
    text: z
      .string()
      .default("")
      .transform((html) => sanitizeRichText(html)),
    // Image placement: "stanga"/"dreapta" put the image beside the text in a
    // two-column grid; "centru" stacks it centered above the text.
    aliniere: z.enum(["stanga", "centru", "dreapta"]).default("stanga"),
    // Column ratio (image / text) for the "stanga"/"dreapta" layouts.
    proportie: z.enum(["50-50", "40-60", "60-40"]).default("50-50"),
    // "default" keeps the rounded corners the renderer applies; "drepte" is the
    // "Fără rotunjire" option.
    colturi: z.enum(["default", "drepte"]).default("default"),
    primaryCta: ctaSchema.default(CTA_DEFAULTS),
    secondaryCta: ctaSchema.default(CTA_DEFAULTS),
  })
  .superRefine((d, ctx) => {
    if (!d.image) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["image"],
        message: "Adaugă o imagine",
      });
    } else if (!d.altText) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["altText"],
        message: "Adaugă un text alternativ pentru imagine",
      });
    }
    if (!hasRichText(d.text)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["text"],
        message: "Textul nu poate fi gol",
      });
    }
    if (Boolean(d.primaryCta.label) !== ctaHasTarget(d.primaryCta)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["primaryCta"],
        message: "Completează și textul, și link-ul",
      });
    }
    if (Boolean(d.secondaryCta.label) !== ctaHasTarget(d.secondaryCta)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["secondaryCta"],
        message: "Completează și textul, și link-ul",
      });
    }
  });

export type ImageTextData = z.infer<typeof imageTextSchema>;

/**
 * Plain literal, not `schema.parse({})` — the `.superRefine` makes that throw.
 * `image: null` / `text: ""` are intentionally invalid so a blank draft can't
 * pass validation when the admin clicks "Adaugă blocul".
 */
export const IMAGE_TEXT_DEFAULTS: ImageTextData = {
  image: null,
  altText: "",
  supratitlu: "",
  titlu: "",
  text: "",
  aliniere: "stanga",
  proportie: "50-50",
  colturi: "default",
  primaryCta: { ...CTA_DEFAULTS },
  secondaryCta: { ...CTA_DEFAULTS },
};
