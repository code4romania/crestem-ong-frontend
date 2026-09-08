import { z } from "zod";
import { ctaHasTarget } from "../shared/cta";

/**
 * Fixed icon palette for a feature card. Stored as a string key (not a component
 * reference) so the schema stays serialisable and the renderer stays pure — it
 * maps the key back to a `lucide-react` icon at render time.
 */
export const FEATURE_ICON_KEYS = [
  "book",
  "users",
  "award",
  "globe",
  "graduation",
  "library",
  "layers",
  "file",
  "zap",
  "calendar",
  "chart",
  "check",
] as const;

export type FeatureIconKey = (typeof FEATURE_ICON_KEYS)[number];

/** A file uploaded via `uploadPageImageAction` — same shape as the `image` block. */
const iconImageSchema = z.object({
  id: z.number(),
  url: z.string(),
  name: z.string().default(""),
});

const cardSchema = z.object({
  /**
   * Preset key from the site's icon collection. Always present; used as the
   * fallback when `iconImage` is not set.
   */
  icon: z.enum(FEATURE_ICON_KEYS).default("layers"),
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
  carduri: [],
};

export const EMPTY_CARD: FeatureCard = {
  icon: "layers",
  iconImage: null,
  titlu: "",
  descriere: "",
  href: "",
  pagina: "",
  subPagina: false,
  ctaLabel: "",
};
