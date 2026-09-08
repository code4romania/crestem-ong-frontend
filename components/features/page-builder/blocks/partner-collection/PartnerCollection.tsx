import { getMediaUrl } from "@/lib/api/client";
import { PARTNER_ICONS } from "./icons";
import type { Partner, PartnerCollectionData } from "./schema";

/**
 * The band sits on a tint rather than page white, so the white partner cards
 * read as cards. Measured off the design; a touch bluer than the `#f8fafc`
 * used for inset surfaces elsewhere.
 */
const SECTION_BG = "#f8faff";

const COL_CLASS: Record<PartnerCollectionData["coloane"], string> = {
  "1": "sm:grid-cols-1 lg:grid-cols-1",
  "2": "sm:grid-cols-2 lg:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
  "5": "sm:grid-cols-3 lg:grid-cols-5",
  "6": "sm:grid-cols-3 lg:grid-cols-6",
};

function PartnerCard({ partner }: { partner: Partner }) {
  const Icon = PARTNER_ICONS[partner.icon];
  const useImage = partner.sursaIcon === "imagine" && partner.imagine;

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-border">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden text-[#2563eb]">
        {useImage && partner.imagine ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={getMediaUrl(partner.imagine.url)}
            alt={partner.imagineAlt || partner.nume}
            className="h-full w-full object-contain"
          />
        ) : (
          <Icon size={28} aria-hidden />
        )}
      </span>

      <span className="flex min-w-0 flex-col">
        <span className="text-xs font-bold uppercase leading-tight tracking-wide text-[#162040] wrap-break-word">
          {partner.nume}
        </span>
        {partner.subtitlu ? (
          <span className="mt-0.5 text-[11px] leading-tight text-[#94a3b8] wrap-break-word">
            {partner.subtitlu}
          </span>
        ) : null}
      </span>
    </div>
  );
}

/**
 * "Partner Collection" — a quiet band of partner/funder cards under a small
 * uppercase eyebrow, each card an icon (from the fixed palette or an uploaded
 * logo) next to a name and optional subtitle. Content is hand-entered in the
 * editor. Pure (no hooks, no `"use client"`) so it renders on the public page
 * unchanged.
 */
export function PartnerCollection({ data }: { data: PartnerCollectionData }) {
  const hasHeader = Boolean(data.titlu || data.subtitlu);

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: SECTION_BG }}
    >
      <div className="relative mx-auto max-w-7xl px-6 py-16">
        {hasHeader ? (
          <div className="mx-auto mb-11 max-w-2xl text-center">
            {data.titlu ? (
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#64748b] wrap-break-word">
                {data.titlu}
              </p>
            ) : null}
            {data.subtitlu ? (
              <p className="mt-2 text-sm text-[#94a3b8] wrap-break-word">
                {data.subtitlu}
              </p>
            ) : null}
          </div>
        ) : null}

        {data.parteneri.length > 0 ? (
          <div className={`grid grid-cols-1 gap-7 ${COL_CLASS[data.coloane]}`}>
            {data.parteneri.map((partner, index) => (
              <PartnerCard key={index} partner={partner} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border-2 border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
            Niciun partener de afișat.
          </p>
        )}
      </div>
    </section>
  );
}
