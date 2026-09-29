import { getMediaUrl } from "@/lib/api/client";
import { LucideIcon } from "@/components/ui/icons/LucideIcon";
import {
  migrateProgramHeader,
  type ProgramHeaderData,
  type ProgramSupporter,
} from "./schema";
import { RichTextContent } from "../../rich-text/RichTextContent";

const NAVY_BG = "#1c1c81";
/** The supporter band sits on a tint, a touch bluer than `#f8fafc`. */
const SUPPORTER_BG = "#f8faff";
const BORDER = "#e2e8f0";

function SupporterLogo({ supporter }: { supporter: ProgramSupporter }) {
  const useImage = supporter.sursaIcon === "imagine" && supporter.imagine;

  return (
    // Logos are uploaded tightly cropped, so a modest height keeps the band
    // subordinate to the title and hero visual above it.
    <span className="flex h-10 shrink-0 items-center justify-center text-[#5656e5] md:h-12">
      {useImage && supporter.imagine ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={getMediaUrl(supporter.imagine.url)}
          alt={supporter.imagineAlt || supporter.nume}
          className="h-full w-auto max-w-[200px] object-contain md:max-w-[240px]"
        />
      ) : (
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white md:h-12 md:w-12"
          style={{ border: `1.5px solid ${BORDER}` }}
        >
          <LucideIcon value={supporter.icon} scope="program-header" size={20} className="md:h-6 md:w-6" />
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

  const useImage = sursaVizual === "imagine" && imagine;
  // All groups share one wrapping band; a group that doesn't fit beside the
  // previous one moves to the next line as a whole (see the band below).
  const groups = grupuri.filter((g) => g.sustinatori.length > 0);
  const hasStats = statistici.length > 0;

  return (
    <section
      className="bg-white pt-10 pb-0"
      style={{ borderBottom: `1px solid ${BORDER}` }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-8 pb-10 text-center md:flex-row-reverse md:items-center md:gap-12 md:text-left">
          {/* The visual is kept to under half the row so the whole header —
              title, supporters band and stats bar — fits in one laptop-height
              screen instead of pushing the supporters below the fold. */}
          <div className="w-full shrink-0 md:w-5/12">
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
                  <LucideIcon value={icon} scope="program-header" size={72} style={{ color: "#007d58" }} />
                </div>
              )}
            </div>
          </div>

          <div className="flex w-full min-w-0 flex-col items-center md:flex-1 md:items-start">
            {titlu ? (
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
            ) : null}

            <RichTextContent
              html={subtitlu}
              className="whitespace-pre-line text-[#5b6779] wrap-break-word"
              style={{
                fontSize: "1.0625rem",
                lineHeight: 1.7,
                maxWidth: "520px",
              }}
            />
          </div>
        </div>
      </div>

      {groups.length > 0 ? (
        <div style={{ background: SUPPORTER_BG, borderTop: `1px solid ${BORDER}` }}>
          <div className="mx-auto max-w-7xl px-6">
            <div
              // Each group is sized to its logos on one line; when the next
              // group can't fit beside it, the whole group wraps to the next
              // line instead of its logos wrapping. `max-w-full` on the group
              // caps it at the band width, so logos only wrap inside a group
              // that's wider than the viewport on its own (narrow screens).
              // Label sits above the logos until `lg`, where there's room
              // for it to sit beside them.
              className="flex flex-wrap items-start gap-x-16 gap-y-4 py-3 lg:items-center lg:py-3.5"
            >
              {groups.map((group, groupIndex) => (
                <div
                  key={groupIndex}
                  className="flex max-w-full flex-col gap-4 lg:flex-row lg:items-center lg:gap-8"
                >
                  {group.titlu ? (
                    <span className="text-xs font-semibold uppercase tracking-widest text-[#5b6779] wrap-break-word lg:shrink-0">
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
        </div>
      ) : null}

      {hasStats ? (
        <div style={{ background: NAVY_BG }}>
          <div className="mx-auto max-w-7xl px-6">
            {/* Equal halves on mobile so the stats line up in columns; on
                desktop they flow in a single row, with content trimmed to the logos'
                48px height so both bands share padding and height. */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-6 py-5 md:flex md:flex-wrap md:gap-x-12 lg:py-3.5">
              {statistici.map((stat, index) => (
                <div key={index} className="min-w-0 text-left">
                  <p className="font-heading text-2xl font-extrabold text-white wrap-break-word md:text-3xl lg:leading-7">
                    {stat.valoare}
                  </p>
                  <p className="mt-1 text-sm lg:mt-0.5 lg:leading-4.5 text-white/70 wrap-break-word">
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
