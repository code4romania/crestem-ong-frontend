import { z } from "zod";

/**
 * Article categories, as configured in the (future) "Bibliotecă". Doubles as the
 * card's coloured type badge — one concept, not two. `catalog.ts` seeds a mock
 * article list against these until a backend content type exists.
 */
export const ARTICLE_CATEGORIES = [
  "ghid",
  "articol",
  "studiu-de-caz",
  "interviu",
  "video",
] as const;
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export const articleGridSchema = z
  .object({
    titlu: z.string().trim().min(1, "Titlul este obligatoriu"),
    coloane: z.enum(["1", "2", "3", "4"]).default("3"),
    sursa: z.enum(["manuala", "recente"]).default("recente"),
    /** Catalog slugs, in the order the editor picked them. Used when `sursa === "manuala"`. */
    articoleSelectate: z.array(z.string()).default([]),
    /** How many to pull when `sursa === "recente"`. */
    numarArticole: z.enum(["3", "6", "9", "12"]).default("6"),
    /** `null` === "Toate categoriile". Only applies when `sursa === "recente"`. */
    categorie: z.enum(ARTICLE_CATEGORIES).nullable().default(null),
  })
  .refine(
    (d) => d.sursa !== "manuala" || d.articoleSelectate.length > 0,
    { path: ["articoleSelectate"], message: "Selectează cel puțin un articol" },
  );

export type ArticleGridData = z.infer<typeof articleGridSchema>;

export const ARTICLE_GRID_DEFAULTS: ArticleGridData = {
  titlu: "",
  coloane: "3",
  sursa: "recente",
  articoleSelectate: [],
  numarArticole: "6",
  categorie: null,
};
