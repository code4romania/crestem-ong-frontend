import { z } from "zod";

const uploadedImageSchema = z.object({
  id: z.number(),
  url: z.string(),
  name: z.string().default(""),
});

export const imageCaptionSchema = z
  .object({
    // Uploaded via `uploadPageImageAction`, or selected from the Media Library
    // once that admin page exists — the editor shows a "în curând" stub for it,
    // same as `image` / `hero-large-split`.
    image: uploadedImageSchema.nullable().default(null),
    altText: z.string().trim().default(""),
    // All three are optional — shown in the figcaption when present.
    legenda: z.string().trim().default(""),
    creditFoto: z.string().trim().default(""),
    sursa: z.string().trim().default(""),
    latime: z.enum(["compacta", "standard", "lata", "full"]).default("standard"),
    aliniere: z.enum(["stanga", "centru", "dreapta"]).default("centru"),
    raport: z.enum(["original", "16:9", "4:3", "1:1"]).default("original"),
    // "default" keeps the rounded corners the renderer applies; "drepte" is the
    // "Fără rotunjire" option.
    colturi: z.enum(["default", "drepte"]).default("default"),
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
  });

export type ImageCaptionData = z.infer<typeof imageCaptionSchema>;

/**
 * Plain literal, not `schema.parse({})` — the `.superRefine` makes that throw.
 * `image: null` is intentionally invalid so a blank draft can't pass validation
 * when the admin clicks "Adaugă blocul".
 */
export const IMAGE_CAPTION_DEFAULTS: ImageCaptionData = {
  image: null,
  altText: "",
  legenda: "",
  creditFoto: "",
  sursa: "",
  latime: "standard",
  aliniere: "centru",
  raport: "original",
  colturi: "default",
};
