import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { FEATURE_ICONS } from "./icons";
import type { FeatureCard, FeatureCardsData } from "./schema";

const NAVY_BG = "#162040";
/**
 * The "default" background is a tint, not page white — the white cards need
 * something to sit on. Measured off the design.
 */
const DEFAULT_BG = "#f8faff";

/**
 * `auto-rows-fr` is what keeps every card the same height: 1fr rows all resolve
 * to the tallest row's track, so a short card in row 1 matches a long one in
 * row 2, not just its own row's siblings. Scoped to `sm:` — below it the grid
 * is a single column, where stretching every card to the longest description
 * would only add dead space.
 */
const COL_CLASS: Record<FeatureCardsData["coloane"], string> = {
  "1": "sm:grid-cols-1 lg:grid-cols-1",
  "2": "sm:auto-rows-fr sm:grid-cols-2 lg:grid-cols-2",
  "3": "sm:auto-rows-fr sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:auto-rows-fr sm:grid-cols-2 lg:grid-cols-4",
};

function Card({ card, isDark }: { card: FeatureCard; isDark: boolean }) {
  const Icon = FEATURE_ICONS[card.icon];
  const hasCta = Boolean(card.href && card.ctaLabel);

  return (
    <div
      className={`flex h-full min-w-0 flex-col rounded-2xl border p-6 ${
        isDark
          ? "border-white/10 bg-white/[0.03]"
          : "border-border bg-white shadow-sm"
      }`}
    >
      <span
        className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
        style={{ background: "rgba(45,190,143,0.12)", color: "#2dbe8f" }}
      >
        <Icon size={22} />
      </span>
      <h3
        className={`mb-2 text-lg font-semibold wrap-break-word ${
          isDark ? "text-white" : "text-[#162040]"
        }`}
      >
        {card.titlu}
      </h3>
      {card.descriere ? (
        <p
          className={`text-sm leading-relaxed wrap-break-word line-clamp-5 ${
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
          style={{ color: "#2dbe8f" }}
        >
          {card.ctaLabel} <ChevronRight size={16} />
        </Link>
      ) : null}
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
      <div className="relative mx-auto max-w-7xl px-6 py-20">
        {/* Section title is the small green eyebrow; the subtitle under it is
            the display-size line, matching the rest of the site's section
            headers (see `people-collection`). */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p
            className="mb-3 text-sm font-bold uppercase tracking-[0.12em] wrap-break-word"
            style={{ color: "#2dbe8f" }}
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
                color: isDark ? "#ffffff" : "#162040",
              }}
            >
              {descriere}
            </h2>
          ) : null}
        </div>

        {carduri.length > 0 ? (
          <div className={`grid grid-cols-1 gap-6 ${COL_CLASS[coloane]}`}>
            {carduri.map((card, index) => (
              <Card key={index} card={card} isDark={isDark} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
