"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { userDisplayName } from "@/lib/api/auth";
import type { IndividualProfile } from "@/lib/api/individual-profile";
import { EditIndividualProfileModal } from "./EditIndividualProfileModal";

function formatJoinDate(iso: string) {
  return new Intl.DateTimeFormat("ro-RO", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}

export function IndividualProfileDetailsCard({ profile }: { profile: IndividualProfile }) {
  const [editing, setEditing] = useState(false);

  const nume = userDisplayName(profile);
  const initials = nume
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-white rounded-xl border border-border p-6 mb-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0"
            style={{ background: "#00d495" }}
          >
            {initials}
          </div>
          <div>
            <p className="font-heading font-bold text-lg" style={{ color: "#1c1c81" }}>
              {nume}
            </p>
            <p className="text-sm mt-0.5" style={{ color: "#5b6779" }}>
              {profile.email}
            </p>
            <p className="text-xs mt-1 text-muted-foreground">
              {profile.judet && profile.localitate ? (
                <>
                  {profile.localitate.nume}, {profile.judet.nume}
                  {" · "}
                </>
              ) : null}
              {profile.createdAt && (
                <>
                  Membru din{" "}
                  <span className="font-semibold" style={{ color: "#1c1c81" }}>
                    {formatJoinDate(profile.createdAt)}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors"
          style={{ color: "#1c1c81" }}
        >
          <Pencil size={14} />
          Editează profilul
        </button>
      </div>

      {editing && <EditIndividualProfileModal profile={profile} onClose={() => setEditing(false)} />}
    </div>
  );
}
