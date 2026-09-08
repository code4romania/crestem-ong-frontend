import type { NumberedProcessData } from "./schema";

/**
 * "Structure – Numbered Process" — an optional heading over a vertical list of
 * numbered steps, each a bold title plus optional body text. Pure (no hooks, no
 * `"use client"`) so it renders on the public page unchanged once a backend
 * feeds it the same data shape.
 */
export function NumberedProcess({ data }: { data: NumberedProcessData }) {
  const { titlu, pasi } = data;

  return (
    <section>
      <div className="mx-auto max-w-3xl px-6 py-16">
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

        {pasi.length > 0 ? (
          <ol className="space-y-8">
            {pasi.map((pas, index) => (
              <li key={index} className="relative flex gap-4">
                {index < pasi.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-4 top-0 -bottom-8 w-px -translate-x-1/2 bg-border"
                  />
                ) : null}
                <span
                  aria-hidden="true"
                  className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: "#162040" }}
                >
                  {index + 1}
                </span>
                <div className="pt-0.5">
                  <p className="font-semibold text-[#162040] wrap-break-word">
                    <span className="sr-only">Pasul {index + 1}: </span>
                    {pas.titlu}
                  </p>
                  {pas.text ? (
                    <p className="mt-1.5 text-sm text-[#475569] wrap-break-word">
                      {pas.text}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    </section>
  );
}
