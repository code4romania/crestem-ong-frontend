import { z } from "zod";

/**
 * Fixed icon palette for the programme mark and for a supporter logo. Stored as
 * a string key (not a component reference) so the schema stays serialisable and
 * the renderer stays pure — `icons.ts` maps the key back to a `lucide-react`
 * icon at render time. Same approach as `partner-collection/icons.ts`.
 */
export const PROGRAM_HEADER_ICON_KEYS = [
  "layers",
  "rocket",
  "graduation",
  "users",
  "handshake",
  "building",
  "landmark",
  "globe",
  "award",
  "trophy",
  "target",
  "compass",
  "sparkles",
  "star",
  "lightbulb",
  "book",
  "briefcase",
  "calendar",
  "chart",
  "heart",
  "leaf",
  "shield",
] as const;

export type ProgramHeaderIconKey = (typeof PROGRAM_HEADER_ICON_KEYS)[number];

/** Uploaded media, same shape the Hero and Partner blocks store. */
const imageSchema = z
  .object({ id: z.number(), url: z.string(), name: z.string().default("") })
  .nullable()
  .default(null);

/**
 * Which of the two visuals is shown. Both `icon` and `imagine` are kept in the
 * data, so flipping the source in the editor and back doesn't throw the other
 * one away.
 */
const iconSourceSchema = z.enum(["predefinita", "imagine"]);

const supporterSchema = z.object({
  nume: z.string().trim().default(""),
  sursaIcon: iconSourceSchema.default("predefinita"),
  icon: z.enum(PROGRAM_HEADER_ICON_KEYS).default("building"),
  imagine: imageSchema,
  imagineAlt: z.string().trim().default(""),
});

const statSchema = z.object({
  valoare: z.string().trim().default(""),
  eticheta: z.string().trim().default(""),
});

/**
 * The programme this header stands for, snapshotted at pick time: the editor
 * copies the name (and seeds the stats) out of the backend rather than having
 * the renderer fetch. The programme list endpoint is FDSC-staff gated, so a
 * live read would fail for the public visitor this header is written for.
 * `documentId` is kept so the editor can re-import on demand.
 */
const programRefSchema = z.object({
  documentId: z.string().trim().default(""),
  nume: z.string().trim().default(""),
});

export const programHeaderSchema = z
  .object({
    program: programRefSchema.default({ documentId: "", nume: "" }),
    sursaVizual: iconSourceSchema.default("predefinita"),
    icon: z.enum(PROGRAM_HEADER_ICON_KEYS).default("layers"),
    imagine: imageSchema,
    imagineAlt: z.string().trim().default(""),
    titlu: z.string().trim().min(1, "Titlul este obligatoriu"),
    subtitlu: z.string().trim().default(""),
    /** Small uppercase eyebrow in front of the logo row. */
    sustinutDeTitlu: z.string().trim().default("Susținut de:"),
    sustinatori: z.array(supporterSchema).default([]),
    statistici: z.array(statSchema).default([]),
  })
  .refine((d) => d.sursaVizual !== "imagine" || d.imagine, {
    path: ["imagine"],
    message: "Încarcă o imagine pentru program sau alege o iconiță din listă",
  })
  .refine((d) => !d.imagine || d.imagineAlt.length > 0, {
    path: ["imagine"],
    message: "Imaginea programului are nevoie de un text alternativ",
  })
  .refine((d) => d.sustinatori.every((s) => s.nume), {
    path: ["sustinatori"],
    message: "Fiecare susținător are nevoie de un nume",
  })
  .refine(
    (d) => d.sustinatori.every((s) => s.sursaIcon !== "imagine" || s.imagine),
    {
      path: ["sustinatori"],
      message: "Încarcă un logo pentru fiecare susținător setat pe imagine proprie",
    },
  )
  .refine((d) => d.sustinatori.every((s) => !s.imagine || s.imagineAlt.length > 0), {
    path: ["sustinatori"],
    message: "Fiecare logo are nevoie de un text alternativ",
  })
  .refine((d) => d.statistici.every((s) => s.valoare && s.eticheta), {
    path: ["statistici"],
    message: "Fiecare statistică are nevoie de valoare și etichetă",
  });

export type ProgramHeaderData = z.infer<typeof programHeaderSchema>;
export type ProgramSupporter = z.infer<typeof supporterSchema>;
export type ProgramHeaderStat = z.infer<typeof statSchema>;

/**
 * Plain literal, not `schema.parse({})` — the `.refine` chain makes that throw.
 * `titlu: ""` is intentionally invalid so a blank draft can't pass validation
 * when the admin clicks "Adaugă blocul".
 */
export const PROGRAM_HEADER_DEFAULTS: ProgramHeaderData = {
  program: { documentId: "", nume: "" },
  sursaVizual: "predefinita",
  icon: "layers",
  imagine: null,
  imagineAlt: "",
  titlu: "",
  subtitlu: "",
  sustinutDeTitlu: "Susținut de:",
  sustinatori: [],
  statistici: [],
};

export const EMPTY_SUPPORTER: ProgramSupporter = {
  nume: "",
  sursaIcon: "predefinita",
  icon: "building",
  imagine: null,
  imagineAlt: "",
};

export const EMPTY_STAT: ProgramHeaderStat = { valoare: "", eticheta: "" };
