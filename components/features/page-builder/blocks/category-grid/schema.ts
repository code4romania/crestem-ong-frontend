import { z } from "zod";
import { iconSchema } from "@/components/ui/icons/schema";

const categorySchema = z.object({
  icon: iconSchema("category", "folder"),
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
  icon: "lucide:folder",
  titlu: "",
  descriere: "",
  numarResurse: null,
  href: "",
  pagina: "",
  subPagina: false,
};
