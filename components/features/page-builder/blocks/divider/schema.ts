import { z } from "zod";

export const dividerSchema = z.object({
  stil: z.enum(["solid", "dashed", "dotted"]).default("solid"),
  // "complet" spans the container; "ingust" caps the line at max-w-3xl.
  latime: z.enum(["complet", "ingust"]).default("complet"),
  spatiere: z.enum(["mic", "mediu", "mare"]).default("mediu"),
});

export type DividerData = z.infer<typeof dividerSchema>;

/** Always valid — a divider has no required content. */
export const DIVIDER_DEFAULTS: DividerData = {
  stil: "solid",
  latime: "complet",
  spatiere: "mediu",
};
