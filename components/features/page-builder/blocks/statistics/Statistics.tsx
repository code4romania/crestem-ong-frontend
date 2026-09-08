import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { Stat, StatisticsData } from "./schema";

const ALIGN_CLASS: Record<StatisticsData["aliniere"], string> = {
  stanga: "text-left",
  centru: "text-center",
  dreapta: "text-right",
};

const COL_CLASS: Record<StatisticsData["coloane"], string> = {
  "1": "sm:grid-cols-1 lg:grid-cols-1",
  "2": "sm:grid-cols-2 lg:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};

function StatCell({ stat, className }: { stat: Stat; className: string }) {
  return (
    <div className={className}>
      <p
        style={{ fontSize: "2rem", fontWeight: 800, color: "#162040" }}
        className="wrap-break-word"
      >
        {stat.valoare}
      </p>
      <p className="mt-1 text-sm font-medium text-[#475569] wrap-break-word">
        {stat.eticheta}
      </p>
      {stat.descriere ? (
        <p className="mt-1 text-xs text-[#94a3b8] wrap-break-word">
          {stat.descriere}
        </p>
      ) : null}
    </div>
  );
}

/**
 * "Structure – Statistics" — an optional heading block (eyebrow / title /
 * description) over a value+label stat grid, with up to two CTAs. Pure (no
 * hooks, no `"use client"`) so it renders on the public page unchanged once a
 * backend feeds it the same data shape.
 */
export function Statistics({ data }: { data: StatisticsData }) {
  const {
    titlu,
    subtitlu,
    descriere,
    statistici,
    coloane,
    aliniere,
    separator,
    primaryCta,
    secondaryCta,
  } = data;

  const hasPrimary = Boolean(primaryCta.label && primaryCta.href);
  const hasSecondary = Boolean(secondaryCta.label && secondaryCta.href);
  const hasHeader = Boolean(subtitlu || titlu || descriere);
  const hasStats = statistici.length > 0;

  // Separator variant: a 1px grid gap over a slate ground shows through as
  // hairlines between cells — no sibling `divide-*` utilities. Without it the
  // counters are bare numbers on the page ground: no card, no border, no fill,
  // so a wider gap carries the separation the removed chrome used to.
  const gridClass = separator
    ? `grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-slate-200 ${COL_CLASS[coloane]}`
    : `grid grid-cols-1 gap-8 ${COL_CLASS[coloane]}`;
  const cellClass = `${separator ? "bg-white p-6" : ""} ${ALIGN_CLASS[aliniere]}`;

  return (
    <section>
      <div className="mx-auto max-w-7xl px-6 py-16">
        {hasHeader ? (
          <div className="mb-10">
            {subtitlu ? (
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#2dbe8f] wrap-break-word">
                {subtitlu}
              </p>
            ) : null}
            {titlu ? (
              <h2
                className="font-heading wrap-break-word"
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
            {descriere ? (
              <p className="mt-4 max-w-2xl text-[#475569] wrap-break-word">
                {descriere}
              </p>
            ) : null}
          </div>
        ) : null}

        {hasStats ? (
          <div className={gridClass}>
            {statistici.map((stat, index) => (
              <StatCell key={index} stat={stat} className={cellClass} />
            ))}
          </div>
        ) : null}

        {hasPrimary || hasSecondary ? (
          <div className="mt-10 flex flex-wrap gap-4">
            {hasPrimary ? (
              <Link
                href={primaryCta.href}
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-semibold text-white transition-all hover:-translate-y-0.5 hover:opacity-90"
                style={{ background: "#162040" }}
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
    </section>
  );
}
