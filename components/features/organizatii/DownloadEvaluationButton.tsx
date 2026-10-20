import { DownloadButton } from "@/components/ui/DownloadButton";

/** "Descarcă evaluarea" — the round's `.xlsx`, styled as a table action link. */
export function DownloadEvaluationButton({
  ongDocumentId,
  reportDocumentId,
}: {
  ongDocumentId: string;
  reportDocumentId: string;
}) {
  return (
    <DownloadButton
      href={`/api/ongs/${encodeURIComponent(ongDocumentId)}/evaluations/${encodeURIComponent(reportDocumentId)}/export`}
      label="Descarcă evaluarea"
      className="inline-flex items-center gap-1 text-xs font-semibold hover:underline disabled:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d495]/40 rounded"
      style={{ color: "#007d58" }}
    />
  );
}
