import { Download, Eye } from "lucide-react";
import { getMediaUrl } from "@/lib/api/client";
import { formatLongDate } from "@/lib/utils/date";
import { fileTypeBadge } from "@/lib/utils/fdsc-report";
import { DeleteFdscReportButton } from "@/components/features/organizatii/DeleteFdscReportButton";
import type { OngFdscReport } from "@/lib/api/ongs";

export function FdscReportsTable({
  reports,
  ongDocumentId,
  readOnly = false,
}: {
  reports: OngFdscReport[];
  ongDocumentId: string;
  /** Hides the delete action — used for roles (e.g. mentor) that can only view/download reports. */
  readOnly?: boolean;
}) {
  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">Nu există niciun raport pentru această organizație.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            {["Denumire raport", "Evaluare", "Program", "Data încărcării", "Acțiuni"].map((h) => (
              <th
                key={h}
                className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                style={{ color: "#5b6779" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => {
            const fileUrl = report.file ? getMediaUrl(report.file.url) : null;
            const isPdf = report.file?.ext?.toLowerCase() === ".pdf";
            const badge = fileTypeBadge(report.file?.ext);
            return (
              <tr key={report.documentId} className="border-b border-border last:border-0">
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-2.5 font-semibold" style={{ color: "#1c1c81" }}>
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
                      style={{ background: badge.background, color: badge.color }}
                    >
                      {badge.label}
                    </span>
                    {report.name}
                  </span>
                </td>
                <td className="px-5 py-3.5" style={{ color: "#5b6779" }}>
                  {report.evaluation?.name ?? "—"}
                </td>
                <td className="px-5 py-3.5" style={{ color: "#5b6779" }}>
                  {report.evaluation?.program?.name ?? "—"}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap" style={{ color: "#5b6779" }}>
                  {formatLongDate(report.uploadedAt)}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {fileUrl ? (
                      <>
                        {isPdf && (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-slate-50 transition-colors"
                            style={{ color: "#334155" }}
                          >
                            <Eye size={13} /> Vezi
                          </a>
                        )}
                        <a
                          href={fileUrl}
                          download={report.file?.name}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-slate-50 transition-colors"
                          style={{ color: "#334155" }}
                        >
                          <Download size={13} /> Descarcă
                        </a>
                      </>
                    ) : (
                      <span style={{ color: "#5b6779" }}>—</span>
                    )}
                    {!readOnly && (
                      <DeleteFdscReportButton
                        ongDocumentId={ongDocumentId}
                        reportDocumentId={report.documentId}
                        reportName={report.name}
                      />
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
