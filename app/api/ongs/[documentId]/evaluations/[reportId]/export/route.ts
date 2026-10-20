import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireFdscStaffRoute } from "@/lib/api/route-auth";
import { SESSION_COOKIE } from "@/lib/api/session-cookies";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * "Descarcă evaluarea" — passes the round's `.xlsx` through from Strapi. The
 * session token is httpOnly, so the browser cannot ask Strapi directly, and
 * `serverApiFetch` only reads JSON. FDSC staff only, as on the backend.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ documentId: string; reportId: string }> },
) {
  const authError = await requireFdscStaffRoute();
  if (authError) return authError;

  const { documentId, reportId } = await params;
  const jwt = (await cookies()).get(SESSION_COOKIE)?.value;

  let upstream: Response;
  try {
    upstream = await fetch(
      `${API_URL}/api/ongs/${encodeURIComponent(documentId)}/evaluations/${encodeURIComponent(reportId)}/export`,
      {
        headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined,
        cache: "no-store",
      },
    );
  } catch {
    return NextResponse.json(
      { message: "Nu am putut contacta serverul. Verifică conexiunea și încearcă din nou." },
      { status: 502 },
    );
  }

  if (!upstream.ok || !upstream.body) {
    const data = (await upstream.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    return NextResponse.json(
      { message: data?.error?.message ?? "Nu am putut genera fișierul." },
      { status: upstream.status || 502 },
    );
  }

  const headers = new Headers({ "Cache-Control": "private, no-store" });
  for (const name of ["content-type", "content-disposition", "content-length"]) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  return new Response(upstream.body, { status: 200, headers });
}
