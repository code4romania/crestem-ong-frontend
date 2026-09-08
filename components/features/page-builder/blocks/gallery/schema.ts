import { z } from "zod";

/**
 * One image in the gallery. `id` / `url` / `name` come from
 * `uploadPageImageAction`; `alt` and `caption` are the per-image metadata. Both
 * are optional: a gallery of event photos is
 * largely decorative, where `alt=""` is the correct a11y choice, and forcing an
 * alt on every image in a 100-photo dump only yields filler. The editor nudges
 * for images that have neither.
 */
const galleryImageSchema = z.object({
  id: z.number(),
  url: z.string(),
  name: z.string().default(""),
  alt: z.string().trim().default(""),
  caption: z.string().trim().default(""),
});

export type GalleryImage = z.infer<typeof galleryImageSchema>;

export const gallerySchema = z
  .object({
    titlu: z.string().trim().default(""),
    descriere: z.string().trim().default(""),
    imagini: z.array(galleryImageSchema).default([]),
    // Screenshot order: Grid / Masonry / Carusel.
    stil: z.enum(["grid", "masonry", "carusel"]).default("grid"),
    // Text spec says 1-4 (the screenshot only shows 2-4); following the spec.
    // Column count for grid/masonry; slides-per-view for the carousel.
    coloane: z.enum(["1", "2", "3", "4"]).default("3"),
    lightbox: z.boolean().default(true),
  })
  .refine((d) => d.imagini.length > 0, {
    path: ["imagini"],
    message: "Adaugă cel puțin o imagine",
  });

export type GalleryData = z.infer<typeof gallerySchema>;

/**
 * Plain literal, not `schema.parse({})` — the `.refine` chain makes that throw.
 * `imagini: []` is intentionally invalid so a blank draft can't pass validation
 * when the admin clicks "Adaugă blocul".
 */
export const GALLERY_DEFAULTS: GalleryData = {
  titlu: "",
  descriere: "",
  imagini: [],
  stil: "grid",
  coloane: "3",
  lightbox: true,
};
