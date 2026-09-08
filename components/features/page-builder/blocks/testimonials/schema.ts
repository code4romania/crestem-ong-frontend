import { z } from "zod";

/**
 * One testimonial in the repeater. `testimonial` (the quote) and `nume` are the
 * meaningful minimum; `functie` / `organizatie` are optional attribution.
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
    modAfisare: z.enum(["carusel", "grila"]).default("grila"),
    /** Carousel-only; ignored when `modAfisare === "grila"`. */
    autoplay: z.boolean().default(false),
    /** Carousel-only: show the prev/next arrows and dots. */
    afiseazaNavigarea: z.boolean().default(true),
    testimoniale: z.array(testimonialSchema).default([]),
  })
  .refine((d) => d.testimoniale.every((t) => t.testimonial && t.nume), {
    path: ["testimoniale"],
    message: "Fiecare testimonial are nevoie de text și de un nume",
  });

export type TestimonialsData = z.infer<typeof testimonialsSchema>;
export type Testimonial = z.infer<typeof testimonialSchema>;

export const TESTIMONIALS_DEFAULTS: TestimonialsData = {
  titlu: "",
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
