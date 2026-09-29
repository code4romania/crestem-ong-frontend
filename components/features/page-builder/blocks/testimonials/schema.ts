import { z } from "zod";
import { hasRichText } from "../../rich-text/has-rich-text";

/**
 * One testimonial in the repeater. Only `testimonial` (the quote) is required;
 * `nume` / `functie` / `organizatie` are optional attribution.
 */
const testimonialSchema = z.object({
  testimonial: z.string().trim().default(""),
  nume: z.string().trim().default(""),
  functie: z.string().trim().default(""),
  organizatie: z.string().trim().default(""),
});

export const testimonialsSchema = z
  .object({
    titlu: z.string().trim().default(""),
    aliniereTitlu: z.enum(["stanga", "centru", "dreapta"]).default("stanga"),
    modAfisare: z.enum(["carusel", "grila"]).default("grila"),
    /** Carousel-only; ignored when `modAfisare === "grila"`. */
    autoplay: z.boolean().default(false),
    /** Carousel-only: show the prev/next arrows and dots. */
    afiseazaNavigarea: z.boolean().default(true),
    testimoniale: z.array(testimonialSchema).default([]),
  })
  .refine((d) => d.testimoniale.every((t) => hasRichText(t.testimonial)), {
    path: ["testimoniale"],
    message: "Fiecare testimonial are nevoie de text",
  });

export type TestimonialsData = z.infer<typeof testimonialsSchema>;
export type Testimonial = z.infer<typeof testimonialSchema>;

export const TESTIMONIALS_DEFAULTS: TestimonialsData = {
  titlu: "",
  aliniereTitlu: "stanga",
  modAfisare: "grila",
  autoplay: false,
  afiseazaNavigarea: true,
  testimoniale: [],
};

export const EMPTY_TESTIMONIAL: Testimonial = {
  testimonial: "",
  nume: "",
  functie: "",
  organizatie: "",
};
