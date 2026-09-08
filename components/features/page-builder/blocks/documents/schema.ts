import { z } from "zod";

/**
 * One file in the Documents block. `id`, `ext` and `size` come from
 * `uploadPageDocumentAction`; `size` is in KB (Strapi's unit) and may be
 * absent, `ext` is like `".pdf"`.
 */
const documentFileSchema = z.object({
  id: z.number(),
  url: z.string().trim().default(""),
  name: z.string().trim().default(""),
  ext: z.string().trim().default(""),
  size: z.number().nullable().default(null),
});

export type DocumentFile = z.infer<typeof documentFileSchema>;

export const documentsSchema = z
  .object({
    titlu: z.string().trim().default(""),
    subtitlu: z.string().trim().default(""),
    documente: z.array(documentFileSchema).default([]),
  })
  .refine((d) => d.titlu.length > 0, {
    path: ["titlu"],
    message: "Titlul este obligatoriu",
  })
  .refine((d) => d.documente.length > 0 && d.documente.every((f) => f.url), {
    path: ["documente"],
    message: "Adaugă cel puțin un document",
  });

export type DocumentsData = z.infer<typeof documentsSchema>;

/**
 * Plain literal, not `schema.parse({})` — the `.refine` chain makes that throw.
 * Empty `titlu` and `documente: []` are intentionally invalid so a blank draft
 * can't pass validation when the admin clicks "Adaugă blocul".
 */
export const DOCUMENTS_DEFAULTS: DocumentsData = {
  titlu: "",
  subtitlu: "",
  documente: [],
};
