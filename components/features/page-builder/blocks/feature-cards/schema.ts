import { z } from "zod";
import { iconSchema } from "@/components/ui/icons/schema";
import { ctaHasTarget } from "../shared/cta";
import { IMAGE_RATIOS } from "../shared/image-ratio";

/** A file uploaded via `uploadPageImageAction` — same shape as the `image` block. */
const iconImageSchema = z.object({
  id: z.number(),
  url: z.string(),
  name: z.string().default(""),
});

const cardSchema = z.object({
  /**
   * Lucide icon (see `components/ui/icons`). Always present; used as the
   * fallback when `iconImage` is not set.
   */
  icon: iconSchema("feature", "layers"),
  /**
   * Optional custom image uploaded for this card. When set it replaces the
   * preset `icon` in the same chip; clearing it returns the card to preset mode.
   */
  iconImage: iconImageSchema.nullable().default(null),
  titlu: z.string().trim().default(""),
  descriere: z.string().trim().default(""),
  href: z.string().trim().default(""),
  /** Page-backed link target; see `blocks/shared/cta.ts`. */
  pagina: z.string().trim().default(""),
  subPagina: z.boolean().default(false),
  ctaLabel: z.string().trim().default(""),
});

export type FeatureCardIconImage = z.infer<typeof iconImageSchema>;

export const featureCardsSchema = z
  .object({
    titluSectiune: z.string().trim().default(""),
    descriere: z.string().trim().default(""),
    coloane: z.enum(["1", "2", "3", "4"]).default("3"),
    background: z.enum(["default", "light", "accent"]).default("default"),
    /** Card image ratio; see `blocks/shared/image-ratio.ts`. */
    raport: z.enum(IMAGE_RATIOS).default("16:9"),
    carduri: z.array(cardSchema).default([]),
  })
  .refine((d) => d.carduri.every((c) => c.titlu), {
    path: ["carduri"],
    message: "Fiecare card are nevoie de un titlu",
  })
  .refine((d) => d.carduri.every((c) => ctaHasTarget(c) === Boolean(c.ctaLabel)), {
    path: ["carduri"],
    message: "La un card cu link completează și eticheta CTA (și invers)",
  });

export type FeatureCardsData = z.infer<typeof featureCardsSchema>;
export type FeatureCard = z.infer<typeof cardSchema>;

/**
 * Plain literal, not `schema.parse({})` — the `.refine` chain makes that throw.
 * The section title is optional; only each card needs its own title.
 */
export const FEATURE_CARDS_DEFAULTS: FeatureCardsData = {
  titluSectiune: "",
  descriere: "",
  coloane: "3",
  background: "default",
  raport: "16:9",
  carduri: [],
};

export const EMPTY_CARD: FeatureCard = {
  icon: "lucide:layers",
  iconImage: null,
  titlu: "",
  descriere: "",
  href: "",
  pagina: "",
  subPagina: false,
  ctaLabel: "",
};
