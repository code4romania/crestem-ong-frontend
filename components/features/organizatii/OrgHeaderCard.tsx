import type { Ong } from "@/lib/api/ongs";

function initials(name: string) {
  const words = name.trim().split(/\s+/);
  return words.slice(0, 2).map((word) => word[0] ?? "").join("") || "?";
}

export function OrgHeaderCard({ ong }: { ong: Ong }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 mb-6 flex items-start justify-between gap-6 flex-wrap">
      <div className="flex items-start gap-4">
        <div
          className="w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center text-xl font-bold text-white"
          style={{ background: "#1c1c81" }}
        >
          {initials(ong.name)}
        </div>
        <div>
          <h1 className="text-2xl font-heading font-extrabold" style={{ color: "#1c1c81" }}>
            {ong.name}
          </h1>
          {ong.descriere && (
            <p className="mt-1 text-sm max-w-2xl" style={{ color: "#334155" }}>
              {ong.descriere}
            </p>
          )}
          <p className="mt-1.5 text-sm text-muted-foreground">
            {ong.localitate?.nume ?? "—"}, {ong.judet?.nume ?? "—"} · {ong.memberCount ?? 0}{" "}
            {(ong.memberCount ?? 0) === 1 ? "membru" : "membri"} · Admin: {ong.admin?.nume ?? "—"}
          </p>
        </div>
      </div>
      {(ong.programs ?? []).length > 0 && (
        <div className="flex flex-wrap gap-2 max-w-md">
          {(ong.programs ?? []).map((program) => (
            <span
              key={program.documentId}
              className="px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: "#e5f9e5", color: "#1c1c81" }}
            >
              {program.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
