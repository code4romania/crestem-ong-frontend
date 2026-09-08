import { GalleryCarousel } from "./GalleryCarousel";
import { GalleryGrid } from "./GalleryGrid";
import { GalleryLightbox } from "./GalleryLightbox";
import type { GalleryData } from "./schema";

/**
 * "Gallery" — a titled photo gallery rendered as a grid, a CSS-columns masonry
 * or an Embla carousel, with an optional click-to-zoom lightbox. Server
 * component; the carousel and lightbox branches delegate to `"use client"`
 * children (same split as the Testimonials block).
 */
export function Gallery({ data }: { data: GalleryData }) {
  const { titlu, descriere, imagini, stil, coloane, lightbox } = data;

  return (
    <section>
      <div className="mx-auto max-w-7xl px-6 py-16">
        {titlu ? (
          <h2
            className="mb-3 font-heading wrap-break-word"
            style={{
              fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
              fontWeight: 800,
              lineHeight: 1.2,
              color: "#162040",
            }}
          >
            {titlu}
          </h2>
        ) : null}

        {descriere ? (
          <p className="mb-10 max-w-2xl text-[#475569] wrap-break-word">
            {descriere}
          </p>
        ) : (
          <div className="mb-10" />
        )}

        {imagini.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-[#94a3b8]">
            Nicio imagine de afișat.
          </p>
        ) : stil === "carusel" ? (
          <GalleryCarousel
            images={imagini}
            coloane={coloane}
            lightbox={lightbox}
          />
        ) : lightbox ? (
          <GalleryLightbox images={imagini} stil={stil} coloane={coloane} />
        ) : (
          <GalleryGrid images={imagini} stil={stil} coloane={coloane} />
        )}
      </div>
    </section>
  );
}
