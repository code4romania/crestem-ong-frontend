import { z } from "zod";
import { ctaHasTarget } from "../shared/cta";

/**
 * Fixed icon palette for a programme card — same set as Feature Cards. Stored as
 * a string key (not a component reference) so the schema stays serialisable and
 * the renderer stays pure; `icons.ts` maps the key back to a `lucide-react`
 * icon at render time.
 */
export const PROGRAMME_ICON_KEYS = [
  "book",
  "users",
  "award",
  "globe",
  "graduation",
  "library",
  "layers",
  "file",
  "zap",
  "calendar",
  "chart",
  "check",
] as const;

export type ProgrammeIconKey = (typeof PROGRAMME_ICON_KEYS)[number];

/** Uploaded media, same shape the Hero blocks store from `uploadPageImageAction`. */
const imageSchema = z
  .object({ id: z.number(), url: z.string(), name: z.string().default("") })
  .nullable()
  .default(null);

const programSchema = z.object({
  imagine: imageSchema,
  imagineAlt: z.string().trim().default(""),
  icon: z.enum(PROGRAMME_ICON_KEYS).default("layers"),
  titlu: z.string().trim().default(""),
  subtitlu: z.string().trim().default(""),
  descriere: z.string().trim().default(""),
  perioada: z.string().trim().default(""),
  href: z.string().trim().default(""),
  /** Page-backed link target; see `blocks/shared/cta.ts`. */
  pagina: z.string().trim().default(""),
  subPagina: z.boolean().default(false),
  ctaLabel: z.string().trim().default(""),
});

export const programmeGridSchema = z
  .object({
    titlu: z.string().trim().default(""),
    coloane: z.enum(["1", "2", "3", "4"]).default("2"),
    programe: z.array(programSchema).default([]),
  })
  .refine((d) => d.programe.every((p) => p.titlu), {
    path: ["programe"],
    message: "Fiecare program are nevoie de un titlu",
  })
  .refine((d) => d.programe.every((p) => !p.imagine || p.imagineAlt.length > 0), {
    path: ["programe"],
    message: "Fiecare imagine are nevoie de un text alternativ",
  })
  .refine(
    (d) => d.programe.every((p) => ctaHasTarget(p) === Boolean(p.ctaLabel)),
    {
      path: ["programe"],
      message: "La un program cu link completează și eticheta butonului (și invers)",
    },
  );

export type ProgrammeGridData = z.infer<typeof programmeGridSchema>;
export type Program = z.infer<typeof programSchema>;
export type ProgramImage = z.infer<typeof imageSchema>;

/**
 * Every field has a schema default, so a fresh block is already valid. The
 * section title is optional — the renderer just omits the heading when it's
 * blank.
 */
export const PROGRAMME_GRID_DEFAULTS: ProgrammeGridData = {
  titlu: "",
  coloane: "2",
  programe: [],
};

export const EMPTY_PROGRAM: Program = {
  imagine: null,
  imagineAlt: "",
  icon: "layers",
  titlu: "",
  subtitlu: "",
  descriere: "",
  perioada: "",
  href: "",
  pagina: "",
  subPagina: false,
  ctaLabel: "",
};
