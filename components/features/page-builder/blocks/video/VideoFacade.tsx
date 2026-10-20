"use client";

import { useState } from "react";
import { Play } from "lucide-react";

const PROVIDER_LABEL = {
  youtube: "YouTube",
  vimeo: "Vimeo",
} as const;

/**
 * Click-to-play wrapper around a YouTube/Vimeo embed.
 *
 * Until the visitor presses play there is no iframe in the DOM at all, so the
 * page makes no request to the provider and nothing is written to the
 * visitor's device. The button carries the notice that starting the video
 * loads the provider, which is what turns the click into informed consent and
 * saves the site from needing a consent banner for this one embed.
 *
 * Deliberately stateless beyond `activated`: the choice is not remembered
 * between blocks or page loads, because storing it would itself be storage on
 * the visitor's device — the thing the facade exists to avoid.
 */
export function VideoFacade({
  src,
  provider,
  posterUrl,
  title,
}: {
  src: string;
  provider: "youtube" | "vimeo";
  posterUrl: string | null;
  title: string;
}) {
  const [activated, setActivated] = useState(false);
  const label = PROVIDER_LABEL[provider];

  if (activated) {
    return (
      <iframe
        src={src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full border-0"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActivated(true)}
      aria-label={`Redă videoclipul: ${title}`}
      className="group relative h-full w-full cursor-pointer bg-[#1c1c81] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#007d58]"
    >
      {posterUrl && (
        /* Decorative: the button's aria-label already names the video. */
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={posterUrl}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      )}
      <span className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/50 px-6 text-center transition-colors group-hover:bg-black/60">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-[#1c1c81] shadow-lg transition-transform group-hover:scale-105">
          <Play size={28} fill="currentColor" className="ml-1" />
        </span>
        <span className="max-w-md text-xs leading-relaxed text-white">
          Prin redare se încarcă {label}, care poate seta cookies.
        </span>
      </span>
    </button>
  );
}
