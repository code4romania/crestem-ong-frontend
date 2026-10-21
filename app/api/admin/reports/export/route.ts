import { requireFdscStaffRoute } from "@/lib/api/route-auth";
import { proxyDownload } from "@/lib/api/server-download";

/**
 * "Descarcă lista" on the "Evaluări per organizație" tab — every round the
 * tab's filters match, as an `.xlsx`. FDSC staff only, as on the backend.
 */
export async function GET(request: Request) {
  const authError = await requireFdscStaffRoute();
  if (authError) return authError;

  const incoming = new URL(request.url).searchParams;
  const query = new URLSearchParams();
  for (const key of ["search", "ongs", "programs", "status"]) {
    const value = incoming.get(key);
    if (value) query.set(key, value);
  }
  const qs = query.toString();
  return proxyDownload(`/api/admin/reports/export${qs ? `?${qs}` : ""}`);
}
