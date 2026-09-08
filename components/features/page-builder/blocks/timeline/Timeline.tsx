import type { TimelineData, TimelineStage } from "./schema";

/** The număr/perioadă → titlu → text block, shared by both orientations. */
function StageBody({ etapa }: { etapa: TimelineStage }) {
  return (
    <div>
      {etapa.numar ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-[#2dbe8f] wrap-break-word">
          {etapa.numar}
        </p>
      ) : null}
      <p className="mt-1 font-semibold text-[#162040] wrap-break-word">
        {etapa.titlu}
      </p>
      {etapa.text ? (
        <p className="mt-1.5 text-sm text-[#475569] wrap-break-word">
          {etapa.text}
        </p>
      ) : null}
    </div>
  );
}

/** Stacked layout: a continuous rail down the left, a navy dot per stage. */
function VerticalTimeline({ etape }: { etape: TimelineStage[] }) {
  return (
    <ol className="space-y-8">
      {etape.map((etapa, index) => (
        <li key={index} className="relative flex gap-4">
          {index < etape.length - 1 ? (
            <span
              aria-hidden="true"
              className="absolute left-[5px] top-3 -bottom-8 w-px -translate-x-1/2 bg-border"
            />
          ) : null}
          <span
            aria-hidden="true"
            className="relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: "#162040" }}
          />
          <StageBody etapa={etapa} />
        </li>
      ))}
    </ol>
  );
}

/** Row layout: a rail across the top, a navy dot per stage, content below. */
function HorizontalTimeline({ etape }: { etape: TimelineStage[] }) {
  return (
    <ol className="flex gap-6">
      {etape.map((etapa, index) => (
        <li key={index} className="relative flex-1 pt-6">
          {index < etape.length - 1 ? (
            <span
              aria-hidden="true"
              className="absolute left-[5px] -right-6 top-[5px] h-px bg-border"
            />
          ) : null}
          <span
            aria-hidden="true"
            className="absolute left-0 top-0 z-10 h-2.5 w-2.5 rounded-full"
            style={{ background: "#162040" }}
          />
          <StageBody etapa={etapa} />
        </li>
      ))}
    </ol>
  );
}

/**
 * "Structure – Timeline" — an optional heading over a vertical or horizontal
 * timeline. Each stage sits on a rail with a navy dot marker; content shows an
 * optional număr/perioadă label, a bold title and optional body text. The
 * horizontal orientation collapses to the vertical layout below `md`. Pure (no
 * hooks, no `"use client"`) so it renders on the public page unchanged once a
 * backend feeds it the same data shape.
 */
export function Timeline({ data }: { data: TimelineData }) {
  const { titlu, orientatie, etape } = data;
  const isHorizontal = orientatie === "orizontal";

  return (
    <section>
      <div
        className={
          isHorizontal
            ? "mx-auto max-w-5xl px-6 py-16"
            : "mx-auto max-w-3xl px-6 py-16"
        }
      >
        {titlu ? (
          <h2
            className="font-heading mb-10 wrap-break-word"
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

        {etape.length > 0 ? (
          isHorizontal ? (
            <>
              <div className="hidden md:block">
                <HorizontalTimeline etape={etape} />
              </div>
              <div className="md:hidden">
                <VerticalTimeline etape={etape} />
              </div>
            </>
          ) : (
            <VerticalTimeline etape={etape} />
          )
        ) : null}
      </div>
    </section>
  );
}
