import { FaqAccordion } from "./FaqAccordion";
import type { FaqCollectionData } from "./schema";

/**
 * "FAQ Collection" — a titled section rendering its question/answer pairs as an
 * accordion. Server component; the interactive accordion is a `"use client"`
 * child.
 */
export function FaqCollection({ data }: { data: FaqCollectionData }) {
  const { titlu, primaDeschisa, intrebari } = data;

  return (
    <section>
      <div className="mx-auto max-w-7xl px-6 py-20">
        {titlu ? (
          <h2
            className="mx-auto mb-12 max-w-2xl text-center font-heading wrap-break-word"
            style={{
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              color: "#162040",
            }}
          >
            {titlu}
          </h2>
        ) : null}

        {intrebari.length === 0 ? (
          <p className="mx-auto max-w-3xl rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-[#94a3b8]">
            Nicio întrebare de afișat.
          </p>
        ) : (
          <FaqAccordion items={intrebari} primaDeschisa={primaDeschisa} />
        )}
      </div>
    </section>
  );
}
