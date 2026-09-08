import { TestimonialCard } from "./TestimonialCard";
import { TestimonialCarousel } from "./TestimonialCarousel";
import type { TestimonialsData } from "./schema";

/**
 * "Testimonials" — a titled section rendering its items either as a responsive
 * grid or an Embla carousel. Server component; the carousel branch delegates to
 * a `"use client"` child.
 */
/**
 * Grid track sized to the item count so a short list fills the row instead of
 * hugging the left: 1 → full width, 2 → halves, 3+ → the capped three-up grid.
 */
function gridColumns(count: number): string {
  if (count === 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-1 sm:grid-cols-2";
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
}

export function Testimonials({ data }: { data: TestimonialsData }) {
  const { titlu, modAfisare, autoplay, afiseazaNavigarea, testimoniale } = data;

  return (
    <section>
      <div className="mx-auto max-w-7xl px-6 py-20">
        {titlu ? (
          <h2
            className="mx-auto mb-12 max-w-2xl text-center font-heading wrap-break-word"
            style={{
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              color: "#162040",
            }}
          >
            {titlu}
          </h2>
        ) : null}

        {testimoniale.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-[#94a3b8]">
            Niciun testimonial de afișat.
          </p>
        ) : modAfisare === "carusel" ? (
          <TestimonialCarousel
            items={testimoniale}
            showNav={afiseazaNavigarea}
            autoplay={autoplay}
          />
        ) : (
          <div className={`grid gap-6 ${gridColumns(testimoniale.length)}`}>
            {testimoniale.map((item, index) => (
              <TestimonialCard key={index} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
