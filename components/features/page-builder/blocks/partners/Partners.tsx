import { getMediaUrl } from "@/lib/api/client";
import { FEATURE_ICONS } from "../feature-cards/icons";
import type { Partner, PartnersData } from "./schema";

const COL_CLASS: Record<PartnersData["coloane"], string> = {
  "1": "sm:grid-cols-1 lg:grid-cols-1",
  "2": "sm:grid-cols-2 lg:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
  "5": "sm:grid-cols-3 lg:grid-cols-5",
  "6": "sm:grid-cols-3 lg:grid-cols-6",
};

function PartnerCard({ partner }: { partner: Partner }) {
  const Icon = FEATURE_ICONS[partner.icon];

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm">
      {partner.iconImage ? (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getMediaUrl(partner.iconImage.url)}
            alt=""
            className="h-full w-full object-contain"
          />
        </span>
      ) : (
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ background: "rgba(45,190,143,0.12)", color: "#2dbe8f" }}
        >
          <Icon size={20} />
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-[#162040]">
          {partner.nume}
        </p>
        {partner.subtitlu ? (
          <p className="truncate text-xs text-[#475569]">{partner.subtitlu}</p>
        ) : null}
      </div>
    </div>
  );
}

/**
 * "Parteneri" — an optional small-caps section heading over a responsive grid of
 * partner cards, each a logo/icon chip beside a name and optional subtitle.
 * Pure (no hooks, no `"use client"`) so it renders unchanged on the public page.
 */
export function Partners({ data }: { data: PartnersData }) {
  const { titluSectiune, subtitluSectiune, coloane, parteneri } = data;

  return (
    <section className="relative overflow-hidden bg-[#f5f7fb]">
      <div className="relative mx-auto max-w-7xl px-6 py-16">
        {titluSectiune || subtitluSectiune ? (
          <div className="mx-auto mb-10 max-w-2xl text-center">
            {titluSectiune ? (
              <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#64748b] wrap-break-word">
                {titluSectiune}
              </p>
            ) : null}
            {subtitluSectiune ? (
              <p className="mt-2 text-base leading-relaxed text-[#475569] wrap-break-word">
                {subtitluSectiune}
              </p>
            ) : null}
          </div>
        ) : null}

        {parteneri.length > 0 ? (
          <div className={`grid grid-cols-2 gap-4 ${COL_CLASS[coloane]}`}>
            {parteneri.map((partner, index) => (
              <PartnerCard key={index} partner={partner} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
