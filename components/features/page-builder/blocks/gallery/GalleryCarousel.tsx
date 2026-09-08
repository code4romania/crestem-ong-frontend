"use client";

import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getMediaUrl } from "@/lib/api/client";
import { useGalleryLightbox } from "./useGalleryLightbox";
import type { GalleryData, GalleryImage } from "./schema";

/**
 * Carousel presentation for the Gallery block, showing `coloane` images per
 * view. Structure mirrors `TestimonialCarousel` (Embla, prev/next arrows +
 * dots). With `lightbox` on, each slide is also a click-to-zoom trigger sharing
 * the same overlay as the grid/masonry styles.
 */
const SLIDE_BASIS: Record<GalleryData["coloane"], string> = {
  "1": "basis-full",
  "2": "basis-full sm:basis-1/2",
  "3": "basis-1/2 sm:basis-1/2 lg:basis-1/3",
  "4": "basis-1/2 sm:basis-1/3 lg:basis-1/4",
};

export function GalleryCarousel({
  images,
  coloane,
  lightbox = false,
}: {
  images: GalleryImage[];
  coloane: GalleryData["coloane"];
  lightbox?: boolean;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start" });
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);
  const { open, overlay } = useGalleryLightbox(images);

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

  return (
    <div>
      {/* `-mx-2` cancels each slide's `px-2` so the row still aligns to the
          section edges while the padding keeps rounded corners off the clip. */}
      <div className="-mx-2 overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {images.map((image, index) => {
            const media = (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={getMediaUrl(image.url)}
                alt={image.alt}
                className="aspect-[4/3] w-full rounded-xl object-cover"
              />
            );
            return (
              <figure
                key={`${image.id}-${index}`}
                className={`min-w-0 shrink-0 grow-0 px-2 ${SLIDE_BASIS[coloane]}`}
              >
                {lightbox ? (
                  <button
                    type="button"
                    onClick={() => open(index)}
                    aria-label={
                      image.alt ? `Mărește: ${image.alt}` : "Mărește imaginea"
                    }
                    className="block w-full cursor-zoom-in overflow-hidden rounded-xl transition-transform hover:-translate-y-0.5"
                  >
                    {media}
                  </button>
                ) : (
                  media
                )}
                {image.caption ? (
                  <figcaption className="mt-2 text-sm text-[#475569] wrap-break-word">
                    {image.caption}
                  </figcaption>
                ) : null}
              </figure>
            );
          })}
        </div>
      </div>

      {snaps.length > 1 ? (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Imaginea anterioară"
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
                aria-label={`Mergi la imaginea ${index + 1}`}
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
            aria-label="Imaginea următoare"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#475569] shadow-sm ring-1 ring-border transition-colors hover:text-[#162040]"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      ) : null}

      {overlay}
    </div>
  );
}
