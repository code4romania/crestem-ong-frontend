import { getMediaUrl } from "@/lib/api/client";
import { getEmbedSrc } from "./embed-src";
import { VideoFacade } from "./VideoFacade";
import { type VideoData } from "./schema";

const WIDTH_CLASS: Record<VideoData["latime"], string> = {
  compacta: "max-w-2xl",
  standard: "max-w-3xl",
  lata: "max-w-5xl",
  full: "max-w-none",
};

const ASPECT_CLASS: Record<"16:9" | "4:3", string> = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
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
          <h2 className="text-2xl font-bold text-[#162040]">{titlu}</h2>
        )}
        {descriere && (
          <p className="mt-2 text-sm text-[#475569]">{descriere}</p>
        )}

        <figure className={titlu || descriere ? "mt-6" : ""}>
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
            <div className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-[#94a3b8]">
              Adaugă o sursă video.
            </div>
          )}

          {hasCaption && (
            <figcaption className="mt-3">
              {legenda && (
                <span className="block text-sm text-[#64748b]">{legenda}</span>
              )}
              {credit && (
                <span className="block text-xs text-[#94a3b8]">{credit}</span>
              )}
            </figcaption>
          )}
        </figure>
      </div>
    </section>
  );
}
