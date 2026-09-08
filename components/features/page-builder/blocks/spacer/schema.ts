import { z } from "zod";

export const spacerSchema = z.object({
  dimensiune: z.enum(["mic", "mediu", "mare", "foarte-mare"]).default("mediu"),
});

export type SpacerData = z.infer<typeof spacerSchema>;

/** Always valid — a spacer has no required content. */
export const SPACER_DEFAULTS: SpacerData = {
  dimensiune: "mediu",
};
