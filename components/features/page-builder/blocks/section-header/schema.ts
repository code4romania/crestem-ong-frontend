import { z } from "zod";

export const sectionHeaderSchema = z
  .object({
    titlu: z.string().trim().default(""),
    subtitlu: z.string().trim().default(""),
    // Text alignment for the whole header, same enum convention as `image-text`.
    aliniere: z.enum(["stanga", "centru", "dreapta"]).default("stanga"),
  })
  .refine((d) => d.titlu.length > 0, {
    path: ["titlu"],
    message: "Adaugă un titlu",
  });

export type SectionHeaderData = z.infer<typeof sectionHeaderSchema>;

/**
 * Plain literal, not `schema.parse({})` — the `.refine` makes that throw.
 * `titlu: ""` is intentionally invalid so a blank draft can't pass validation
 * when the admin clicks "Adaugă blocul".
 */
export const SECTION_HEADER_DEFAULTS: SectionHeaderData = {
  titlu: "",
  subtitlu: "",
  aliniere: "stanga",
};
