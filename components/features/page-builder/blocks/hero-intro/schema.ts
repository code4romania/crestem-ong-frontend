import { z } from "zod";
import { CTA_DEFAULTS, ctaHasTarget, ctaSchema } from "../shared/cta";

export const heroIntroSchema = z
  .object({
    supratitlu: z.string().trim().default(""),
    titlu: z.string().trim().min(1, "Titlul este obligatoriu"),
    textIntroductiv: z.string().trim().default(""),
    horizontalAlign: z.enum(["stanga", "centru", "dreapta"]).default("centru"),
    background: z.enum(["default", "light", "accent"]).default("default"),
    primaryCta: ctaSchema.default(CTA_DEFAULTS),
    secondaryCta: ctaSchema.default(CTA_DEFAULTS),
  })
  .refine((d) => Boolean(d.primaryCta.label) === ctaHasTarget(d.primaryCta), {
    path: ["primaryCta"],
    message: "Completează și textul, și link-ul",
  })
  .refine((d) => Boolean(d.secondaryCta.label) === ctaHasTarget(d.secondaryCta), {
    path: ["secondaryCta"],
    message: "Completează și textul, și link-ul",
  });

export type HeroIntroData = z.infer<typeof heroIntroSchema>;

/**
 * Plain literal, not `schema.parse({})` — the `.refine` chain makes that throw.
 * `titlu: ""` is intentionally invalid so a blank draft can't pass validation
 * when the admin clicks "Adaugă blocul".
 */
export const HERO_INTRO_DEFAULTS: HeroIntroData = {
  supratitlu: "",
  titlu: "",
  textIntroductiv: "",
  horizontalAlign: "centru",
  background: "default",
  primaryCta: { ...CTA_DEFAULTS },
  secondaryCta: { ...CTA_DEFAULTS },
};
