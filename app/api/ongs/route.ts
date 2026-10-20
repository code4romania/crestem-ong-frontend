import { NextResponse } from "next/server";
import { serverApiFetch } from "@/lib/api/server";
import { ApiError } from "@/lib/api/client";
import { requireFdscStaffRoute } from "@/lib/api/route-auth";

/**
 * One page of the FDSC organizations list. The screen loads page after page as
 * it scrolls, which means fetching from the browser — and the session token is
 * httpOnly, so the request passes through here rather than straight to Strapi.
 */
export async function GET(request: Request) {
  const authError = await requireFdscStaffRoute();
  if (authError) return authError;

  const incoming = new URL(request.url).searchParams;
  const query = new URLSearchParams();
  for (const key of ["page", "search", "judet", "program"]) {
    const value = incoming.get(key);
    if (value) query.set(key, value);
  }
  const qs = query.toString();

  try {
    const data = await serverApiFetch(`/api/ongs${qs ? `?${qs}` : ""}`);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "A apărut o eroare.";
    const status = err instanceof ApiError ? err.status : 500;
    return NextResponse.json({ message }, { status: status || 500 });
  }
}
