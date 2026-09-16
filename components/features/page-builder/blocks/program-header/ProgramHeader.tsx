import { getMediaUrl } from "@/lib/api/client";
import { PROGRAM_HEADER_ICONS } from "./icons";
import type { ProgramHeaderData, ProgramSupporter } from "./schema";

const NAVY_BG = "#162040";
/** The supporter band sits on a tint, a touch bluer than `#f8fafc`. */
const SUPPORTER_BG = "#f8faff";
const BORDER = "#e2e8f0";

function SupporterLogo({ supporter }: { supporter: ProgramSupporter }) {
  const Icon = PROGRAM_HEADER_ICONS[supporter.icon];
  const useImage = supporter.sursaIcon === "imagine" && supporter.imagine;

  return (
    <span className="flex h-16 shrink-0 items-center justify-center text-[#2563eb]">
      {useImage && supporter.imagine ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={getMediaUrl(supporter.imagine.url)}
          alt={supporter.imagineAlt || supporter.nume}
          className="h-full w-auto object-contain"
        />
      ) : (
        <span
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white"
          style={{ border: `1.5px solid ${BORDER}` }}
        >
          <Icon size={32} aria-hidden />
        </span>
      )}
    </span>
  );
}

/**
 * "Program Header" — the top of a programme page: its logo mark, title and
 * tagline on white, then the supporters band, then the dark stats bar. Content
 * is snapshotted from the picked programme in the editor, so this renderer is
 * pure (no hooks, no `"use client"`) and works for a signed-out visitor.
 */
export function ProgramHeader({ data }: { data: ProgramHeaderData }) {
  const {
    sursaVizual,
    icon,
    imagine,
    imagineAlt,
    titlu,
    subtitlu,
    sustinutDeTitlu,
    sustinatori,
    statistici,
  } = data;

  const Icon = PROGRAM_HEADER_ICONS[icon];
  const useImage = sursaVizual === "imagine" && imagine;
  const hasSupporters = sustinatori.length > 0;
  const hasStats = statistici.length > 0;

  return (
    <section
      className="bg-white pt-14 pb-0"
      style={{ borderBottom: `1px solid ${BORDER}` }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-8 pb-14 text-center md:flex-row-reverse md:items-center md:justify-between md:text-left">
          <div className="flex w-full shrink-0 justify-center md:w-1/2 md:justify-center">
            <div
              className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-3xl bg-white md:h-48 md:w-48"
              style={{
                boxShadow: "0 4px 24px rgba(22,32,64,0.10)",
                border: `1.5px solid ${BORDER}`,
              }}
            >
              {useImage && imagine ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={getMediaUrl(imagine.url)}
                  alt={imagineAlt || titlu}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Icon size={56} style={{ color: "#2dbe8f" }} aria-hidden />
              )}
            </div>
          </div>

          <div className="flex w-full flex-col items-center md:w-1/2 md:items-start">
            <h1
              className="mb-3 font-heading text-[#162040] wrap-break-word"
              style={{
                fontSize: "clamp(2rem, 5vw, 3rem)",
                fontWeight: 800,
                lineHeight: 1.15,
                maxWidth: "640px",
              }}
            >
              {titlu}
            </h1>

            {subtitlu ? (
              <p
                className="text-[#64748b] wrap-break-word"
                style={{
                  fontSize: "1.0625rem",
                  lineHeight: 1.7,
                  maxWidth: "520px",
                }}
              >
                {subtitlu}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {hasSupporters ? (
        <div style={{ background: SUPPORTER_BG, borderTop: `1px solid ${BORDER}` }}>
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-8 px-6 py-6">
            {sustinutDeTitlu ? (
              <span className="text-xs font-semibold uppercase tracking-widest text-[#94a3b8]">
                {sustinutDeTitlu}
              </span>
            ) : null}
            <div className="flex flex-wrap items-center gap-10">
              {sustinatori.map((supporter, index) => (
                <SupporterLogo key={index} supporter={supporter} />
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {hasStats ? (
        <div style={{ background: NAVY_BG }}>
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-wrap gap-10 py-5">
              {statistici.map((stat, index) => (
                <div key={index} className="min-w-0 text-left">
                  <p className="font-heading text-xl font-extrabold text-white wrap-break-word">
                    {stat.valoare}
                  </p>
                  <p className="mt-1 text-xs text-white/45 wrap-break-word">
                    {stat.eticheta}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
