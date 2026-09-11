"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { getMediaUrl } from "@/lib/api/client";
import { userDisplayName } from "@/lib/api/auth";
import type { Dimension } from "@/lib/api/dimensions";
import type { MentorProfile } from "@/lib/api/mentor-profile";
import { EditMentorProfileModal } from "./EditMentorProfileModal";
import { hasRichText, sanitizeRichText } from "@/components/features/page-builder/rich-text/sanitize";
import { RICH_TEXT_PROSE } from "@/components/features/page-builder/rich-text/prose";

function formatJoinDate(iso: string) {
  return new Intl.DateTimeFormat("ro-RO", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}

export function MentorProfileDetailsCard({
  profile,
  dimensions,
}: {
  profile: MentorProfile;
  dimensions: Dimension[];
}) {
  const [editing, setEditing] = useState(false);
  const dimensionNames = dimensions.filter((d) => profile.dimensiuni.includes(d.key));

  const nume = userDisplayName(profile);
  const initials = nume
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-white rounded-xl border border-border p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div className="flex items-center gap-4">
          {profile.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={getMediaUrl(profile.avatar.url)}
              alt="Poză de profil"
              className="w-14 h-14 rounded-full object-cover border border-border shrink-0"
            />
          ) : (
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0"
              style={{ background: "#2dbe8f" }}
            >
              {initials}
            </div>
          )}
          <div>
            <p className="font-heading font-bold text-lg" style={{ color: "#162040" }}>
              {nume}
            </p>
            <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>
              {profile.email}
            </p>
            {profile.createdAt && (
              <p className="text-xs mt-1 text-muted-foreground">
                Membru din{" "}
                <span className="font-semibold" style={{ color: "#162040" }}>
                  {formatJoinDate(profile.createdAt)}
                </span>
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors"
          style={{ color: "#162040" }}
        >
          <Pencil size={14} />
          Editează profilul
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Bio</p>
          {profile.bio && hasRichText(profile.bio) ? (
            <div
              className={RICH_TEXT_PROSE}
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(profile.bio) }}
            />
          ) : (
            <p className="text-sm" style={{ color: "#334155" }}>
              Nicio descriere adăugată încă.
            </p>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
            Specializare pe dimensiuni
          </p>
          {dimensionNames.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {dimensionNames.map((d) => (
                <span
                  key={d.key}
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: "#2dbe8f1a", color: "#0f7a5b" }}
                >
                  {d.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nicio dimensiune selectată.</p>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
            Arii de expertiză
          </p>
          {profile.ariiDeExpertiza.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.ariiDeExpertiza.map((aria) => (
                <span
                  key={aria}
                  className="px-3 py-1 rounded-full text-xs font-semibold border border-border"
                  style={{ color: "#475569" }}
                >
                  {aria}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nicio arie de expertiză adăugată.</p>
          )}
        </div>
      </div>

      {editing && (
        <EditMentorProfileModal profile={profile} dimensions={dimensions} onClose={() => setEditing(false)} />
      )}
    </div>
  );
}
