import { getMediaUrl } from "@/lib/api/client";
import type { GalleryData, GalleryImage } from "./schema";

/**
 * Shared grid / masonry markup for the Gallery block. Pure (no hooks, no
 * `"use client"`) so `Gallery.tsx` can render it on the server; `GalleryLightbox`
 * reuses the exact same layout on the client and passes `onSelect` to make each
 * tile a zoom trigger. Column classes are spelled out as literals so the
 * Tailwind v4 scanner picks them up.
 */
const GRID_COLS: Record<GalleryData["coloane"], string> = {
  "1": "grid-cols-1",
  "2": "grid-cols-1 sm:grid-cols-2",
  "3": "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3",
  "4": "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
};

const MASONRY_COLS: Record<GalleryData["coloane"], string> = {
  "1": "columns-1",
  "2": "columns-1 sm:columns-2",
  "3": "columns-2 sm:columns-2 lg:columns-3",
  "4": "columns-2 sm:columns-3 lg:columns-4",
};

function Figure({
  image,
  masonry,
  onSelect,
  index,
}: {
  image: GalleryImage;
  masonry: boolean;
  onSelect?: (index: number) => void;
  index: number;
}) {
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={getMediaUrl(image.url)}
      alt={image.alt}
      className={
        masonry
          ? "w-full rounded-xl"
          : "aspect-[4/3] w-full rounded-xl object-cover"
      }
    />
  );

  return (
    <figure className={masonry ? "mb-4 break-inside-avoid" : ""}>
      {onSelect ? (
        <button
          type="button"
          onClick={() => onSelect(index)}
          aria-label={
            image.alt ? `Mărește: ${image.alt}` : "Mărește imaginea"
          }
          className="block w-full cursor-zoom-in overflow-hidden rounded-xl transition-transform hover:-translate-y-0.5"
        >
          {img}
        </button>
      ) : (
        img
      )}
      {image.caption ? (
        <figcaption className="mt-2 text-sm text-[#475569] wrap-break-word">
          {image.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

export function GalleryGrid({
  images,
  stil,
  coloane,
  onSelect,
}: {
  images: GalleryImage[];
  stil: "grid" | "masonry";
  coloane: GalleryData["coloane"];
  onSelect?: (index: number) => void;
}) {
  if (stil === "masonry") {
    return (
      <div className={`${MASONRY_COLS[coloane]} gap-4`}>
        {images.map((image, index) => (
          <Figure
            key={`${image.id}-${index}`}
            image={image}
            masonry
            onSelect={onSelect}
            index={index}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${GRID_COLS[coloane]}`}>
      {images.map((image, index) => (
        <Figure
          key={`${image.id}-${index}`}
          image={image}
          masonry={false}
          onSelect={onSelect}
          index={index}
        />
      ))}
    </div>
  );
}
