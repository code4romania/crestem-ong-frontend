import Link from "next/link";
import { ArrowRight, ChevronRight, Star } from "lucide-react";
import type { HeroStat, HeroStatisticsData } from "./schema";

const NAVY_BG = "#162040";

const COL_CLASS: Record<HeroStatisticsData["coloane"], string> = {
  "1": "sm:grid-cols-1 lg:grid-cols-1",
  "2": "sm:grid-cols-2 lg:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};

function StatCell({ stat, className }: { stat: HeroStat; className: string }) {
  return (
    <div className={className}>
      <p
        style={{ fontSize: "1.75rem", fontWeight: 700 }}
        className="text-white wrap-break-word"
      >
        {stat.valoare}
      </p>
      <p className="mt-1 text-sm text-white/60 wrap-break-word">{stat.eticheta}</p>
      {stat.descriere ? (
        <p className="mt-1 text-xs text-white/40 wrap-break-word">{stat.descriere}</p>
      ) : null}
    </div>
  );
}

/**
 * "Hero – Statistics" — headline, copy and up to two CTAs on the left; a grid of
 * value/label stat cards on the right, over the navy background. Pure (no hooks,
 * no `"use client"`) so it can render on the public page unchanged once a backend
 * feeds it the same data shape.
 */
export function HeroStatistics({ data }: { data: HeroStatisticsData }) {
  const {
    supratitlu,
    titlu,
    subtitlu,
    primaryCta,
    secondaryCta,
    statistici,
    coloane,
    separator,
  } = data;

  const hasPrimary = Boolean(primaryCta.label && primaryCta.href);
  const hasSecondary = Boolean(secondaryCta.label && secondaryCta.href);
  const hasStats = statistici.length > 0;

  const gridClass = separator
    ? `grid grid-cols-1 gap-0 divide-x divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 ${COL_CLASS[coloane]}`
    : `grid grid-cols-1 gap-4 ${COL_CLASS[coloane]}`;
  const cellClass = separator
    ? "p-6"
    : "rounded-2xl border border-white/10 bg-white/[0.03] p-6";

  return (
    <section
      className="flex items-center relative overflow-hidden"
      style={{ background: NAVY_BG }}
    >
      <div
        className={`relative max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 gap-16 items-center w-full ${
          hasStats ? "lg:grid-cols-2" : ""
        }`}
      >
        <div className="min-w-0">
          {supratitlu ? (
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 max-w-full wrap-break-word"
              style={{
                background: "rgba(45,190,143,0.15)",
                color: "#2dbe8f",
                border: "1px solid rgba(45,190,143,0.3)",
              }}
            >
              <Star size={12} className="shrink-0" />
              {supratitlu}
            </div>
          ) : null}
          <h1
            className="mb-6 text-white font-heading wrap-break-word"
            style={{
              fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
              fontWeight: 800,
              lineHeight: 1.1,
            }}
          >
            {titlu}
          </h1>
          {subtitlu ? (
            <p
              className="mb-8 leading-relaxed wrap-break-word"
              style={{
                fontSize: "1.125rem",
                color: "rgba(255,255,255,0.72)",
                maxWidth: "480px",
              }}
            >
              {subtitlu}
            </p>
          ) : null}
          {hasPrimary || hasSecondary ? (
            <div className="flex flex-wrap gap-4">
              {hasPrimary ? (
                <Link
                  href={primaryCta.href}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
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
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all hover:bg-white/10"
                  style={{
                    color: "rgba(255,255,255,0.85)",
                    border: "1.5px solid rgba(255,255,255,0.2)",
                  }}
                >
                  {secondaryCta.label} <ChevronRight size={18} />
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>

        {hasStats ? (
          <div className={gridClass}>
            {statistici.map((stat, index) => (
              <StatCell key={index} stat={stat} className={cellClass} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
