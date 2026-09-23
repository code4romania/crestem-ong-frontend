import { BookOpen } from "lucide-react";
// import { GraduationCap } from "lucide-react"; // E-learning: not implemented yet, section commented out below
import Link from "next/link";
import { getMyArticleReads } from "@/lib/api/article-reads";
import { tipBadgeColors } from "@/components/features/biblioteca-public/tip-badge";
import { formatShortDate } from "@/lib/utils/date";

export async function ProfileActivitySections() {
  const reads = await getMyArticleReads();

  return (
    <>
      <div className="bg-white rounded-xl border border-border overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <BookOpen size={16} style={{ color: "#162040" }} />
          <h3 className="font-heading font-bold" style={{ color: "#162040" }}>
            Articole citite din Bibliotecă
          </h3>
          <span
            className="ml-auto px-2.5 py-0.5 rounded-full text-xs font-bold"
            style={{ background: "#eff6ff", color: "#2563eb" }}
          >
            {reads.length}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{
                  background: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                {["Titlu resursă", "Tip", "Accesat la"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reads.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-8 text-center text-sm text-muted-foreground"
                  >
                    Nu ai citit niciun articol din bibliotecă încă.
                  </td>
                </tr>
              ) : (
                reads.map((read) => {
                  const badge = tipBadgeColors(read.tip);
                  return (
                    <tr
                      key={read.documentId}
                      className="border-t border-border"
                    >
                      <td className="px-5 py-3" style={{ color: "#334155" }}>
                        {read.cale ? (
                          <Link
                            href={read.cale}
                            className="font-medium hover:underline"
                            style={{ color: "#162040" }}
                          >
                            {read.titlu}
                          </Link>
                        ) : (
                          read.titlu
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {read.tip ? (
                          <span
                            className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                            style={{ background: badge.bg, color: badge.fg }}
                          >
                            {read.tip}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {formatShortDate(read.accessedAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* E-learning: module not implemented yet, hidden until it ships.
      <div className="bg-white rounded-xl border border-border overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <GraduationCap size={16} style={{ color: "#162040" }} />
          <h3 className="font-heading font-bold" style={{ color: "#162040" }}>
            Cursuri parcurse
          </h3>
          <span
            className="ml-auto px-2.5 py-0.5 rounded-full text-xs font-bold"
            style={{ background: "#f0faf6", color: "#2dbe8f" }}
          >
            0
          </span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              {["Titlu curs", "Durată", "Status", "Finalizat la"].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="px-5 py-8 text-center text-sm text-muted-foreground">
                Nu ai parcurs niciun curs încă.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      */}
    </>
  );
}
