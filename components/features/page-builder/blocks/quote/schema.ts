import { z } from "zod";

export const quoteSchema = z.object({
  citat: z.string().trim().min(1, "Citatul nu poate fi gol"),
  autor: z.string().trim().default(""),
  functie: z.string().trim().default(""),
  organizatie: z.string().trim().default(""),
  sursa: z.string().trim().default(""),
  stil: z.enum(["simplu", "evidentiat"]).default("evidentiat"),
  aliniere: z.enum(["stanga", "centru", "dreapta"]).default("stanga"),
});

export type QuoteData = z.infer<typeof quoteSchema>;

/**
 * Plain literal, not `schema.parse({})`. `citat: ""` is intentionally invalid
 * (fails `.min(1)`) so a blank draft can't pass validation when the admin
 * clicks "Adaugă blocul".
 */
export const QUOTE_DEFAULTS: QuoteData = {
  citat: "",
  autor: "",
  functie: "",
  organizatie: "",
  sursa: "",
  stil: "evidentiat",
  aliniere: "stanga",
};
