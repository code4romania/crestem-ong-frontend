import { z } from "zod";
import { CTA_DEFAULTS, ctaHasTarget, ctaSchema } from "../shared/cta";

const statSchema = z.object({
  valoare: z.string().trim().default(""),
  eticheta: z.string().trim().default(""),
  descriere: z.string().trim().default(""),
});

export const statisticsSchema = z
  .object({
    titlu: z.string().trim().default(""),
    subtitlu: z.string().trim().default(""),
    descriere: z.string().trim().default(""),
    statistici: z.array(statSchema).default([]),
    // Text spec says 1-4; the screenshot shows a 2-wide grid.
    coloane: z.enum(["1", "2", "3", "4"]).default("2"),
    /** How each counter cell aligns its value, label and description. */
    aliniere: z.enum(["stanga", "centru", "dreapta"]).default("stanga"),
    separator: z.boolean().default(false),
    primaryCta: ctaSchema.default(CTA_DEFAULTS),
    secondaryCta: ctaSchema.default(CTA_DEFAULTS),
  })
  .refine((d) => d.statistici.length > 0, {
    path: ["statistici"],
    message: "Adaugă cel puțin o statistică",
  })
  .refine((d) => d.statistici.every((s) => s.valoare && s.eticheta), {
    path: ["statistici"],
    message: "Fiecare statistică are nevoie de valoare și etichetă",
  })
  .refine((d) => Boolean(d.primaryCta.label) === ctaHasTarget(d.primaryCta), {
    path: ["primaryCta"],
    message: "Completează și textul, și link-ul",
  })
  .refine((d) => Boolean(d.secondaryCta.label) === ctaHasTarget(d.secondaryCta), {
    path: ["secondaryCta"],
    message: "Completează și textul, și link-ul",
  });

export type StatisticsData = z.infer<typeof statisticsSchema>;
export type Stat = z.infer<typeof statSchema>;

/**
 * Plain literal, not `schema.parse({})` — the `.refine` chain makes that throw.
 * `statistici: []` is intentionally invalid so a blank draft can't pass
 * validation when the admin clicks "Adaugă blocul".
 */
export const STATISTICS_DEFAULTS: StatisticsData = {
  titlu: "",
  subtitlu: "",
  descriere: "",
  statistici: [],
  coloane: "2",
  aliniere: "stanga",
  separator: false,
  primaryCta: { ...CTA_DEFAULTS },
  secondaryCta: { ...CTA_DEFAULTS },
};

export const EMPTY_STAT: Stat = { valoare: "", eticheta: "", descriere: "" };
