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

/**
 * A named row of supporters ("Finanțatori", "Parteneri", …). The admin names
 * each group; the same organisation can sit in more than one group.
 */
const supporterGroupSchema = z.object({
  titlu: z.string().trim().default(""),
  sustinatori: z.array(supporterSchema).default([]),
});

export const MAX_SUPPORTER_GROUPS = 3;
const LEGACY_SUPPORTER_LABEL = "Susținut de:";

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

/**
 * Blocks saved before supporter groups existed stored one label
 * (`sustinutDeTitlu`) and one flat list (`sustinatori`). Fold those into a
 * single group so old pages keep rendering unchanged; the next save writes the
 * new shape. Idempotent — data that already has `grupuri` is returned as is.
 *
 * Exported because only the public renderer parses stored data through the
 * schema; the builder canvas and the editor receive the raw block data.
 */
export function migrateProgramHeader(raw: unknown): unknown {
  if (!raw || typeof raw !== "object" || "grupuri" in raw) return raw;
  const { sustinutDeTitlu, sustinatori, ...rest } = raw as Record<
    string,
    unknown
  >;
  return {
    ...rest,
    grupuri: [
      {
        titlu:
          typeof sustinutDeTitlu === "string"
            ? sustinutDeTitlu
            : LEGACY_SUPPORTER_LABEL,
        sustinatori: Array.isArray(sustinatori) ? sustinatori : [],
      },
    ],
  };
}

function allSupporters(d: {
  grupuri: { sustinatori: z.infer<typeof supporterSchema>[] }[];
}) {
  return d.grupuri.flatMap((g) => g.sustinatori);
}

const programHeaderObjectSchema = z
  .object({
    program: programRefSchema.default({ documentId: "", nume: "" }),
    sursaVizual: iconSourceSchema.default("predefinita"),
    icon: z.enum(PROGRAM_HEADER_ICON_KEYS).default("layers"),
    imagine: imageSchema,
    imagineAlt: z.string().trim().default(""),
    titlu: z.string().trim().min(1, "Titlul este obligatoriu"),
    subtitlu: z.string().trim().default(""),
    grupuri: z
      .array(supporterGroupSchema)
      .max(
        MAX_SUPPORTER_GROUPS,
        `Poți adăuga cel mult ${MAX_SUPPORTER_GROUPS} categorii de susținători`,
      )
      .default([]),
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
  .refine((d) => allSupporters(d).every((s) => s.nume), {
    path: ["grupuri"],
    message: "Fiecare susținător are nevoie de un nume",
  })
  .refine(
    (d) => allSupporters(d).every((s) => s.sursaIcon !== "imagine" || s.imagine),
    {
      path: ["grupuri"],
      message: "Încarcă un logo pentru fiecare susținător setat pe imagine proprie",
    },
  )
  .refine(
    (d) => allSupporters(d).every((s) => !s.imagine || s.imagineAlt.length > 0),
    {
      path: ["grupuri"],
      message: "Fiecare logo are nevoie de un text alternativ",
    },
  )
  .refine((d) => d.statistici.every((s) => s.valoare && s.eticheta), {
    path: ["statistici"],
    message: "Fiecare statistică are nevoie de valoare și etichetă",
  });

export const programHeaderSchema = z.preprocess(
  migrateProgramHeader,
  programHeaderObjectSchema,
);

export type ProgramHeaderData = z.infer<typeof programHeaderObjectSchema>;
export type ProgramSupporterGroup = z.infer<typeof supporterGroupSchema>;
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
  grupuri: [{ titlu: LEGACY_SUPPORTER_LABEL, sustinatori: [] }],
  statistici: [],
};

export const EMPTY_SUPPORTER: ProgramSupporter = {
  nume: "",
  sursaIcon: "predefinita",
  icon: "building",
  imagine: null,
  imagineAlt: "",
};

export const EMPTY_SUPPORTER_GROUP: ProgramSupporterGroup = {
  titlu: "",
  sustinatori: [],
};

export const EMPTY_STAT: ProgramHeaderStat = { valoare: "", eticheta: "" };
