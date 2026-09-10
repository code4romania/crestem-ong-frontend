import { z } from "zod";

/**
 * The library's entry point, placed on any page: a card per main category,
 * each linking to `/biblioteca/<slug>` where the filtered article list takes
 * over. It replaces the old `article-grid`, which listed articles directly.
 *
 * The block stores no selection at all — it always shows every category with
 * something publicly visible in it, so a new category appears here the moment
 * it has a published article, and an emptied one disappears. Nothing to keep
 * in sync by hand.
 */
export const bibliotecaCategoriiSchema = z.object({
  /** Optional — the renderer omits the heading entirely when it is blank. */
  titlu: z.string().trim().default(""),
  coloane: z.enum(["1", "2", "3", "4"]).default("3"),
  /**
   * Filled in at read time, never authored and never saved: the public read
   * injects it in the controller, the builder canvas injects it from the
   * taxonomy it already holds. Defaulted so a block that has been through
   * neither still parses — the renderer then shows nothing. It has to be
   * permitted here at all because `BlockRenderer` parses every block through
   * this schema and skips the ones that fail.
   */
  categoriiRezolvate: z
    .array(
      z.object({
        documentId: z.string(),
        nume: z.string(),
        slug: z.string(),
        descriere: z.string().default(""),
        /**
         * A key from the twelve-icon palette. Kept as a plain string rather
         * than the enum so a category saved with a key this build does not
         * know still parses — the card falls back to `folder` instead of the
         * whole block vanishing.
         */
        icon: z.string().default("folder"),
        /** Articles this visitor may actually open, not the staff count. */
        numarArticole: z.number().default(0),
      }),
    )
    .default([]),
});

export type BibliotecaCategoriiData = z.infer<typeof bibliotecaCategoriiSchema>;

/** One resolved category, as both injection paths produce it. */
export type ResolvedCategory = BibliotecaCategoriiData["categoriiRezolvate"][number];

export const BIBLIOTECA_CATEGORII_DEFAULTS: BibliotecaCategoriiData = {
  titlu: "",
  coloane: "3",
  categoriiRezolvate: [],
};
