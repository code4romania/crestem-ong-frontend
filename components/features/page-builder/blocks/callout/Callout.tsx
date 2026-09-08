import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { RICH_TEXT_PROSE_INVERSE } from "../../rich-text/prose";
import { sanitizeRichText, hasRichText } from "../../rich-text/sanitize";
import { CALLOUT_ICONS } from "./icons";
import type { CalloutData } from "./schema";

const NAVY_BG = "#162040";

const COLUMN_ALIGN: Record<CalloutData["aliniere"], string> = {
  stanga: "items-start text-left",
  centru: "items-center text-center",
  dreapta: "items-end text-right",
};

const CTA_JUSTIFY: Record<CalloutData["aliniere"], string> = {
  stanga: "justify-start",
  centru: "justify-center",
  dreapta: "justify-end",
};

/**
 * "Callout" — an attention card on a navy background: an optional icon, an
 * optional headline, a body of formatted copy and up to two CTAs. Pure (no
 * hooks, no `"use client"`) so it renders on the public page unchanged once a
 * backend feeds it the same shape.
 *
 * `text` is sanitised again here, right before the raw-HTML sink, in case the
 * data reached this component without passing through the block schema.
 */
export function Callout({ data }: { data: CalloutData }) {
  const { icon, afiseazaIcon, titlu, primaryCta, secondaryCta, aliniere } = data;
  const text = sanitizeRichText(data.text);

  const Icon = CALLOUT_ICONS[icon];
  const showIcon = afiseazaIcon && Boolean(Icon);
  const hasPrimary = Boolean(primaryCta.label && primaryCta.href);
  const hasSecondary = Boolean(secondaryCta.label && secondaryCta.href);

  return (
    <section>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div
          className="relative overflow-hidden rounded-3xl px-8 py-14 shadow-xl sm:px-14"
          style={{ background: NAVY_BG }}
        >
          <div className={`relative flex flex-col ${COLUMN_ALIGN[aliniere]}`}>
            {showIcon ? (
              <span className="mb-6 inline-flex rounded-2xl bg-white/10 p-3.5 text-[#2dbe8f]">
                <Icon size={32} aria-hidden />
              </span>
            ) : null}

            {titlu ? (
              <h2
                className="mb-4 font-heading wrap-break-word max-w-full"
                style={{
                  fontSize: "clamp(1.875rem, 4vw, 2.75rem)",
                  fontWeight: 800,
                  lineHeight: 1.15,
                  color: "#ffffff",
                }}
              >
                {titlu}
              </h2>
            ) : null}

            {hasRichText(text) ? (
              <div
                className={`${RICH_TEXT_PROSE_INVERSE} wrap-break-word max-w-2xl`}
                dangerouslySetInnerHTML={{ __html: text }}
              />
            ) : null}

            {hasPrimary || hasSecondary ? (
              <div
                className={`mt-8 flex flex-wrap gap-4 ${CTA_JUSTIFY[aliniere]}`}
              >
                {hasPrimary ? (
                  <Link
                    href={primaryCta.href}
                    className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-semibold text-white transition-all hover:-translate-y-0.5 hover:opacity-90"
                    style={{
                      background: "#2dbe8f",
                      boxShadow: "0 4px 24px rgba(45,190,143,0.35)",
                    }}
                  >
                    {primaryCta.label} <ArrowRight size={18} />
                  </Link>
                ) : null}
                {hasSecondary ? (
                  <Link
                    href={secondaryCta.href}
                    className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-semibold transition-all hover:bg-white/10"
                    style={{
                      color: "rgba(255,255,255,0.85)",
                      border: "1.5px solid rgba(255,255,255,0.2)",
                    }}
                  >
                    {secondaryCta.label} <ChevronRight size={18} />
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
