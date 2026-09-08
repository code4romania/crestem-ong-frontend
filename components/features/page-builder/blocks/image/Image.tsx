import Link from "next/link";
import { getMediaUrl } from "@/lib/api/client";
import type { ImageData } from "./schema";

const WIDTH_CLASS: Record<ImageData["latime"], string> = {
  compacta: "max-w-3xs",
  standard: "max-w-xs",
  lata: "max-w-lg",
  full: "max-w-none",
};

const ALIGN_CLASS: Record<ImageData["aliniere"], string> = {
  stanga: "mr-auto",
  centru: "mx-auto",
  dreapta: "ml-auto",
};

const ASPECT_CLASS: Record<Exclude<ImageData["raport"], "original">, string> = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
};

/**
 * "Image" — a standalone image with sizing, alignment, aspect-ratio and corner
 * options, optionally wrapped in a link. Pure (no hooks, no `"use client"`) so it
 * renders on the public page unchanged once a backend feeds it the same shape.
 */
export function Image({ data }: { data: ImageData }) {
  const { image, altText, latime, aliniere, raport, colturi, areLink, link } =
    data;

  if (!image) {
    return (
      <section>
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-[#94a3b8]">
            Adaugă o imagine.
          </div>
        </div>
      </section>
    );
  }

  const src = getMediaUrl(image.url);
  const rounded = colturi === "default" ? "rounded-2xl" : "";
  const aspectClass = raport === "original" ? null : ASPECT_CLASS[raport];

  const media = aspectClass ? (
    <div className={`overflow-hidden ${rounded} ${aspectClass}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={altText} className="h-full w-full object-cover" />
    </div>
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={altText} className={`h-auto w-full ${rounded}`} />
  );

  return (
    <section>
      <div className="px-6 py-16">
        <figure
          className={`${WIDTH_CLASS[latime]} ${ALIGN_CLASS[aliniere]}`}
        >
          {areLink && link ? (
            <Link
              href={link}
              {...(data.linkTabNou
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="block"
            >
              {media}
            </Link>
          ) : (
            media
          )}
        </figure>
      </div>
    </section>
  );
}
