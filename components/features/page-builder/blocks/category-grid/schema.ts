import { z } from "zod";

/**
 * Fixed icon palette for a category card. Stored as a string key (not a
 * component reference) so the schema stays serialisable and the renderer stays
 * pure; `icons.ts` maps the key back to a `lucide-react` icon at render time.
 */
export const CATEGORY_ICON_KEYS = [
  "folder",
  "settings",
  "scale",
  "message",
  "trending",
  "users",
  "award",
  "book",
  "globe",
  "heart",
  "briefcase",
  "calendar",
] as const;

export type CategoryIconKey = (typeof CATEGORY_ICON_KEYS)[number];

const categorySchema = z.object({
  icon: z.enum(CATEGORY_ICON_KEYS).default("folder"),
  titlu: z.string().trim().default(""),
  descriere: z.string().trim().default(""),
  /** Resource count rendered as a pill; `null` hides it. */
  numarResurse: z.number().int().min(0).nullable().default(null),
  href: z.string().trim().default(""),
  /** Page-backed link target; see `blocks/shared/cta.ts`. */
  pagina: z.string().trim().default(""),
  subPagina: z.boolean().default(false),
});

export const categoryGridSchema = z
  .object({
    titlu: z.string().trim().default(""),
    coloane: z.enum(["1", "2", "3", "4"]).default("3"),
    categorii: z.array(categorySchema).default([]),
  })
  .refine((d) => d.categorii.every((c) => c.titlu), {
    path: ["categorii"],
    message: "Fiecare categorie are nevoie de un titlu",
  });

export type CategoryGridData = z.infer<typeof categoryGridSchema>;
export type Category = z.infer<typeof categorySchema>;

/**
 * Every field has a schema default, so a fresh block is already valid. The
 * section title is optional — the renderer just omits the heading when it's
 * blank.
 */
export const CATEGORY_GRID_DEFAULTS: CategoryGridData = {
  titlu: "",
  coloane: "3",
  categorii: [],
};

export const EMPTY_CATEGORY: Category = {
  icon: "folder",
  titlu: "",
  descriere: "",
  numarResurse: null,
  href: "",
  pagina: "",
  subPagina: false,
};
