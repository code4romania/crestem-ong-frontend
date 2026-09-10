import { z } from "zod";

/**
 * The masthead of an article page: a back link to the library, a badge, a
 * category and date line, the title, and a tag list.
 *
 * Every field is typed by the editor. Nothing is read from the `article`
 * collection — this block is authored content, not a view of a record — so it
 * needs no resolution pass and the renderer is a plain synchronous component
 * with nothing injected into it.
 */
export const articleHeaderSchema = z.object({
  /** The pill above the title. Rendered only when filled. */
  eticheta: z.string().trim().default(""),
  categorie: z.string().trim().default(""),
  /** Free text, so it can read "10 Ian 2024" without a date picker's format. */
  data: z.string().trim().default(""),
  titlu: z.string().trim().min(1, "Titlul este obligatoriu"),
  etichete: z.array(z.string().trim().min(1)).default([]),
  background: z.enum(["default", "light", "accent"]).default("accent"),
});

export type ArticleHeaderData = z.infer<typeof articleHeaderSchema>;

/**
 * Plain literal rather than `schema.parse({})`, matching the other blocks.
 * `titlu: ""` is intentionally invalid so a blank header cannot pass validation
 * when the admin clicks "Adaugă blocul".
 */
export const ARTICLE_HEADER_DEFAULTS: ArticleHeaderData = {
  eticheta: "",
  categorie: "",
  data: "",
  titlu: "",
  etichete: [],
  background: "accent",
};
