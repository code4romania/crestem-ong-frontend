import Link from "next/link";
import { ArrowLeft, FileText, Tag } from "lucide-react";
import type { ArticleHeaderData } from "./schema";

const NAVY_BG = "#162040";

/** Where the back link always goes. The library listing owns this route. */
const LIBRARY_PATH = "/biblioteca";

/**
 * "Articol Header" — the masthead of an article page: a back link to the
 * library, a badge, the category and date line, the title, and the tag list.
 *
 * Pure and synchronous, with no hooks and no `"use client"`, because
 * `registry.ts` makes this the same component on the public page and on the
 * builder's client canvas. Every field is authored in the editor, so there is
 * nothing to fetch and nothing to inject.
 */
export function ArticleHeader({ data }: { data: ArticleHeaderData }) {
  const { eticheta, categorie, data: dataText, titlu, etichete, background } = data;

  const isDark = background === "accent";
  const mutedColor = isDark ? "rgba(255,255,255,0.72)" : "#475569";

  const sectionStyle: React.CSSProperties =
    background === "accent"
      ? { background: NAVY_BG }
      : background === "light"
        ? { background: "#eefaf4" }
        : { background: "#ffffff" };

  const hasMeta = Boolean(eticheta || categorie || dataText);

  return (
    <section className="relative overflow-hidden" style={sectionStyle}>
      <div className="mx-auto flex w-full max-w-4xl flex-col px-6 py-16">
        <Link
          href={LIBRARY_PATH}
          className="mb-6 inline-flex w-fit items-center gap-2 text-sm transition-opacity hover:opacity-80"
          style={{ color: mutedColor }}
        >
          <ArrowLeft size={16} className="shrink-0" />
          Înapoi la Bibliotecă
        </Link>

        {hasMeta ? (
          <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2">
            {eticheta ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold wrap-break-word"
                style={{ background: "#ede9fe", color: "#7c3aed" }}
              >
                <FileText size={12} className="shrink-0" />
                {eticheta}
              </span>
            ) : null}
            {categorie || dataText ? (
              <p className="text-sm wrap-break-word" style={{ color: mutedColor }}>
                {categorie}
                {/* The separator belongs to the date, so it never dangles when
                    only one of the two is filled in. */}
                {categorie && dataText ? " · " : ""}
                {dataText}
              </p>
            ) : null}
          </div>
        ) : null}

        <h1
          className="font-heading wrap-break-word max-w-full"
          style={{
            fontSize: "clamp(2rem, 4.5vw, 3.25rem)",
            fontWeight: 800,
            lineHeight: 1.12,
            color: isDark ? "#ffffff" : "#162040",
          }}
        >
          {titlu}
        </h1>

        {etichete.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {etichete.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs wrap-break-word"
                style={
                  isDark
                    ? { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.72)" }
                    : { background: "#f1f5f9", color: "#475569" }
                }
              >
                <Tag size={11} className="shrink-0" />#{tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
