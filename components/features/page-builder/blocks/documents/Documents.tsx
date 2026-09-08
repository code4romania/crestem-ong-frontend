import { Download } from "lucide-react";
import { getMediaUrl } from "@/lib/api/client";
import { DownloadAllButton } from "./DownloadAllButton";
import { badgeTone, extLabel, formatSize } from "./helpers";
import type { DocumentsData } from "./schema";

/**
 * "Documente" — a dark-headed card listing downloadable files (PDF, DOCX, …),
 * each with a type badge and size. The header carries an optional title,
 * subtitle and a "Descarcă toate" button. Only that button is interactive
 * (`DownloadAllButton`); the rest is pure so it renders on the public page
 * unchanged once a backend feeds it the same shape.
 */
export function Documents({ data }: { data: DocumentsData }) {
  const { titlu, subtitlu, documente } = data;
  if (documente.length === 0) return null;

  return (
    <section>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#162040] px-5 py-4 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2dbe8f]/25">
                <Download size={18} aria-hidden />
              </span>
              <div className="min-w-0">
                {titlu && (
                  <p className="truncate font-semibold">{titlu}</p>
                )}
                {subtitlu && (
                  <p className="truncate text-sm text-white/60">{subtitlu}</p>
                )}
              </div>
            </div>
            <DownloadAllButton
              files={documente.map((d) => ({ url: d.url, name: d.name }))}
              zipName={titlu}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#2dbe8f] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#24a67d]"
            />
          </div>

          <ul className="divide-y divide-[#f1f5f9]">
            {documente.map((doc, i) => {
              const label = extLabel(doc.ext, doc.url);
              const size = formatSize(doc.size);
              const meta = [label, size].filter(Boolean).join(" · ");
              return (
                <li key={`${doc.url}-${i}`}>
                  <a
                    href={getMediaUrl(doc.url)}
                    download={doc.name || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[#f8fafc]"
                  >
                    <span
                      className={`flex h-9 w-11 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white ${badgeTone(
                        label,
                      )}`}
                    >
                      {label || "FILE"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-[#162040]">
                        {doc.name || "Document"}
                      </span>
                      {meta && (
                        <span className="block text-xs text-[#94a3b8]">
                          {meta}
                        </span>
                      )}
                    </span>
                    <Download
                      size={16}
                      className="shrink-0 text-[#94a3b8]"
                      aria-hidden
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
