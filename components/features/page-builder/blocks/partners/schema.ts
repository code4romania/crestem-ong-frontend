import { z } from "zod";
import { iconSchema } from "@/components/ui/icons/schema";

/** A file uploaded via `uploadPageImageAction` — same shape as the `image` block. */
const iconImageSchema = z.object({
  id: z.number(),
  url: z.string(),
  name: z.string().default(""),
});

const partnerSchema = z.object({
  /**
   * Lucide icon (see `components/ui/icons`). Always present; used as the
   * fallback when `iconImage` is not set.
   */
  icon: iconSchema("feature", "layers"),
  /**
   * Optional custom logo uploaded for this partner. When set it replaces the
   * preset `icon` in the same chip; clearing it returns the card to preset mode.
   */
  iconImage: iconImageSchema.nullable().default(null),
  nume: z.string().trim().default(""),
  subtitlu: z.string().trim().default(""),
});

export type PartnerIconImage = z.infer<typeof iconImageSchema>;

export const partnersSchema = z
  .object({
    titluSectiune: z.string().trim().default(""),
    subtitluSectiune: z.string().trim().default(""),
    coloane: z.enum(["1", "2", "3", "4", "5", "6"]).default("6"),
    parteneri: z.array(partnerSchema).default([]),
  })
  .refine((d) => d.parteneri.every((p) => p.nume), {
    path: ["parteneri"],
    message: "Fiecare partener are nevoie de un nume",
  });

export type PartnersData = z.infer<typeof partnersSchema>;
export type Partner = z.infer<typeof partnerSchema>;

/**
 * Every field has a schema default, so a fresh block is already valid. Both
 * section title and subtitle are optional — the renderer omits the header when
 * they are blank.
 */
export const PARTNERS_DEFAULTS: PartnersData = {
  titluSectiune: "",
  subtitluSectiune: "",
  coloane: "6",
  parteneri: [],
};

export const EMPTY_PARTNER: Partner = {
  icon: "lucide:layers",
  iconImage: null,
  nume: "",
  subtitlu: "",
};
