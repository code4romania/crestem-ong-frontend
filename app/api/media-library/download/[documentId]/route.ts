import { NextResponse } from "next/server";
import { serverApiFetch } from "@/lib/api/server";
import { ApiError } from "@/lib/api/client";
import { requireFdscStaffRoute } from "@/lib/api/route-auth";
import { resolveMediaUrl, safeSegment } from "@/lib/api/media-download";
import type { MediaAssetDetail } from "@/lib/api/media-library-types";

/**
 * Streams a media-library asset's underlying file to the browser as a download.
 * The fetch happens server-side so it isn't subject to CORS on the media host
 * (S3), and the client never supplies a URL — the file URL is read from the
 * asset record here, so this can't be turned into an SSRF proxy. Staff-only,
 * like every other media-library action.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const authError = await requireFdscStaffRoute();
  if (authError) return authError;

  const { documentId } = await params;

  let asset: MediaAssetDetail;
  try {
    const res = await serverApiFetch<{ data: MediaAssetDetail }>(
      `/api/media-assets/${encodeURIComponent(documentId)}`,
    );
    asset = res.data;
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "A apărut o eroare.";
    const status = err instanceof ApiError ? err.status : 500;
    return NextResponse.json({ message }, { status: status || 500 });
  }

  const absolute = resolveMediaUrl(asset.fisier.url);
  if (!absolute) {
    return NextResponse.json(
      { message: "Fișierul nu poate fi descărcat." },
      { status: 502 },
    );
  }

  let upstream: Response;
  try {
    // No explicit timeout: large videos take a while and aborting would kill
    // the stream mid-download.
    upstream = await fetch(absolute, { cache: "no-store", redirect: "error" });
  } catch {
    return NextResponse.json(
      { message: "Nu am putut descărca fișierul." },
      { status: 502 },
    );
  }
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { message: "Nu am putut descărca fișierul." },
      { status: 502 },
    );
  }

  const name = safeSegment(asset.fisier.name, "fisier");
  const asciiName = name.replace(/[^\x20-\x7E]/g, "_").replace(/"/g, "'");
  const headers = new Headers({
    "Content-Type":
      upstream.headers.get("content-type") ??
      asset.fisier.mime ??
      "application/octet-stream",
    "Content-Disposition": `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(name)}`,
    "Cache-Control": "private, no-store",
  });
  const length = upstream.headers.get("content-length");
  if (length) headers.set("Content-Length", length);

  return new Response(upstream.body, { status: 200, headers });
}
