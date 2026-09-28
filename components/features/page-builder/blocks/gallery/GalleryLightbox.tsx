"use client";

import { GalleryGrid } from "./GalleryGrid";
import { useGalleryLightbox } from "./useGalleryLightbox";
import type { ImageRatio } from "../shared/image-ratio";
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
  raport,
}: {
  images: GalleryImage[];
  stil: "grid" | "masonry";
  coloane: GalleryData["coloane"];
  raport: ImageRatio;
}) {
  const { open, overlay } = useGalleryLightbox(images);

  return (
    <>
      <GalleryGrid
        images={images}
        stil={stil}
        coloane={coloane}
        raport={raport}
        onSelect={open}
      />
      {overlay}
    </>
  );
}
