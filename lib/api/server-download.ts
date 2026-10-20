// lib/api/server-download.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "./session-cookies";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Passes a file Strapi generates (the FDSC exports) through to the browser.
 * The session token is httpOnly, so the browser cannot ask Strapi directly, and
 * `serverApiFetch` only reads JSON. Failures come back as `{ message }` JSON,
 * like the other route handlers.
 */
export async function proxyDownload(path: string): Promise<Response> {
  const jwt = (await cookies()).get(SESSION_COOKIE)?.value;

  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}${path}`, {
      headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined,
      cache: "no-store",
    });
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
