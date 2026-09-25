import { getMediaUrl } from "@/lib/api/client";
import { PROGRAM_HEADER_ICONS } from "./icons";
import {
  migrateProgramHeader,
  type ProgramHeaderData,
  type ProgramSupporter,
} from "./schema";

const NAVY_BG = "#1c1c81";
/** The supporter band sits on a tint, a touch bluer than `#f8fafc`. */
const SUPPORTER_BG = "#f8faff";
const BORDER = "#e2e8f0";

function SupporterLogo({ supporter }: { supporter: ProgramSupporter }) {
  const Icon = PROGRAM_HEADER_ICONS[supporter.icon];
  const useImage = supporter.sursaIcon === "imagine" && supporter.imagine;

  return (
    <span className="flex h-20 shrink-0 items-center justify-center text-[#5656e5] md:h-24">
      {useImage && supporter.imagine ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={getMediaUrl(supporter.imagine.url)}
          alt={supporter.imagineAlt || supporter.nume}
          className="h-full w-auto max-w-[280px] object-contain"
        />
      ) : (
        <span
          className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white md:h-24 md:w-24"
          style={{ border: `1.5px solid ${BORDER}` }}
        >
          <Icon size={40} className="md:h-12 md:w-12" aria-hidden />
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
 *
 * The builder canvas passes raw stored data, so blocks saved before supporter
 * groups existed are migrated here as well as in the schema.
 */
export function ProgramHeader({ data }: { data: ProgramHeaderData }) {
  const {
    sursaVizual,
    icon,
    imagine,
    imagineAlt,
    titlu,
    subtitlu,
    grupuri,
    statistici,
  } = migrateProgramHeader(data) as ProgramHeaderData;

  const Icon = PROGRAM_HEADER_ICONS[icon];
  const useImage = sursaVizual === "imagine" && imagine;
  const groups = grupuri.filter((g) => g.sustinatori.length > 0);
  const hasStats = statistici.length > 0;

  return (
    <section
      className="bg-white pt-14 pb-0"
      style={{ borderBottom: `1px solid ${BORDER}` }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-8 pb-14 text-center md:flex-row-reverse md:items-center md:gap-12 md:text-left">
          {/* The visual takes the larger share on desktop so the title column
              doesn't leave a wide empty band on the left. */}
          <div className="w-full shrink-0 md:w-1/2 lg:w-7/12">
            <div
              className="relative aspect-[3/2] w-full overflow-hidden rounded-3xl bg-white"
              style={{
                boxShadow: "0 4px 24px rgba(28,28,129,0.10)",
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
                <div className="flex h-full w-full items-center justify-center">
                  <Icon size={72} style={{ color: "#007d58" }} aria-hidden />
                </div>
              )}
            </div>
          </div>

          <div className="flex w-full min-w-0 flex-col items-center md:flex-1 md:items-start">
            <h1
              className="mb-3 font-heading text-[#1c1c81] wrap-break-word"
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
                className="text-[#5b6779] wrap-break-word"
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

      {groups.length > 0 ? (
        <div style={{ background: SUPPORTER_BG, borderTop: `1px solid ${BORDER}` }}>
          <div className="mx-auto max-w-7xl px-6">
            {groups.map((group, groupIndex) => (
              <div
                key={groupIndex}
                className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:gap-8"
                style={
                  groupIndex > 0 ? { borderTop: `1px solid ${BORDER}` } : undefined
                }
              >
                {group.titlu ? (
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#5b6779] wrap-break-word md:w-48 md:shrink-0">
                    {group.titlu}
                  </span>
                ) : null}
                <div className="flex flex-wrap items-center gap-10">
                  {group.sustinatori.map((supporter, index) => (
                    <SupporterLogo key={index} supporter={supporter} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {hasStats ? (
        <div style={{ background: NAVY_BG }}>
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-wrap gap-x-12 gap-y-6 py-6">
              {statistici.map((stat, index) => (
                <div key={index} className="min-w-0 text-left">
                  <p className="font-heading text-2xl font-extrabold text-white wrap-break-word md:text-3xl">
                    {stat.valoare}
                  </p>
                  <p className="mt-1 text-sm text-white/70 wrap-break-word">
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
