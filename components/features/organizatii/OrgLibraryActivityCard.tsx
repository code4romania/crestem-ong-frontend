import { BookOpen } from "lucide-react";
import Link from "next/link";
import { tipBadgeColors } from "@/components/features/biblioteca-public/tip-badge";
import { formatShortDate } from "@/lib/utils/date";
import type { OngLibraryActivityRow } from "@/lib/api/ongs";

export function OrgLibraryActivityCard({ rows }: { rows: OngLibraryActivityRow[] }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="flex items-center gap-2 text-base font-heading font-extrabold" style={{ color: "#162040" }}>
          <BookOpen size={18} />
          Articole citite din Bibliotecă
        </h2>
        <span
          className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: "#eff6ff", color: "#2563eb" }}
        >
          {rows.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {rows.length > 0 && (
            <thead>
              <tr className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                <th className="text-left pb-3 pr-4 font-semibold">Titlu resursă</th>
                <th className="text-left pb-3 pr-4 font-semibold">Tip</th>
                <th className="text-left pb-3 pr-4 font-semibold">Accesat la</th>
                <th className="text-left pb-3 font-semibold">Total accesări</th>
              </tr>
            </thead>
          )}
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="py-6 text-center text-sm text-muted-foreground">
                  Nicio activitate înregistrată încă.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => {
                const badge = tipBadgeColors(row.type);
                return (
                  <tr key={index} className="border-t border-border">
                    <td className="py-3 pr-4" style={{ color: "#334155" }}>
                      {row.cale ? (
                        <Link href={row.cale} className="font-medium hover:underline" style={{ color: "#162040" }}>
                          {row.resourceTitle}
                        </Link>
                      ) : (
                        row.resourceTitle
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      {row.type ? (
                        <span
                          className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: badge.bg, color: badge.fg }}
                        >
                          {row.type}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{formatShortDate(row.accessedAt)}</td>
                    <td className="py-3 font-semibold" style={{ color: "#162040" }}>
                      {row.totalAccesses}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
