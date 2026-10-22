import { requireFdscStaffRoute } from "@/lib/api/route-auth";
import { proxyDownload } from "@/lib/api/server-download";

/** "Descarcă evaluarea" — the round's `.xlsx`. FDSC staff only, as on the backend. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ documentId: string; reportId: string }> },
) {
  const authError = await requireFdscStaffRoute();
  if (authError) return authError;

  const { documentId, reportId } = await params;
  return proxyDownload(
    `/api/ongs/${encodeURIComponent(documentId)}/evaluations/${encodeURIComponent(reportId)}/export`,
  );
}
