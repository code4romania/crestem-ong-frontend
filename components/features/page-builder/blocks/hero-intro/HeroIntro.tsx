import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { HeroIntroData } from "./schema";

const ALIGN_CLASS: Record<HeroIntroData["horizontalAlign"], string> = {
  stanga: "items-start text-left",
  centru: "items-center text-center",
  dreapta: "items-end text-right",
};

const NAVY_BG = "#162040";

/**
 * "Hero – Intro" — a short intro section: uppercase supratitlu, headline,
 * a paragraph of intro copy and up to two CTAs, in a single narrow column over
 * one of three colour backgrounds. Pure (no hooks, no `"use client"`) so it can
 * render on the public page unchanged once a backend feeds it the same shape.
 */
export function HeroIntro({ data }: { data: HeroIntroData }) {
  const {
    supratitlu,
    titlu,
    textIntroductiv,
    horizontalAlign,
    background,
    primaryCta,
    secondaryCta,
  } = data;

  const hasPrimary = Boolean(primaryCta.label && primaryCta.href);
  const hasSecondary = Boolean(secondaryCta.label && secondaryCta.href);
  const isDark = background === "accent";

  const sectionStyle: React.CSSProperties =
    background === "accent"
      ? { background: NAVY_BG }
      : background === "light"
        ? { background: "#eefaf4" }
        : { background: "#ffffff" };

  return (
    <section
      className="flex items-center relative overflow-hidden"
      style={sectionStyle}
    >
      <div
        className={`relative max-w-3xl mx-auto px-6 py-20 flex flex-col w-full ${ALIGN_CLASS[horizontalAlign]}`}
      >
        {supratitlu ? (
          <p
            className="mb-4 text-xs font-semibold uppercase tracking-wider wrap-break-word"
            style={{ color: "#2dbe8f" }}
          >
            {supratitlu}
          </p>
        ) : null}
        <h1
          className="mb-5 font-heading wrap-break-word max-w-full"
          style={{
            fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            color: isDark ? "#ffffff" : "#162040",
          }}
        >
          {titlu}
        </h1>
        {textIntroductiv ? (
          <p
            className="mb-8 leading-relaxed whitespace-pre-line wrap-break-word"
            style={{
              fontSize: "1.125rem",
              color: isDark ? "rgba(255,255,255,0.72)" : "#475569",
              maxWidth: "560px",
            }}
          >
            {textIntroductiv}
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
                className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all ${
                  isDark ? "hover:bg-white/10" : "hover:bg-black/5"
                }`}
                style={
                  isDark
                    ? {
                        color: "rgba(255,255,255,0.85)",
                        border: "1.5px solid rgba(255,255,255,0.2)",
                      }
                    : {
                        color: "#162040",
                        border: "1.5px solid rgba(22,32,64,0.2)",
                      }
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
