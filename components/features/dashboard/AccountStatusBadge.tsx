import type { AdminUser } from "@/lib/api/users";

const STATUS_BADGES: Record<AdminUser["accountStatus"], { label: string; bg: string; color: string }> = {
  active: { label: "Activ", bg: "#f0fdf4", color: "#15803d" },
  pending: { label: "În așteptare", bg: "#fffbeb", color: "#b45309" },
  deleted: { label: "Șters", bg: "#fef2f2", color: "#b91c1c" },
};

/** An account's status pill, as the admin user tables show it. */
export function AccountStatusBadge({ status }: { status: AdminUser["accountStatus"] }) {
  const badge = STATUS_BADGES[status] ?? null;
  if (!badge) return <span style={{ color: "#5b6779" }}>—</span>;
  return (
    <span
      className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold text-center whitespace-nowrap"
      style={{ background: badge.bg, color: badge.color }}
    >
      {badge.label}
    </span>
  );
}
