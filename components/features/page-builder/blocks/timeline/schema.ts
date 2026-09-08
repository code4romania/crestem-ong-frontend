import { z } from "zod";

const stageSchema = z.object({
  numar: z.string().trim().default(""),
  titlu: z.string().trim().default(""),
  text: z.string().trim().default(""),
});

export const timelineSchema = z
  .object({
    titlu: z.string().trim().default(""),
    orientatie: z.enum(["vertical", "orizontal"]).default("orizontal"),
    etape: z.array(stageSchema).default([]),
  })
  .refine((d) => d.etape.length > 0, {
    path: ["etape"],
    message: "Adaugă cel puțin o etapă",
  })
  .refine((d) => d.etape.every((e) => e.titlu), {
    path: ["etape"],
    message: "Fiecare etapă are nevoie de un titlu",
  });

export type TimelineData = z.infer<typeof timelineSchema>;
export type TimelineStage = z.infer<typeof stageSchema>;

/**
 * Plain literal, not `schema.parse({})` — the `.refine` chain makes that throw.
 * `etape: []` is intentionally invalid so a blank draft can't pass validation
 * when the admin clicks "Adaugă blocul".
 */
export const TIMELINE_DEFAULTS: TimelineData = {
  titlu: "",
  orientatie: "orizontal",
  etape: [],
};

export const EMPTY_STAGE: TimelineStage = { numar: "", titlu: "", text: "" };
