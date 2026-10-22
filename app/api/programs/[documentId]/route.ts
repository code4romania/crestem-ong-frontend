import { NextResponse } from "next/server";
import { serverApiFetch } from "@/lib/api/server";
import { ApiError } from "@/lib/api/client";
import { requireFdscStaffRoute } from "@/lib/api/route-auth";

function errorResponse(err: unknown) {
  const message = err instanceof ApiError ? err.message : "A apărut o eroare.";
  const status = err instanceof ApiError ? err.status : 500;
  const details = err instanceof ApiError ? err.details : undefined;
  return NextResponse.json({ message, details }, { status: status || 500 });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const authError = await requireFdscStaffRoute();
  if (authError) return authError;

  const { documentId } = await params;
  const body = await request.text();
  try {
    const data = await serverApiFetch(
      `/api/programs/${encodeURIComponent(documentId)}`,
      { method: "PUT", body },
    );
    return NextResponse.json(data);
  } catch (err) {
    return errorResponse(err);
  }
}
