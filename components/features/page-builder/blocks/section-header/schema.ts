import { z } from "zod";

export const sectionHeaderSchema = z
  .object({
    titlu: z.string().trim().default(""),
    subtitlu: z.string().trim().default(""),
    // Text alignment for the whole header, same enum convention as `image-text`.
    aliniere: z.enum(["stanga", "centru", "dreapta"]).default("stanga"),
  });

export type SectionHeaderData = z.infer<typeof sectionHeaderSchema>;

export const SECTION_HEADER_DEFAULTS: SectionHeaderData = {
  titlu: "",
  subtitlu: "",
  aliniere: "stanga",
};
