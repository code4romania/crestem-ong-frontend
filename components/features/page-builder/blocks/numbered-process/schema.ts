import { z } from "zod";

const stepSchema = z.object({
  titlu: z.string().trim().default(""),
  text: z.string().trim().default(""),
});

export const numberedProcessSchema = z
  .object({
    titlu: z.string().trim().default(""),
    pasi: z.array(stepSchema).default([]),
  })
  .refine((d) => d.pasi.length > 0, {
    path: ["pasi"],
    message: "Adaugă cel puțin un pas",
  })
  .refine((d) => d.pasi.every((p) => p.titlu), {
    path: ["pasi"],
    message: "Fiecare pas are nevoie de un titlu",
  });

export type NumberedProcessData = z.infer<typeof numberedProcessSchema>;
export type ProcessStep = z.infer<typeof stepSchema>;

/**
 * Plain literal, not `schema.parse({})` — the `.refine` chain makes that throw.
 * `pasi: []` is intentionally invalid so a blank draft can't pass validation
 * when the admin clicks "Adaugă blocul".
 */
export const NUMBERED_PROCESS_DEFAULTS: NumberedProcessData = {
  titlu: "",
  pasi: [],
};

export const EMPTY_STEP: ProcessStep = { titlu: "", text: "" };
