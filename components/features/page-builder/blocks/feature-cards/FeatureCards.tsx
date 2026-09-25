import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getMediaUrl } from "@/lib/api/client";
import { FEATURE_ICONS } from "./icons";
import type { FeatureCard, FeatureCardsData } from "./schema";

const NAVY_BG = "#1c1c81";
/**
 * The "default" background is a tint, not page white — the white cards need
 * something to sit on. Measured off the design.
 */
const DEFAULT_BG = "#f8faff";

/**
 * Per-card width for each column count, laid out as a wrapping flex row rather
 * than a grid so an incomplete last row (5 cards in 3 columns) sits centred
 * instead of hugging the left edge. The `calc` subtracts the `gap-6` (1.5rem)
 * gutters. Cards in a row share its height (flex stretch + `h-full`), but rows
 * size independently, so a short row isn't padded to the tallest card.
 */
const ITEM_WIDTH_CLASS: Record<FeatureCardsData["coloane"], string> = {
  "1": "w-full",
  "2": "w-full sm:w-[calc((100%-1.5rem)/2)]",
  "3": "w-full sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]",
  "4": "w-full sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-4.5rem)/4)]",
};

/**
 * The grid is capped by column count rather than always spanning `max-w-7xl`,
 * so card text keeps a readable line length and the block lines up with the
 * `max-w-3xl` text column of the rich-text blocks around it instead of
 * sprawling to the page edges.
 */
const WIDTH_CLASS: Record<FeatureCardsData["coloane"], string> = {
  "1": "max-w-3xl",
  "2": "max-w-4xl",
  "3": "max-w-6xl",
  "4": "max-w-7xl",
};

function Card({ card, isDark }: { card: FeatureCard; isDark: boolean }) {
  const Icon = FEATURE_ICONS[card.icon];
  const hasCta = Boolean(card.href && card.ctaLabel);
  const hasImage = Boolean(card.iconImage);

  return (
    <div
      className={`flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border ${
        isDark
          ? "border-white/10 bg-white/[0.03]"
          : "border-border bg-white shadow-sm"
      }`}
    >
      {card.iconImage ? (
        <div className="aspect-[16/9] w-full shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getMediaUrl(card.iconImage.url)}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <span
          className="mx-6 mt-6 mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ background: "rgba(0,212,149,0.12)", color: isDark ? "#00d495" : "#007d58" }}
        >
          <Icon size={22} />
        </span>
      )}
      <div
        className={`flex min-h-0 flex-1 flex-col p-6 ${hasImage ? "" : "pt-0"}`}
      >
        <h3
          className={`mb-2 text-lg font-semibold wrap-break-word ${
            isDark ? "text-white" : "text-[#1c1c81]"
          }`}
        >
          {card.titlu}
        </h3>
        {card.descriere ? (
          <p
            className={`text-[15px] leading-relaxed wrap-break-word ${
              isDark ? "text-white/60" : "text-[#475569]"
            }`}
          >
            {card.descriere}
          </p>
        ) : null}
        {hasCta ? (
          <Link
            href={card.href}
            className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold wrap-break-word transition-colors hover:opacity-80"
            style={{ color: isDark ? "#00d495" : "#007d58" }}
          >
            {card.ctaLabel} <ChevronRight size={16} />
          </Link>
        ) : null}
      </div>
    </div>
  );
}

/**
 * "Feature Cards" — a titled section over one of three colour backgrounds with a
 * responsive grid of icon / title / description cards, each with an optional CTA.
 * Pure (no hooks, no `"use client"`) so it can render on the public page
 * unchanged once a backend feeds it the same shape.
 */
export function FeatureCards({ data }: { data: FeatureCardsData }) {
  const { titluSectiune, descriere, coloane, background, carduri } = data;

  const isDark = background === "accent";
  const sectionStyle: React.CSSProperties =
    background === "accent"
      ? { background: NAVY_BG }
      : background === "light"
        ? { background: "#eefaf4" }
        : { background: DEFAULT_BG };

  return (
    <section className="relative overflow-hidden" style={sectionStyle}>
      <div className="relative mx-auto max-w-7xl px-6 py-10">
        {/* Section title is the small green eyebrow; the subtitle under it is
            the display-size line, matching the rest of the site's section
            headers (see `people-collection`). */}
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <p
            className="mb-3 text-sm font-bold uppercase tracking-[0.12em] wrap-break-word"
            style={{ color: isDark ? "#00d495" : "#007d58" }}
          >
            {titluSectiune}
          </p>
          {descriere ? (
            <h2
              className="font-heading whitespace-pre-line wrap-break-word"
              style={{
                fontSize: "clamp(2rem, 4vw, 2.75rem)",
                fontWeight: 800,
                lineHeight: 1.15,
                color: isDark ? "#ffffff" : "#1c1c81",
              }}
            >
              {descriere}
            </h2>
          ) : null}
        </div>

        {carduri.length > 0 ? (
          <div
            className={`mx-auto flex flex-wrap justify-center gap-6 ${WIDTH_CLASS[coloane]}`}
          >
            {carduri.map((card, index) => (
              <div key={index} className={`min-w-0 ${ITEM_WIDTH_CLASS[coloane]}`}>
                <Card card={card} isDark={isDark} />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
