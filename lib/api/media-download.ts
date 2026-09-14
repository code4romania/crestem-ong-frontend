/**
 * Shared guards for endpoints that fetch uploaded media server-side (to dodge
 * CORS on the media host) and stream it back to the browser as a download.
 * Used by the Documents-block zip route and the media-library single-file
 * download route.
 */

/**
 * Media origins these endpoints are allowed to fetch from. Always the API host
 * (relative `/uploads/...` paths resolve here); `MEDIA_ALLOWED_ORIGINS` adds
 * any extra host that serves uploads in a given deployment (e.g. the S3 bucket
 * `https://<bucket>.s3.<region>.amazonaws.com`).
 */
export const API_ORIGIN = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL ?? "").origin;
  } catch {
    return "";
  }
})();

export const ALLOWED_MEDIA_ORIGINS = new Set(
  [
    API_ORIGIN,
    ...(process.env.MEDIA_ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((s) => s.trim()),
  ].filter(Boolean),
);

/**
 * Resolve a stored file URL to an absolute URL on an allowed media origin, or
 * `null` if it points anywhere else. This is what keeps these endpoints from
 * being an open SSRF proxy: only relative paths (served by the API host) and
 * absolute URLs whose origin is allow-listed get fetched.
 */
export function resolveMediaUrl(raw: string): string | null {
  if (typeof raw !== "string" || raw === "") return null;
  // Relative path on the API host. Reject protocol-relative ("//evil.com").
  if (raw.startsWith("/") && !raw.startsWith("//")) {
    return API_ORIGIN ? `${API_ORIGIN}${raw}` : null;
  }
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (!ALLOWED_MEDIA_ORIGINS.has(url.origin)) return null;
  return url.toString();
}

/** Strip characters that are illegal in a zip entry / filesystem path. */
export function safeSegment(raw: string, fallback: string): string {
  const cleaned = raw.replace(/[/\\?%*:|"<>]/g, "_").trim();
  return cleaned || fallback;
}
