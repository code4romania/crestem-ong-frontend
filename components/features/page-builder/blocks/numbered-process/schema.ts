import { z } from "zod";

const stepSchema = z.object({
  titlu: z.string().trim().default(""),
  text: z.string().trim().default(""),
});

export const numberedProcessSchema = z
  .object({
    titlu: z.string().trim().default(""),
    pasi: z.array(stepSchema).default([]),
  });

export type NumberedProcessData = z.infer<typeof numberedProcessSchema>;
export type ProcessStep = z.infer<typeof stepSchema>;

export const NUMBERED_PROCESS_DEFAULTS: NumberedProcessData = {
  titlu: "",
  pasi: [],
};

export const EMPTY_STEP: ProcessStep = { titlu: "", text: "" };
