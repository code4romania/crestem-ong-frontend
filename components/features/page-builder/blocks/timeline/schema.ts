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
  });

export type TimelineData = z.infer<typeof timelineSchema>;
export type TimelineStage = z.infer<typeof stageSchema>;

export const TIMELINE_DEFAULTS: TimelineData = {
  titlu: "",
  orientatie: "orizontal",
  etape: [],
};

export const EMPTY_STAGE: TimelineStage = { numar: "", titlu: "", text: "" };
