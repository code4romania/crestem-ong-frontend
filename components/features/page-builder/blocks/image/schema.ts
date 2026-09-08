import { z } from "zod";

const uploadedImageSchema = z.object({
  id: z.number(),
  url: z.string(),
  name: z.string().default(""),
});

export const imageSchema = z
  .object({
    // Uploaded via `uploadPageImageAction`, or selected from the Media Library
    // once that admin page exists — the editor shows a "în curând" stub for it,
    // same as `hero-large-split`.
    image: uploadedImageSchema.nullable().default(null),
    altText: z.string().trim().default(""),
    latime: z.enum(["compacta", "standard", "lata", "full"]).default("standard"),
    aliniere: z.enum(["stanga", "centru", "dreapta"]).default("centru"),
    raport: z.enum(["original", "16:9", "4:3", "1:1"]).default("original"),
    // "default" keeps the rounded corners the renderer applies; "drepte" is the
    // "Fără rotunjire" option.
    colturi: z.enum(["default", "drepte"]).default("default"),
    areLink: z.boolean().default(false),
    link: z.string().trim().default(""),
    linkTabNou: z.boolean().default(false),
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
    if (d.areLink && !d.link) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["link"],
        message: "Adaugă un link",
      });
    }
  });

export type ImageData = z.infer<typeof imageSchema>;

/**
 * Plain literal, not `schema.parse({})` — the `.superRefine` makes that throw.
 * `image: null` is intentionally invalid so a blank draft can't pass validation
 * when the admin clicks "Adaugă blocul".
 */
export const IMAGE_DEFAULTS: ImageData = {
  image: null,
  altText: "",
  latime: "standard",
  aliniere: "centru",
  raport: "original",
  colturi: "default",
  areLink: false,
  link: "",
  linkTabNou: false,
};
