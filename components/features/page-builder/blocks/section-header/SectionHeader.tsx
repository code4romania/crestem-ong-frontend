import type { SectionHeaderData } from "./schema";

/** Full literal classes so the Tailwind scanner picks them up. */
const ALIGN_CLASS: Record<SectionHeaderData["aliniere"], string> = {
  stanga: "text-left",
  centru: "text-center",
  dreapta: "text-right",
};

/**
 * "Structure – Section Header" — a section title with an optional subtitle,
 * aligned left, centered or right. Pure (no hooks, no `"use client"`) so it
 * renders on the public page unchanged once a backend feeds it the same data
 * shape. Renders nothing when the title is empty.
 */
export function SectionHeader({ data }: { data: SectionHeaderData }) {
  const { titlu, subtitlu, aliniere } = data;

  if (!titlu) return null;

  return (
    <section>
      <div className={`mx-auto max-w-3xl px-6 py-16 ${ALIGN_CLASS[aliniere]}`}>
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
        {subtitlu ? (
          <p className="mt-4 text-lg text-[#475569] wrap-break-word">
            {subtitlu}
          </p>
        ) : null}
      </div>
    </section>
  );
}
