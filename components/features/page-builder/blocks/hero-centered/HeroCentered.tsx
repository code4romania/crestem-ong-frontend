import Link from "next/link";
import { ArrowRight, ChevronRight, Star } from "lucide-react";
import { getMediaUrl } from "@/lib/api/client";
import type { HeroCenteredData } from "./schema";

const ALIGN_CLASS: Record<HeroCenteredData["horizontalAlign"], string> = {
  stanga: "items-start text-left",
  centru: "items-center text-center",
  dreapta: "items-end text-right",
};

const NAVY_BG = "#1c1c81";

/**
 * "Hero – Centered" — supratitlu pill, headline, copy and up to two CTAs stacked
 * in a single centered (or left/right-aligned) column, over one of four
 * backgrounds. Pure (no hooks, no `"use client"`) so it can render on the public
 * page unchanged once a backend feeds it the same data shape.
 */
export function HeroCentered({ data }: { data: HeroCenteredData }) {
  const {
    supratitlu,
    titlu,
    subtitlu,
    horizontalAlign,
    background,
    image,
    overlay,
    primaryCta,
    secondaryCta,
  } = data;

  const hasPrimary = Boolean(primaryCta.label && primaryCta.href);
  const hasSecondary = Boolean(secondaryCta.label && secondaryCta.href);
  const isDark = background === "accent" || background === "imagine";

  const sectionStyle: React.CSSProperties =
    background === "accent"
      ? { background: NAVY_BG }
      : background === "light"
        ? { background: "#eefaf4" }
        : background === "imagine" && image
          ? {
              backgroundImage: `url(${getMediaUrl(image.url)})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : { background: "#ffffff" };

  return (
    <section
      className="flex items-center relative overflow-hidden"
      style={sectionStyle}
    >
      {background === "imagine" && overlay ? (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "rgba(13,27,53,0.6)" }}
        />
      ) : null}

      <div
        className={`relative max-w-4xl mx-auto px-6 py-10 flex flex-col w-full ${ALIGN_CLASS[horizontalAlign]}`}
      >
        {supratitlu ? (
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 max-w-full wrap-break-word"
            style={{
              background: "rgba(0,212,149,0.15)",
              color: isDark ? "#00d495" : "#007d58",
              border: "1px solid rgba(0,212,149,0.3)",
            }}
          >
            <Star size={12} className="shrink-0" />
            {supratitlu}
          </div>
        ) : null}
        <h1
          className="mb-6 font-heading wrap-break-word max-w-full"
          style={{
            fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            color: isDark ? "#ffffff" : "#1c1c81",
          }}
        >
          {titlu}
        </h1>
        {subtitlu ? (
          <p
            className="mb-8 leading-relaxed wrap-break-word"
            style={{
              fontSize: "1.125rem",
              color: isDark ? "rgba(255,255,255,0.72)" : "#475569",
              maxWidth: "760px",
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
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white transition-all hover:brightness-90 hover:-translate-y-0.5"
                style={{ background: "#00d495", boxShadow: "0 4px 24px rgba(0,212,149,0.35)" }}
              >
                {primaryCta.label} <ArrowRight size={18} />
              </Link>
            ) : null}
            {hasSecondary ? (
              <Link
                href={secondaryCta.href}
                className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all ${
                  isDark ? "hover:bg-white/10" : "hover:bg-black/5"
                }`}
                style={
                  isDark
                    ? { color: "rgba(255,255,255,0.85)", border: "1.5px solid rgba(255,255,255,0.2)" }
                    : { color: "#1c1c81", border: "1.5px solid rgba(28,28,129,0.2)" }
                }
              >
                {secondaryCta.label} <ChevronRight size={18} />
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
