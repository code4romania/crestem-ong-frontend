import { requireFdscStaffRoute } from "@/lib/api/route-auth";
import { proxyDownload } from "@/lib/api/server-download";

/**
 * "Descarcă evaluările" — a program's rounds and its summary as an `.xlsx`.
 * FDSC staff only, as on the backend.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const authError = await requireFdscStaffRoute();
  if (authError) return authError;

  const { documentId } = await params;
  return proxyDownload(`/api/programs/${encodeURIComponent(documentId)}/export`);
}
