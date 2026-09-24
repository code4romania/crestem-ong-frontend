import type { Ong } from "@/lib/api/ongs";

function initials(name: string) {
  const words = name.trim().split(/\s+/);
  return words.slice(0, 2).map((word) => word[0] ?? "").join("") || "?";
}

function formatAddress(ong: Ong) {
  const parts = [ong.adresa, ong.localitate?.nume, ong.judet?.nume].filter(Boolean);
  if (parts.length === 0) return null;
  return `${parts.join(", ")}, România`;
}

function externalHref(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#5b6779" }}>
        {label}
      </p>
      <p className="text-sm" style={{ color: "#334155" }}>
        {value}
      </p>
    </div>
  );
}

export function OrgDetailsCard({ ong }: { ong: Ong }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <div className="flex items-center gap-4 pb-5 mb-5 border-b border-border">
        <div
          className="w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-lg font-bold text-white"
          style={{ background: "#1c1c81" }}
        >
          {initials(ong.name)}
        </div>
        <div>
          <p className="text-lg font-heading font-extrabold" style={{ color: "#1c1c81" }}>
            {ong.name}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">CUI: {ong.cui || "—"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5">
        <Field label="Adresă" value={formatAddress(ong) ?? "—"} />
        <Field
          label="Website"
          value={
            ong.website ? (
              <a
                href={externalHref(ong.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: "#007d58" }}
              >
                {ong.website}
              </a>
            ) : (
              "—"
            )
          }
        />
        <Field label="Domeniu de activitate" value={ong.domeniuActivitate || "—"} />
        {ong.domeniuSecundar && <Field label="Domeniu secundar" value={ong.domeniuSecundar} />}
        {ong.socialMedia && (
          <Field
            label="Social media"
            value={
              <a
                href={externalHref(ong.socialMedia)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: "#007d58" }}
              >
                {ong.socialMedia}
              </a>
            }
          />
        )}
      </div>
    </div>
  );
}
