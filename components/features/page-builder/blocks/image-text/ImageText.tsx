import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { getMediaUrl } from "@/lib/api/client";
import { RICH_TEXT_PROSE } from "../../rich-text/prose";
import { sanitizeRichText, hasRichText } from "../../rich-text/sanitize";
import type { ImageTextData } from "./schema";

/**
 * Grid track sizing for the side-by-side layouts. `proportie` is the image/text
 * ratio, so the tracks flip when the image moves to the right.
 */
const GRID_COLS: Record<
  "stanga" | "dreapta",
  Record<ImageTextData["proportie"], string>
> = {
  stanga: {
    "50-50": "lg:grid-cols-2",
    "40-60": "lg:grid-cols-[2fr_3fr]",
    "60-40": "lg:grid-cols-[3fr_2fr]",
  },
  dreapta: {
    "50-50": "lg:grid-cols-2",
    "40-60": "lg:grid-cols-[3fr_2fr]",
    "60-40": "lg:grid-cols-[2fr_3fr]",
  },
};

/**
 * "Image + text" — an image next to (or stacked above) a column of formatted
 * copy with an optional eyebrow, heading and up to two CTAs. Pure (no hooks, no
 * `"use client"`) so it renders on the public page unchanged once a backend
 * feeds it the same shape.
 *
 * `text` is sanitised again here, right before the raw-HTML sink, in case the
 * data reached this component without passing through the block schema.
 */
export function ImageText({ data }: { data: ImageTextData }) {
  const {
    image,
    altText,
    supratitlu,
    titlu,
    aliniere,
    proportie,
    colturi,
    primaryCta,
    secondaryCta,
  } = data;
  const text = sanitizeRichText(data.text);

  const rounded = colturi === "default" ? "rounded-2xl" : "";
  const hasPrimary = Boolean(primaryCta.label && primaryCta.href);
  const hasSecondary = Boolean(secondaryCta.label && secondaryCta.href);
  const stacked = aliniere === "centru";

  const textColumn = (
    <div className="flex min-w-0 flex-col justify-center">
      {supratitlu ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#2dbe8f] wrap-break-word">
          {supratitlu}
        </p>
      ) : null}

      {titlu ? (
        <h2
          className="mb-4 font-heading wrap-break-word"
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

      {hasRichText(text) ? (
        <div
          className={`${RICH_TEXT_PROSE} wrap-break-word`}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      ) : null}

      {hasPrimary || hasSecondary ? (
        <div className="mt-8 flex flex-wrap gap-4">
          {hasPrimary ? (
            <Link
              href={primaryCta.href}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-semibold text-white transition-all hover:-translate-y-0.5 hover:opacity-90"
              style={{
                background: "#2dbe8f",
                boxShadow: "0 4px 24px rgba(45,190,143,0.35)",
              }}
            >
              {primaryCta.label} <ArrowRight size={18} />
            </Link>
          ) : null}
          {hasSecondary ? (
            <Link
              href={secondaryCta.href}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3.5 font-semibold text-[#162040] transition-all hover:bg-slate-50"
            >
              {secondaryCta.label} <ChevronRight size={18} />
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  const imageColumn = image ? (
    <div
      className={`overflow-hidden ${rounded} ${
        stacked ? "" : "min-h-[280px]"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={getMediaUrl(image.url)}
        alt={altText}
        className={
          stacked ? "h-auto w-full" : "h-full w-full object-cover"
        }
      />
    </div>
  ) : (
    <div className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-[#94a3b8]">
      Adaugă o imagine.
    </div>
  );

  return (
    <section>
      <div className="mx-auto max-w-6xl px-6 py-16">
        {stacked ? (
          <div className="mx-auto max-w-3xl">
            {imageColumn}
            <div className="mt-8">{textColumn}</div>
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 gap-10 lg:gap-16 ${GRID_COLS[aliniere][proportie]}`}
          >
            <div className={aliniere === "dreapta" ? "lg:order-2" : "lg:order-1"}>
              {imageColumn}
            </div>
            <div className={aliniere === "dreapta" ? "lg:order-1" : "lg:order-2"}>
              {textColumn}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
