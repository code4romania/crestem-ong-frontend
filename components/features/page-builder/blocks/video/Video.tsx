import { getMediaUrl } from "@/lib/api/client";
import { getEmbedSrc } from "./embed-src";
import { VideoFacade } from "./VideoFacade";
import { type VideoData } from "./schema";
import { RichTextContent } from "../../rich-text/RichTextContent";
import { hasRichText } from "../../rich-text/has-rich-text";

const WIDTH_CLASS: Record<VideoData["latime"], string> = {
  compacta: "max-w-3xl",
  standard: "max-w-5xl",
  lata: "max-w-7xl",
  full: "max-w-none",
};

const ASPECT_CLASS: Record<"16:9" | "4:3" | "9:16", string> = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  // Capped and centred: at the block's full width a vertical frame would be
  // several screens tall. Width is also tied to viewport height (75svh × 9/16)
  // so the whole frame stays on screen on short laptop displays.
  "9:16": "mx-auto aspect-[9/16] w-full max-w-[min(24rem,calc(75svh*9/16))]",
};

/**
 * "Material video" — a YouTube/Vimeo embed or an uploaded/linked video file,
 * with optional heading, description and caption. Pure (no hooks, no
 * `"use client"`) so it renders on the public page unchanged once a backend
 * feeds it the same shape; the click-to-play gate around third-party embeds
 * is the one client part, and it lives in `VideoFacade`.
 */
export function Video({ data }: { data: VideoData }) {
  const {
    sursaTip,
    sursaUrl,
    fisier,
    poster,
    altText,
    titlu,
    descriere,
    legenda,
    credit,
    latime,
    raport,
  } = data;

  const embedSrc = getEmbedSrc(data);
  const fileSrc = fisier ? getMediaUrl(fisier.url) : sursaUrl || null;
  const hasCaption = Boolean(legenda || credit);
  const iframeTitle = altText || titlu || "Material video";

  // Embeds have no intrinsic ratio, so "original" falls back to 16:9 there.
  const aspectClass =
    raport === "original"
      ? sursaTip === "fisier"
        ? null
        : ASPECT_CLASS["16:9"]
      : ASPECT_CLASS[raport];

  return (
    <section>
      <div className={`mx-auto px-6 py-8 ${WIDTH_CLASS[latime]}`}>
        {titlu && (
          <h2 className="text-2xl font-bold text-[#1c1c81]">{titlu}</h2>
        )}
        <RichTextContent html={descriere} className="mt-2 text-sm text-[#475569]" />

        <figure className={titlu || hasRichText(descriere) ? "mt-6" : ""}>
          {embedSrc ? (
            <div
              className={`overflow-hidden rounded-2xl bg-black ${
                aspectClass ?? "aspect-video"
              }`}
            >
              <VideoFacade
                src={embedSrc}
                provider={sursaTip === "vimeo" ? "vimeo" : "youtube"}
                posterUrl={poster ? getMediaUrl(poster.url) : null}
                title={iframeTitle}
              />
            </div>
          ) : fileSrc ? (
            <div
              className={`overflow-hidden rounded-2xl bg-black ${aspectClass ?? ""}`}
            >
              <video
                src={fileSrc}
                aria-label={altText || undefined}
                /* Non-negotiable for a local <video>: with the control bar
                   hidden there's no way to start or pause it. The schema
                   forbids `controale: false` for file sources; this also keeps
                   any stale data playable. */
                controls
                autoPlay={data.autoplay}
                loop={data.loop}
                muted={data.mut || data.autoplay}
                playsInline
                preload="metadata"
                className={`h-full w-full ${aspectClass ? "object-cover" : ""}`}
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-[#5b6779]">
              Adaugă o sursă video.
            </div>
          )}

          {hasCaption && (
            <figcaption className="mt-3">
              {legenda && (
                <span className="block text-sm text-[#5b6779]">{legenda}</span>
              )}
              {credit && (
                <span className="block text-xs text-[#5b6779]">{credit}</span>
              )}
            </figcaption>
          )}
        </figure>
      </div>
    </section>
  );
}
