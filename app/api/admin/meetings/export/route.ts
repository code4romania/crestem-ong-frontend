import { requireFdscStaffRoute } from "@/lib/api/route-auth";
import { proxyDownload } from "@/lib/api/server-download";

// Strapi builds the whole file before the first byte comes back; a full
// export runs past the platform's default function timeout (504).
export const maxDuration = 180;

/**
 * "Descarcă jurnalul" — the meetings held, as an `.xlsx`: one resource
 * person's (`mentor`), or everyone's under the "Persoane resursă" filters.
 * FDSC staff only, as on the backend.
 */
export async function GET(request: Request) {
  const authError = await requireFdscStaffRoute();
  if (authError) return authError;

  const incoming = new URL(request.url).searchParams;
  const query = new URLSearchParams();
  for (const key of ["search", "program", "mentor"]) {
    const value = incoming.get(key);
    if (value) query.set(key, value);
  }
  const qs = query.toString();
  return proxyDownload(`/api/admin/meetings/export${qs ? `?${qs}` : ""}`);
}
