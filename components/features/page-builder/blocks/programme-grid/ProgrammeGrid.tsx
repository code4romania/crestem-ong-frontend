import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import { getMediaUrl } from "@/lib/api/client";
import { PROGRAMME_ICONS } from "./icons";
import type { Program, ProgrammeGridData } from "./schema";

const COL_CLASS: Record<ProgrammeGridData["coloane"], string> = {
  "1": "sm:grid-cols-1 lg:grid-cols-1",
  "2": "sm:grid-cols-2 lg:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};

function ProgramCard({ program }: { program: Program }) {
  const Icon = PROGRAMME_ICONS[program.icon];
  const hasCta = Boolean(program.href && program.ctaLabel);

  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-border">
      {program.imagine ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={getMediaUrl(program.imagine.url)}
          alt={program.imagineAlt || program.titlu}
          className="block h-44 w-full object-cover"
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col p-6">
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "rgba(45,190,143,0.12)", color: "#2dbe8f" }}
          >
            <Icon size={18} />
          </span>
          <h3 className="min-w-0 text-lg font-semibold text-[#162040] wrap-break-word">
            {program.titlu}
          </h3>
        </div>

        {program.subtitlu ? (
          <p className="mt-1 text-sm text-[#475569] wrap-break-word">
            {program.subtitlu}
          </p>
        ) : null}

        {program.descriere ? (
          <p className="mt-3 text-sm leading-relaxed text-[#475569] wrap-break-word line-clamp-3">
            {program.descriere}
          </p>
        ) : null}

        {program.perioada || hasCta ? (
          <div className="mt-auto flex flex-col gap-4 pt-4">
            {program.perioada ? (
              <p className="flex items-center gap-1.5 text-xs text-[#64748b] wrap-break-word">
                <Calendar size={14} className="shrink-0" />
                Perioadă: {program.perioada}
              </p>
            ) : null}

            {hasCta ? (
              <Link
                href={program.href}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 wrap-break-word"
                style={{ background: "#162040" }}
              >
                {program.ctaLabel} <ChevronRight size={16} className="shrink-0" />
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * "Programme Grid" — a titled section with a responsive grid of authored
 * programme cards (image, icon, title, subtitle, description, period, CTA).
 * Content is hand-entered in the editor; the app's real `Program` entity
 * carries none of these display fields. Pure (no hooks, no `"use client"`) so it
 * can render on the public page unchanged.
 */
export function ProgrammeGrid({ data }: { data: ProgrammeGridData }) {
  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-6 py-20">
        {data.titlu ? (
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2
              className="font-heading wrap-break-word"
              style={{
                fontSize: "clamp(2rem, 4vw, 2.75rem)",
                fontWeight: 800,
                lineHeight: 1.15,
                color: "#162040",
              }}
            >
              {data.titlu}
            </h2>
          </div>
        ) : null}

        {data.programe.length > 0 ? (
          <div className={`grid grid-cols-1 gap-6 ${COL_CLASS[data.coloane]}`}>
            {data.programe.map((program, index) => (
              <ProgramCard key={index} program={program} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border-2 border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
            Niciun program de afișat.
          </p>
        )}
      </div>
    </section>
  );
}
