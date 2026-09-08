import Link from "next/link";
import { Quote as QuoteIcon } from "lucide-react";
import type { QuoteData } from "./schema";

const COLUMN_ALIGN: Record<QuoteData["aliniere"], string> = {
  stanga: "items-start text-left",
  centru: "items-center text-center",
  dreapta: "items-end text-right",
};

function isUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

/**
 * "Citat" — a pull quote with optional attribution and source. Two looks:
 * `simplu` (bare, larger type) and `evidentiat` (a soft mint card). Pure (no
 * hooks, no `"use client"`) so it renders on the public page unchanged once a
 * backend feeds it the same shape.
 */
export function Quote({ data }: { data: QuoteData }) {
  const { citat, autor, functie, organizatie, sursa, stil, aliniere } = data;
  const evidentiat = stil === "evidentiat";
  const meta = [functie, organizatie].filter(Boolean).join(", ");
  const hasCaption = Boolean(autor || meta || sursa);

  return (
    <section>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <figure
          className={`flex flex-col ${COLUMN_ALIGN[aliniere]} ${
            evidentiat
              ? "rounded-3xl border border-[#cfe6da] bg-[#eaf5ef] p-8 sm:p-10"
              : ""
          }`}
        >
          <QuoteIcon
            size={evidentiat ? 40 : 34}
            className="mb-4 shrink-0 text-[#2dbe8f]"
            fill="currentColor"
            strokeWidth={0}
            aria-hidden
          />

          <blockquote
            className="wrap-break-word text-[#334155]"
            style={{
              fontSize: evidentiat
                ? "0.9375rem"
                : "clamp(0.9375rem, 1.4vw, 1.0625rem)",
              lineHeight: 1.6,
              fontWeight: evidentiat ? 400 : 500,
            }}
          >
            {citat}
          </blockquote>

          {hasCaption ? (
            <figcaption className="mt-5">
              {autor ? (
                <span className="block font-semibold text-[#162040]">
                  {autor}
                </span>
              ) : null}
              {meta ? (
                <span className="block text-sm text-[#64748b]">{meta}</span>
              ) : null}
              {sursa ? (
                isUrl(sursa) ? (
                  <Link
                    href={sursa}
                    className="mt-1 inline-block text-xs text-[#94a3b8] underline underline-offset-2 hover:text-[#64748b]"
                  >
                    {sursa}
                  </Link>
                ) : (
                  <span className="mt-1 block text-xs text-[#94a3b8]">
                    {sursa}
                  </span>
                )
              ) : null}
            </figcaption>
          ) : null}
        </figure>
      </div>
    </section>
  );
}
