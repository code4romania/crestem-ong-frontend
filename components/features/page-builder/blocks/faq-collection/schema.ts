import { z } from "zod";

/** One question / answer pair in the accordion. Both fields are required. */
const faqItemSchema = z.object({
  intrebare: z.string().trim().default(""),
  raspuns: z.string().trim().default(""),
});

export const faqCollectionSchema = z
  .object({
    titlu: z.string().trim().default(""),
    /** Seed the first panel open on load. */
    primaDeschisa: z.boolean().default(true),
    intrebari: z.array(faqItemSchema).default([]),
  })
  .refine((d) => d.intrebari.every((q) => q.intrebare && q.raspuns), {
    path: ["intrebari"],
    message: "Fiecare întrebare are nevoie de text și de un răspuns",
  });

export type FaqCollectionData = z.infer<typeof faqCollectionSchema>;
export type FaqItem = z.infer<typeof faqItemSchema>;

export const FAQ_COLLECTION_DEFAULTS: FaqCollectionData = {
  titlu: "",
  primaDeschisa: true,
  intrebari: [],
};

export const EMPTY_FAQ_ITEM: FaqItem = {
  intrebare: "",
  raspuns: "",
};
