import { RICH_TEXT_PROSE } from "../../rich-text/prose";
import { sanitizeRichText } from "../../rich-text/sanitize";
import type { RichTextData } from "./schema";

const ALIGN_CLASS: Record<RichTextData["aliniere"], string> = {
  stanga: "text-left",
  centru: "text-center",
  dreapta: "text-right",
};

/**
 * "Rich Text" — an optional heading over a body of formatted copy, in a single
 * readable column. Pure (no hooks, no `"use client"`) so it renders on the
 * public page unchanged once a backend feeds it the same shape.
 *
 * `continut` is sanitised again here, right before the raw-HTML sink, in case
 * the data reached this component without passing through the block schema.
 */
export function RichText({ data }: { data: RichTextData }) {
  const { titlu, aliniere } = data;
  const continut = sanitizeRichText(data.continut);

  return (
    <section>
      <div className="mx-auto max-w-3xl px-6 py-16">
        {titlu ? (
          <h2
            className={`mb-6 font-heading wrap-break-word ${ALIGN_CLASS[aliniere]}`}
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

        <div
          className={`${RICH_TEXT_PROSE} ${ALIGN_CLASS[aliniere]} wrap-break-word`}
          dangerouslySetInnerHTML={{ __html: continut }}
        />
      </div>
    </section>
  );
}
