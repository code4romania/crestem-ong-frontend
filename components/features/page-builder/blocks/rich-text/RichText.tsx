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
      {/* Copy that ends on a heading is introducing the block below it, so drop
          the bottom padding and let that block sit under its heading rather
          than a full section gap away. Not when nothing follows (the footer
          does). */}
      <div className="mx-auto max-w-4xl px-6 py-8 [section:not(:last-child)>&:has(>div>:is(h2,h3,h4):last-child)]:pb-0 [section:not(:last-child)>&:has(>div>:is(h2,h3,h4)+p:empty:last-child)]:pb-0">
        {titlu ? (
          <h2
            className={`mb-6 font-heading wrap-break-word ${ALIGN_CLASS[aliniere]}`}
            style={{
              fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
              fontWeight: 800,
              lineHeight: 1.2,
              color: "#1c1c81",
            }}
          >
            {titlu}
          </h2>
        ) : null}

        {/* A stray empty paragraph (an extra Enter in the editor) only adds
            margin, which stacks onto the gap before the next block — so drop
            it, and the bottom margin of whatever is really last. Kept out of
            the shared prose classes: in the editor that empty line is where
            the caret sits. */}
        <div
          className={`${RICH_TEXT_PROSE} ${ALIGN_CLASS[aliniere]} wrap-break-word [&>p:empty]:hidden [&>:last-child]:mb-0 [&>:has(+p:empty:last-child)]:mb-0`}
          dangerouslySetInnerHTML={{ __html: continut }}
        />
      </div>
    </section>
  );
}
