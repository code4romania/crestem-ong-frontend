import { z } from "zod";

/**
 * Fixed icon palette for a partner card. Stored as a string key (not a
 * component reference) so the schema stays serialisable and the renderer stays
 * pure — it maps the key back to a `lucide-react` icon at render time. Same
 * approach as `feature-cards/icons.ts`.
 */
export const PARTNER_ICON_KEYS = [
  "building",
  "landmark",
  "handshake",
  "globe",
  "users",
  "award",
  "briefcase",
  "flag",
  "shield",
  "star",
  "sparkles",
  "target",
  "book",
  "graduation",
  "leaf",
  "heart",
  "banknote",
  "gift",
  "network",
  "trophy",
  "lightbulb",
  "compass",
] as const;

export type PartnerIconKey = (typeof PARTNER_ICON_KEYS)[number];

/** Uploaded media, same shape the Hero and People Grid blocks store. */
const imageSchema = z
  .object({ id: z.number(), url: z.string(), name: z.string().default("") })
  .nullable()
  .default(null);

const partnerSchema = z.object({
  nume: z.string().trim().default(""),
  subtitlu: z.string().trim().default(""),
  /**
   * Which of the two visuals the card shows. Both `icon` and `imagine` are kept
   * in the data, so flipping the source in the editor and back doesn't throw
   * away the other one.
   */
  sursaIcon: z.enum(["predefinita", "imagine"]).default("predefinita"),
  icon: z.enum(PARTNER_ICON_KEYS).default("building"),
  imagine: imageSchema,
  imagineAlt: z.string().trim().default(""),
});

export const partnerCollectionSchema = z
  .object({
    /** Small uppercase eyebrow above the logo row, e.g. "Susținuți de". */
    titlu: z.string().trim().default(""),
    subtitlu: z.string().trim().default(""),
    coloane: z.enum(["1", "2", "3", "4", "5", "6"]).default("6"),
    parteneri: z.array(partnerSchema).default([]),
  })
  .refine((d) => d.parteneri.every((p) => p.nume), {
    path: ["parteneri"],
    message: "Fiecare partener are nevoie de un nume",
  })
  .refine(
    (d) => d.parteneri.every((p) => p.sursaIcon !== "imagine" || p.imagine),
    {
      path: ["parteneri"],
      message: "Încarcă o imagine pentru fiecare partener setat pe imagine proprie",
    },
  )
  .refine(
    (d) => d.parteneri.every((p) => !p.imagine || p.imagineAlt.length > 0),
    {
      path: ["parteneri"],
      message: "Fiecare imagine are nevoie de un text alternativ",
    },
  );

export type PartnerCollectionData = z.infer<typeof partnerCollectionSchema>;
export type Partner = z.infer<typeof partnerSchema>;
export type PartnerImage = z.infer<typeof imageSchema>;

/**
 * Every field has a schema default, so a fresh block is already valid. Both the
 * section title and subtitle are optional — the renderer omits the header when
 * they're blank.
 */
export const PARTNER_COLLECTION_DEFAULTS: PartnerCollectionData = {
  titlu: "",
  subtitlu: "",
  coloane: "6",
  parteneri: [],
};

export const EMPTY_PARTNER: Partner = {
  nume: "",
  subtitlu: "",
  sursaIcon: "predefinita",
  icon: "building",
  imagine: null,
  imagineAlt: "",
};
