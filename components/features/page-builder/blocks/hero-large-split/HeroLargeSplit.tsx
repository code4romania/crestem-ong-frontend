import Link from "next/link";
import { ArrowRight, ChevronRight, Star } from "lucide-react";
import { getMediaUrl } from "@/lib/api/client";
import type { HeroLargeSplitData } from "./schema";

const VERTICAL_ALIGN_CLASS: Record<HeroLargeSplitData["verticalAlign"], string> = {
  centru: "lg:items-center",
  sus: "lg:items-start",
};

/**
 * "Hero – Large Split" — image on one side, headline + copy + up to two CTAs on
 * the other. Pure (no hooks, no `"use client"`) so it can render on the public
 * page unchanged once a backend feeds it the same data shape.
 */
export function HeroLargeSplit({ data }: { data: HeroLargeSplitData }) {
  const {
    supratitlu,
    titlu,
    subtitlu,
    image,
    imageAlt,
    imagePosition,
    verticalAlign,
    primaryCta,
    secondaryCta,
  } = data;

  const hasPrimary = Boolean(primaryCta.label && primaryCta.href);
  const hasSecondary = Boolean(secondaryCta.label && secondaryCta.href);
  const imageOnLeft = imagePosition === "stanga";

  const textColumn = (
    <div className={`min-w-0 ${imageOnLeft ? "lg:order-2" : "lg:order-1"}`}>
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
        style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)", fontWeight: 800, lineHeight: 1.1 }}
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
              style={{ background: "#2dbe8f", boxShadow: "0 4px 24px rgba(45,190,143,0.35)" }}
            >
              {primaryCta.label} <ArrowRight size={18} />
            </Link>
          ) : null}
          {hasSecondary ? (
            <Link
              href={secondaryCta.href}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.85)", border: "1.5px solid rgba(255,255,255,0.2)" }}
            >
              {secondaryCta.label} <ChevronRight size={18} />
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  const imageColumn = image ? (
    <div className={imageOnLeft ? "lg:order-1" : "lg:order-2"}>
      <div
        className="rounded-2xl overflow-hidden shadow-2xl"
        style={{ border: "1px solid rgba(255,255,255,0.1)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getMediaUrl(image.url)}
          alt={imageAlt}
          className="w-full h-80 lg:h-96 object-cover"
        />
      </div>
    </div>
  ) : null;

  return (
    <section
      className="flex items-center relative overflow-hidden"
      style={{ background: "#162040" }}
    >
      <div
        className={`relative max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 gap-16 items-center w-full ${
          image ? "lg:grid-cols-2" : ""
        } ${VERTICAL_ALIGN_CLASS[verticalAlign]}`}
      >
        {textColumn}
        {imageColumn}
      </div>
    </section>
  );
}
