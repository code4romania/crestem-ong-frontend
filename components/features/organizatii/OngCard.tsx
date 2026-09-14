import Link from "next/link";
import { Building2, ExternalLink, Globe, MapPin, Users } from "lucide-react";
import { isRetras, type Ong } from "@/lib/api/ongs";
import { DeleteOngButton } from "./DeleteOngButton";

export function OngCard({ ong }: { ong: Ong }) {
  return (
    <div className="bg-white rounded-xl border border-border p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <div
            className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center"
            style={{ background: "#eff6ff" }}
          >
            <Building2 size={22} style={{ color: "#2563eb" }} />
          </div>
          <div className="min-w-0">
            {/* The badge is a sibling of the truncating heading, not inside it —
              inside, a long organization name would ellipsize it away. The
              description sits below the title, not beside it, so a narrow
              content column can't squeeze the name down to an ellipsis. */}
            <div className="flex items-center gap-2 min-w-0">
              <h3
                className="font-semibold truncate min-w-0"
                style={{ color: "#162040" }}
              >
                {ong.name}
              </h3>
              {isRetras(ong) && (
                <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                  Retras
                </span>
              )}
            </div>
            {ong.descriere && (
              <p
                className="mt-0.5 text-sm line-clamp-2"
                style={{ color: "#64748b" }}
              >
                {ong.descriere}
              </p>
            )}
          </div>
        </div>
        {/* Nothing left to act on once the profile is anonymized; the backend
            rejects a second deletion anyway. "Vezi ONG" stays — it is FDSC's
            only navigation to the evaluations BR-33 preserves. */}
        {!isRetras(ong) && (
          <DeleteOngButton documentId={ong.documentId} ongName={ong.name} />
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <MapPin size={14} />
          {ong.localitate?.nume ?? "—"}, {ong.judet?.nume ?? "—"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users size={14} />
          {ong.memberCount ?? 0}{" "}
          {(ong.memberCount ?? 0) === 1 ? "membru" : "membri"}
        </span>
        {ong.website && (
          <a
            href={ong.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:underline"
            style={{ color: "#2563eb" }}
          >
            <Globe size={14} />
            {ong.website.replace(/^https?:\/\//, "")}
          </a>
        )}
      </div>

      {(ong.programs ?? []).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {(ong.programs ?? []).map((program) => (
            <span
              key={program.documentId}
              className="px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: "#f0faf6", color: "#162040" }}
            >
              {program.name}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground truncate">
          Admin:{" "}
          <span style={{ color: "#334155" }}>{ong.admin?.nume ?? "—"}</span>
        </p>
        <Link
          href={`/dashboard/organizatii/${ong.documentId}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-white shrink-0 hover:opacity-90 transition-opacity"
          style={{ background: "#162040" }}
        >
          <ExternalLink size={14} />
          Vezi ONG
        </Link>
      </div>
    </div>
  );
}
