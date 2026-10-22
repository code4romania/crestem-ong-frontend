import { requireFdscStaffRoute } from "@/lib/api/route-auth";
import { proxyDownload } from "@/lib/api/server-download";

/**
 * "Descarcă lista" — the FDSC organizations list as an `.xlsx`, under the same
 * filters the screen applies. FDSC staff only, as on the backend.
 */
export async function GET(request: Request) {
  const authError = await requireFdscStaffRoute();
  if (authError) return authError;

  const incoming = new URL(request.url).searchParams;
  const query = new URLSearchParams();
  for (const key of ["search", "judet", "program"]) {
    const value = incoming.get(key);
    if (value) query.set(key, value);
  }
  const qs = query.toString();
  return proxyDownload(`/api/ongs/export${qs ? `?${qs}` : ""}`);
}
