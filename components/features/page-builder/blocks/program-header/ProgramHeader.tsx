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
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden text-[#2563eb]">
        {useImage && supporter.imagine ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={getMediaUrl(supporter.imagine.url)}
            alt={supporter.imagineAlt || supporter.nume}
            className="h-full w-full object-contain"
          />
        ) : (
          <Icon size={26} aria-hidden />
        )}
      </span>
      <span className="min-w-0 text-xs font-bold leading-tight text-[#162040] wrap-break-word">
        {supporter.nume}
      </span>
    </div>
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
        <div className="flex flex-col items-center pb-14 text-center">
          <div
            className="mb-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl bg-white"
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
                className="h-full w-full object-contain"
              />
            ) : (
              <Icon size={40} style={{ color: "#2dbe8f" }} aria-hidden />
            )}
          </div>

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

      {hasSupporters ? (
        <div style={{ background: SUPPORTER_BG, borderTop: `1px solid ${BORDER}` }}>
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-6 py-4">
            {sustinutDeTitlu ? (
              <span className="text-xs font-semibold uppercase tracking-widest text-[#94a3b8]">
                {sustinutDeTitlu}
              </span>
            ) : null}
            <div className="flex flex-wrap items-center gap-8">
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
