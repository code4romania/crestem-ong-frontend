"use client";

import { GalleryGrid } from "./GalleryGrid";
import { useGalleryLightbox } from "./useGalleryLightbox";
import type { GalleryData, GalleryImage } from "./schema";

/**
 * Grid / masonry presentation with click-to-zoom. Used when the block's
 * "Deschide imaginile în lightbox" toggle is on and the style isn't the
 * carousel. The overlay itself lives in `useGalleryLightbox`.
 */
export function GalleryLightbox({
  images,
  stil,
  coloane,
}: {
  images: GalleryImage[];
  stil: "grid" | "masonry";
  coloane: GalleryData["coloane"];
}) {
  const { open, overlay } = useGalleryLightbox(images);

  return (
    <>
      <GalleryGrid
        images={images}
        stil={stil}
        coloane={coloane}
        onSelect={open}
      />
      {overlay}
    </>
  );
}
