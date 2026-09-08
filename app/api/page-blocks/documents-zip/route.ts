import { zip, type Zippable } from "fflate";

/**
 * Media origins this endpoint is allowed to fetch from. Always the API host
 * (relative `/uploads/...` paths resolve here); `MEDIA_ALLOWED_ORIGINS` adds
 * any extra host that serves uploads in a given deployment (e.g. the S3 bucket
 * `https://<bucket>.s3.<region>.amazonaws.com`).
 */
const API_ORIGIN = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL ?? "").origin;
  } catch {
    return "";
  }
})();

const ALLOWED_ORIGINS = new Set(
  [
    API_ORIGIN,
    ...(process.env.MEDIA_ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((s) => s.trim()),
  ].filter(Boolean),
);

/** Public endpoint guardrails — a crafted body can only ever hit the media host. */
const MAX_FILES = 50;
/** Per file; matches the client upload guard `MAX_DOCUMENT_BYTES`. */
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_TOTAL_BYTES = 200 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 15_000;

interface ReqFile {
  url: string;
  name: string;
}

/**
 * Resolve a block file URL to an absolute URL on an allowed media origin, or
 * `null` if it points anywhere else. This is what keeps the public endpoint
 * from being an open SSRF proxy: only relative paths (served by the API host)
 * and absolute URLs whose origin is allow-listed get fetched.
 */
function resolveMediaUrl(raw: string): string | null {
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
  if (!ALLOWED_ORIGINS.has(url.origin)) return null;
  return url.toString();
}

/** Strip characters that are illegal in a zip entry / filesystem path. */
function safeSegment(raw: string, fallback: string): string {
  const cleaned = raw.replace(/[/\\?%*:|"<>]/g, "_").trim();
  return cleaned || fallback;
}

/**
 * A zip-safe entry name for `file`: keeps the admin's display name, adds the
 * URL's extension when the name lacks one, and disambiguates collisions
 * (`raport.pdf`, `raport (2).pdf`).
 */
function uniqueEntryName(file: ReqFile, used: Set<string>): string {
  let base = safeSegment(file.name || "document", "document");
  if (!/\.[a-z0-9]{1,8}$/i.test(base)) {
    const ext = file.url.split(/[?#]/)[0].split(".").pop();
    if (ext && ext.length <= 8) base += `.${ext.toLowerCase()}`;
  }
  const dot = base.lastIndexOf(".");
  const stem = dot > 0 ? base.slice(0, dot) : base;
  const suffix = dot > 0 ? base.slice(dot) : "";

  let candidate = base;
  let n = 2;
  while (used.has(candidate.toLowerCase())) {
    candidate = `${stem} (${n})${suffix}`;
    n += 1;
  }
  used.add(candidate.toLowerCase());
  return candidate;
}

/**
 * Bundles the files of a Documents block into a single zip. Fetching happens
 * server-side so it isn't subject to CORS on the media host. Public — the
 * Documents block renders on public pages — so every fetched URL must resolve
 * to an allow-listed media origin (`resolveMediaUrl`) and the request is capped
 * by file count and byte budget. Files that can't be fetched are skipped; the
 * count comes back in `X-Zip-Failed` so the client can warn.
 */
export async function POST(request: Request) {
  let body: { files?: ReqFile[]; zipName?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Cerere invalidă." }, { status: 400 });
  }

  const files = (body.files ?? []).filter(
    (f): f is ReqFile => Boolean(f) && typeof f.url === "string" && f.url !== "",
  );
  if (files.length === 0) {
    return Response.json(
      { message: "Niciun fișier de descărcat." },
      { status: 400 },
    );
  }
  if (files.length > MAX_FILES) {
    return Response.json(
      { message: `Prea multe fișiere (maximum ${MAX_FILES}).` },
      { status: 400 },
    );
  }

  const used = new Set<string>();
  const entries: Record<string, Uint8Array> = {};
  let failed = 0;
  let total = 0;

  // Sequential rather than fan-out: this is public, so it stays gentle on the
  // media host and the byte budget is applied deterministically.
  for (const file of files) {
    const absolute = resolveMediaUrl(file.url);
    if (!absolute) {
      failed += 1;
      continue;
    }
    try {
      const res = await fetch(absolute, {
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) {
        failed += 1;
        continue;
      }
      const declared = Number(res.headers.get("content-length") ?? "0");
      if (declared > MAX_FILE_BYTES) {
        failed += 1;
        continue;
      }
      const bytes = new Uint8Array(await res.arrayBuffer());
      if (bytes.byteLength > MAX_FILE_BYTES || total + bytes.byteLength > MAX_TOTAL_BYTES) {
        failed += 1;
        continue;
      }
      total += bytes.byteLength;
      entries[uniqueEntryName(file, used)] = bytes;
    } catch {
      failed += 1;
    }
  }

  if (Object.keys(entries).length === 0) {
    return Response.json(
      { message: "Nu am putut descărca fișierele." },
      { status: 502 },
    );
  }

  const archive = await new Promise<Uint8Array>((resolve, reject) => {
    zip(entries as Zippable, { level: 6 }, (err, data) =>
      err ? reject(err) : resolve(data),
    );
  });

  // Copy into a Uint8Array backed by a plain ArrayBuffer — fflate types its
  // output as `Uint8Array<ArrayBufferLike>`, which no longer satisfies the
  // `BodyInit` (`ArrayBufferView<ArrayBuffer>`) constraint directly.
  const archiveBody = new Uint8Array(archive.byteLength);
  archiveBody.set(archive);

  const zipName = safeSegment(body.zipName ?? "", "documente");
  const headers: Record<string, string> = {
    "Content-Type": "application/zip",
    "Content-Disposition": `attachment; filename="${zipName}.zip"`,
    "Content-Length": String(archiveBody.byteLength),
  };
  if (failed > 0) headers["X-Zip-Failed"] = String(failed);

  return new Response(archiveBody, { status: 200, headers });
}
