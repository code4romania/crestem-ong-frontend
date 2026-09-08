import { z } from "zod";

/**
 * A placed child block. Only the envelope is validated here — each child's own
 * `data` is checked by its block definition's `parse` when it is added, exactly
 * like a top-level block. (`data` is typed as optional because Zod infers
 * `unknown` object keys that way; children are always created with it present.)
 */
const childBlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.unknown(),
});

export const sectionSchema = z
  .object({
    /** CMS-only label. Never rendered on the public page. */
    numeIntern: z.string().trim().default(""),
    fundal: z.enum(["default", "light", "accent", "imagine"]).default("default"),
    imagine: z
      .object({ id: z.number(), url: z.string(), name: z.string().default("") })
      .nullable()
      .default(null),
    /** Readability overlay, only meaningful when `fundal === "imagine"`. */
    overlay: z.boolean().default(true),
    latimeContinut: z
      .enum(["compacta", "standard", "lata", "full"])
      .default("standard"),
    spatiereSus: z
      .enum(["mica", "standard", "mare", "foarte-mare"])
      .default("standard"),
    spatiereJos: z
      .enum(["mica", "standard", "mare", "foarte-mare"])
      .default("standard"),
    /** Optional anchor id for same-page links. Slugified in the editor. */
    idSectiune: z.string().trim().default(""),
    blocuri: z.array(childBlockSchema).default([]),
  })
  .refine((d) => d.fundal !== "imagine" || d.imagine !== null, {
    path: ["imagine"],
    message: "Adaugă o imagine de fundal",
  });

export type SectionData = z.infer<typeof sectionSchema>;
export type SectionChild = SectionData["blocuri"][number];

/**
 * Always valid — an empty section is a legitimate state (the canvas shows a
 * "nu conține încă blocuri" placeholder). Children are added on the canvas, not
 * in the config drawer.
 */
export const SECTION_DEFAULTS: SectionData = {
  numeIntern: "",
  fundal: "default",
  imagine: null,
  overlay: true,
  latimeContinut: "standard",
  spatiereSus: "standard",
  spatiereJos: "standard",
  idSectiune: "",
  blocuri: [],
};

/** Whitespace → hyphen. Everything else is left as typed. */
export function slugifyAnchor(raw: string): string {
  return raw.replace(/\s+/g, "-");
}
