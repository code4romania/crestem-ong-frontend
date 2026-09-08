import { z } from "zod";

/** Uploaded media, same shape the Hero blocks store from `uploadPageImageAction`. */
const imageSchema = z
  .object({ id: z.number(), url: z.string(), name: z.string().default("") })
  .nullable()
  .default(null);

const personSchema = z.object({
  imagine: imageSchema,
  imagineAlt: z.string().trim().default(""),
  nume: z.string().trim().default(""),
  rol: z.string().trim().default(""),
  organizatie: z.string().trim().default(""),
  descriere: z.string().trim().default(""),
  /** Free-form labels, rendered as pills at the bottom of the card. */
  taguri: z.array(z.string().trim()).default([]),
});

export const peopleGridSchema = z
  .object({
    titlu: z.string().trim().default(""),
    coloane: z.enum(["1", "2", "3", "4"]).default("3"),
    persoane: z.array(personSchema).default([]),
  })
  .refine((d) => d.persoane.every((p) => p.nume), {
    path: ["persoane"],
    message: "Fiecare persoană are nevoie de un nume",
  })
  .refine((d) => d.persoane.every((p) => !p.imagine || p.imagineAlt.length > 0), {
    path: ["persoane"],
    message: "Fiecare imagine are nevoie de un text alternativ",
  });

export type PeopleGridData = z.infer<typeof peopleGridSchema>;
export type Person = z.infer<typeof personSchema>;
export type PersonImage = z.infer<typeof imageSchema>;

/**
 * Every field has a schema default, so a fresh block is already valid. The
 * section title is optional — the renderer just omits the heading when it's
 * blank.
 */
export const PEOPLE_GRID_DEFAULTS: PeopleGridData = {
  titlu: "",
  coloane: "3",
  persoane: [],
};

export const EMPTY_PERSON: Person = {
  imagine: null,
  imagineAlt: "",
  nume: "",
  rol: "",
  organizatie: "",
  descriere: "",
  taguri: [],
};
