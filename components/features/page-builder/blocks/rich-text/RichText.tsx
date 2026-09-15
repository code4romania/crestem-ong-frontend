import { RICH_TEXT_PROSE } from "../../rich-text/prose";
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
 * `continut` arrives sanitised: the page/article Server Actions run
 * `sanitizeBlocks` before it ever reaches the backend. Sanitising here too would
 * drag DOMPurify — and with it jsdom — into the client bundle, since the editor
 * imports this renderer through the block registry.
 */
export function RichText({ data }: { data: RichTextData }) {
  const { titlu, continut, aliniere } = data;

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
