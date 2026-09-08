import { ExternalLink } from "lucide-react";
import type { EmbedData } from "./schema";

const ASPECT_CLASS: Record<EmbedData["raport"], string> = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
};

/**
 * "Embed" — an external URL shown in a responsive <iframe>, with an eyebrow
 * label and an "open in new tab" link for sites that block framing. Pure (no
 * hooks, no `"use client"`) so it renders on the public page unchanged once a
 * backend feeds it the same shape.
 */
export function Embed({ data }: { data: EmbedData }) {
  const { titlu, url, raport } = data;
  if (!url) return null;

  let host = "";
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    host = "";
  }

  return (
    <section>
      <div className="mx-auto max-w-3xl px-6 py-16">
        {titlu && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
            {titlu}
          </p>
        )}
        <div
          className={`overflow-hidden rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] ${ASPECT_CLASS[raport]}`}
        >
          <iframe
            src={url}
            title={titlu || host || "Conținut încorporat"}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            className="h-full w-full border-0"
          />
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563eb] hover:opacity-80"
        >
          <ExternalLink size={14} aria-hidden />
          {host ? `Deschide ${host}` : "Deschide într-o filă nouă"}
        </a>
      </div>
    </section>
  );
}
