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

const cardSchema = z.object({
  icon: z.enum(FEATURE_ICON_KEYS).default("layers"),
  titlu: z.string().trim().default(""),
  descriere: z.string().trim().default(""),
  href: z.string().trim().default(""),
  /** Page-backed link target; see `blocks/shared/cta.ts`. */
  pagina: z.string().trim().default(""),
  subPagina: z.boolean().default(false),
  ctaLabel: z.string().trim().default(""),
});

export const featureCardsSchema = z
  .object({
    titluSectiune: z.string().trim().min(1, "Titlul secțiunii este obligatoriu"),
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
 * `titluSectiune: ""` is intentionally invalid so a blank draft can't pass
 * validation when the admin clicks "Adaugă blocul".
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
  titlu: "",
  descriere: "",
  href: "",
  pagina: "",
  subPagina: false,
  ctaLabel: "",
};
