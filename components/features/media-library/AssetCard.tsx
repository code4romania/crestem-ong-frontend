"use client";

import { Check, Film } from "lucide-react";
import { getMediaUrl } from "@/lib/api/client";
import type { MediaAssetCard as Asset } from "@/lib/api/media-library-types";
import { FileTypeBadge } from "./FileTypeBadge";
import { pluralPagini } from "./format";

export function AssetCard({
  asset,
  selected = false,
  selectable = false,
  onClick,
}: {
  asset: Asset;
  selected?: boolean;
  /** Show a checkbox and announce as a toggle (selection mode / picker). */
  selectable?: boolean;
  onClick?: () => void;
}) {
  const chips = asset.etichete.slice(0, 3);
  const overflow = asset.etichete.length - chips.length;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selectable ? selected : undefined}
      className={`group relative flex flex-col overflow-hidden rounded-xl border text-left transition-colors ${
        selected ? "border-[#2dbe8f] ring-2 ring-[#2dbe8f]/30" : "border-border hover:border-[#2dbe8f]"
      }`}
    >
      {selectable && (
        <span
          aria-hidden="true"
          className={`absolute left-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-md border ${
            selected
              ? "border-[#2dbe8f] bg-[#2dbe8f] text-white"
              : "border-white/80 bg-black/30 text-transparent"
          }`}
        >
          <Check size={13} strokeWidth={3} />
        </span>
      )}
      <div className="flex aspect-[4/3] items-center justify-center bg-slate-50">
        {asset.tip === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getMediaUrl(asset.fisier.url)}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : asset.tip === "video" ? (
          <div className="relative h-full w-full">
            {/* Fallback shown through the transparent <video> until (or unless)
                the browser can decode a frame — e.g. an unsupported .mov codec. */}
            <Film
              size={28}
              aria-hidden="true"
              className="absolute inset-0 m-auto text-[#94a3b8]"
            />
            {/* `#t=0.1` makes the browser seek ~0.1s in and paint that frame as
                a still poster, no server-side thumbnail needed. */}
            <video
              src={`${getMediaUrl(asset.fisier.url)}#t=0.1`}
              muted
              playsInline
              preload="metadata"
              tabIndex={-1}
              className="relative h-full w-full object-cover"
            />
          </div>
        ) : (
          <FileTypeBadge ext={asset.fisier.ext} url={asset.fisier.url} />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <span className="truncate font-heading text-sm font-semibold text-[#162040]">
          {asset.titlu}
        </span>
        {chips.length > 0 && (
          <span className="flex flex-wrap gap-1">
            {chips.map((t) => (
              <span key={t.id} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-[#475569]">
                {t.nume}
              </span>
            ))}
            {overflow > 0 && <span className="text-[11px] text-[#94a3b8]">+{overflow}</span>}
          </span>
        )}
        <span className="mt-auto text-[11px] text-[#94a3b8]">
          {asset.utilizariCount > 0
            ? `folosit pe ${pluralPagini(asset.utilizariCount)}`
            : "nefolosit"}
        </span>
      </div>
    </button>
  );
}
