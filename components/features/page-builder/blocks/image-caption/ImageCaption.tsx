import { getMediaUrl } from "@/lib/api/client";
import type { ImageCaptionData } from "./schema";

const WIDTH_CLASS: Record<ImageCaptionData["latime"], string> = {
  compacta: "max-w-3xs",
  standard: "max-w-xs",
  lata: "max-w-lg",
  full: "max-w-none",
};

const ALIGN_CLASS: Record<ImageCaptionData["aliniere"], string> = {
  stanga: "mr-auto text-left",
  centru: "mx-auto text-center",
  dreapta: "ml-auto text-right",
};

const ASPECT_CLASS: Record<
  Exclude<ImageCaptionData["raport"], "original">,
  string
> = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
};

/**
 * "Image with caption" — a standalone image with sizing, alignment,
 * aspect-ratio and corner options, plus an optional caption / photo credit /
 * source line. Pure (no hooks, no `"use client"`) so it renders on the public
 * page unchanged once a backend feeds it the same shape.
 */
export function ImageCaption({ data }: { data: ImageCaptionData }) {
  const {
    image,
    altText,
    legenda,
    creditFoto,
    sursa,
    latime,
    aliniere,
    raport,
    colturi,
  } = data;

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

  const credit = [creditFoto, sursa].filter(Boolean).join(" · ");
  const hasCaption = Boolean(legenda || credit);

  return (
    <section>
      <div className="px-6 py-16">
        <figure className={`${WIDTH_CLASS[latime]} ${ALIGN_CLASS[aliniere]}`}>
          {aspectClass ? (
            <div className={`overflow-hidden ${rounded} ${aspectClass}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={altText}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={altText} className={`h-auto w-full ${rounded}`} />
          )}

          {hasCaption && (
            <figcaption className="mt-3 text-sm text-[#475569]">
              {legenda && <span className="block">{legenda}</span>}
              {credit && (
                <span className="mt-1 block text-xs text-[#94a3b8]">
                  {credit}
                </span>
              )}
            </figcaption>
          )}
        </figure>
      </div>
    </section>
  );
}
