import { z } from "zod";

/**
 * "Tip persoană" filter, mapped to user roles: `persoana-resursa` === `mentor`,
 * `echipa-fdsc` === super-admin + editor-fdsc, `toate` applies no filter.
 */
export const PERSON_TYPE_FILTERS = [
  "toate",
  "persoana-resursa",
  "echipa-fdsc",
] as const;
export type PersonTypeFilter = (typeof PERSON_TYPE_FILTERS)[number];

export const peopleCollectionSchema = z.object({
  /** Green uppercase eyebrow above the heading, e.g. "Oamenii din spatele platformei". */
  supratitlu: z.string().trim().default(""),
  titlu: z.string().trim().default(""),
  tipPersoana: z.enum(PERSON_TYPE_FILTERS).default("toate"),
  /**
   * Programme documentIds. Empty === all programmes; otherwise a person matches
   * if they are associated with any of the selected programmes.
   */
  programe: z.array(z.string()).default([]),
  sortare: z.enum(["az", "za", "recente"]).default("az"),
  numarPersoane: z.enum(["4", "8", "12", "toate"]).default("8"),
  /**
   * How many rows the people are spread over — not columns. "1" puts everyone
   * on a single row; "2" splits them across two, and so on. The per-row count
   * is derived from the number of people actually rendered.
   */
  randuri: z.enum(["1", "2", "3", "4"]).default("1"),
  afiseazaFotografia: z.boolean().default(true),
  afiseazaTipul: z.boolean().default(true),
});

export type PeopleCollectionData = z.infer<typeof peopleCollectionSchema>;

/**
 * Every field has a schema default, so a fresh block is already valid. The
 * section title is optional — the renderer just omits the heading when it's
 * blank.
 */
export const PEOPLE_COLLECTION_DEFAULTS: PeopleCollectionData = {
  supratitlu: "",
  titlu: "",
  tipPersoana: "toate",
  programe: [],
  sortare: "az",
  numarPersoane: "8",
  randuri: "1",
  afiseazaFotografia: true,
  afiseazaTipul: true,
};
