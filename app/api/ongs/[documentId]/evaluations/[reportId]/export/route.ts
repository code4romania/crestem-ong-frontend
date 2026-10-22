import { requireFdscStaffRoute } from "@/lib/api/route-auth";
import { proxyDownload } from "@/lib/api/server-download";

<<<<<<< HEAD
// Strapi builds the whole file before the first byte comes back; a full
// export runs past the platform's default function timeout (504).
export const maxDuration = 180;

=======
>>>>>>> main
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
