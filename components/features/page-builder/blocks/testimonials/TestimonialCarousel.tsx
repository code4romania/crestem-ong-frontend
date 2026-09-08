"use client";

import { useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TestimonialCard } from "./TestimonialCard";
import type { Testimonial } from "./schema";

const AUTOPLAY_MS = 6000;

/**
 * Carousel presentation for the Testimonials block. One testimonial per slide.
 * `showNav` adds prev/next arrows and dots; `autoplay` advances every 6s,
 * pausing on hover / focus and when the OS asks for reduced motion.
 */
export function TestimonialCarousel({
  items,
  showNav,
  autoplay,
}: {
  items: Testimonial[];
  showNav: boolean;
  autoplay: boolean;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: true });
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (!emblaApi) return;
    const update = () => {
      setSnaps(emblaApi.scrollSnapList());
      setSelected(emblaApi.selectedScrollSnap());
    };
    update();
    emblaApi.on("select", update).on("reInit", update);
    return () => {
      emblaApi.off("select", update).off("reInit", update);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || !autoplay) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const id = window.setInterval(() => {
      if (!pausedRef.current) emblaApi.scrollNext();
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [emblaApi, autoplay]);

  return (
    <div
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
      onFocusCapture={() => {
        pausedRef.current = true;
      }}
      onBlurCapture={() => {
        pausedRef.current = false;
      }}
    >
      {/* `-mx-2` cancels each slide's `px-2` so the cards still align to the
          section edges, while the padding keeps every card's ring + shadow off
          the `overflow-hidden` clip boundary. */}
      <div className="-mx-2 overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {items.map((item, index) => (
            <div
              key={index}
              className="min-w-0 shrink-0 grow-0 basis-full px-2 py-1"
            >
              <TestimonialCard item={item} />
            </div>
          ))}
        </div>
      </div>

      {showNav && snaps.length > 1 ? (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Testimonialul anterior"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#475569] shadow-sm ring-1 ring-border transition-colors hover:text-[#162040]"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="flex items-center gap-2">
            {snaps.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => emblaApi?.scrollTo(index)}
                aria-label={`Mergi la testimonialul ${index + 1}`}
                aria-current={index === selected}
                className={`h-2 rounded-full transition-all ${
                  index === selected
                    ? "w-6 bg-[#2dbe8f]"
                    : "w-2 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </span>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Testimonialul următor"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#475569] shadow-sm ring-1 ring-border transition-colors hover:text-[#162040]"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
