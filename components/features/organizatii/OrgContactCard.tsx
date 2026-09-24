import type { Ong } from "@/lib/api/ongs";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
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

/**
 * `action` sits next to the heading and `children` under the details — the
 * FDSC Admin's „Schimbă administratorul” and its pending-transfer status. The
 * mentor's view of the same card passes neither.
 */
export function OrgContactCard({
  ong,
  action,
  children,
}: {
  ong: Ong;
  action?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const admin = ong.admin;
  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-[#5b6779]ase font-heading font-extrabold" style={{ color: "#1c1c81" }}>
          Persoană de contact
        </h2>
        {action}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5">
        <Field label="Nume complet" value={admin?.nume ?? "—"} />
        <Field label="Email" value={admin?.email ?? "—"} />
        <Field label="Telefon" value={admin?.telefon ?? "—"} />
        <Field label="Înregistrat la" value={formatDate(admin?.createdAt)} />
        <Field label="Ultima autentificare" value={formatDate(admin?.lastLogin)} />
      </div>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
