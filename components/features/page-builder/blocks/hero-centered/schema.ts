import { z } from "zod";
import { CTA_DEFAULTS, ctaHasTarget, ctaSchema } from "../shared/cta";

export const heroCenteredSchema = z
  .object({
    supratitlu: z.string().trim().default(""),
    titlu: z.string().trim().min(1, "Titlul este obligatoriu"),
    subtitlu: z.string().trim().default(""),
    horizontalAlign: z.enum(["stanga", "centru", "dreapta"]).default("centru"),
    background: z.enum(["default", "light", "accent", "imagine"]).default("default"),
    image: z
      .object({ id: z.number(), url: z.string(), name: z.string().default("") })
      .nullable()
      .default(null),
    overlay: z.boolean().default(true),
    primaryCta: ctaSchema.default(CTA_DEFAULTS),
    secondaryCta: ctaSchema.default(CTA_DEFAULTS),
  })
  .refine((d) => d.background !== "imagine" || d.image !== null, {
    path: ["image"],
    message: "Adaugă o imagine de fundal",
  })
  .refine((d) => Boolean(d.primaryCta.label) === ctaHasTarget(d.primaryCta), {
    path: ["primaryCta"],
    message: "Completează și textul, și link-ul",
  })
  .refine((d) => Boolean(d.secondaryCta.label) === ctaHasTarget(d.secondaryCta), {
    path: ["secondaryCta"],
    message: "Completează și textul, și link-ul",
  });

export type HeroCenteredData = z.infer<typeof heroCenteredSchema>;

/**
 * Plain literal, not `schema.parse({})` — the `.refine` chain makes that throw.
 * `titlu: ""` is intentionally invalid so a blank draft can't pass validation
 * when the admin clicks "Adaugă blocul".
 */
export const HERO_CENTERED_DEFAULTS: HeroCenteredData = {
  supratitlu: "",
  titlu: "",
  subtitlu: "",
  horizontalAlign: "centru",
  background: "default",
  image: null,
  overlay: true,
  primaryCta: { ...CTA_DEFAULTS },
  secondaryCta: { ...CTA_DEFAULTS },
};
