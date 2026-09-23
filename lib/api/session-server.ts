import { redirect } from "next/navigation";
import { serverApiFetch } from "./server";
import { ApiError } from "./client";
import type { CurrentUser } from "./auth";

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const res = await serverApiFetch<{ data: CurrentUser }>("/api/auth/me");
    return res.data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return null;
    }
    throw err;
  }
}

// Landing paths as the browser sees them — the role folder each one is served
// from is added by the proxy and never appears in the URL.
const DASHBOARD_PATH_BY_ROLE: Record<string, string> = {
  "ngo-admin": "/dashboard",
  "super-admin": "/dashboard",
  "editor-fdsc": "/dashboard",
  "ngo-member": "/dashboard",
  individual: "/dashboard",
  mentor: "/dashboard/mesaje",
};

export function getDashboardPathForRole(roleType?: string | null): string | null {
  if (!roleType) return null;
  return DASHBOARD_PATH_BY_ROLE[roleType] ?? null;
}

/**
 * Sends an already-authenticated visitor to their dashboard. Auth entry pages
 * (login, registration) have nothing to offer someone who is already signed in.
 * Call it straight from a Server Component body — it raises Next's redirect
 * signal, so it must not be wrapped in a try/catch.
 *
 * `returnTo` is the page the visitor was turned away from, already checked by
 * `safeReturnTo`. Someone whose session is still good — a second click on the
 * same invitation, say — belongs there rather than on their landing page.
 */
export async function redirectAuthenticatedToDashboard(
  returnTo?: string | null,
): Promise<void> {
  let dashboard: string | null = null;
  try {
    const user = await getCurrentUser();
    dashboard = getDashboardPathForRole(user?.role?.type);
  } catch {
    // Backend unreachable — render the auth page instead of failing the request.
  }
  // Only for a session that checked out: `returnTo` alone would bounce a signed
  // out visitor back to the page that sent them here, and round again.
  if (dashboard) redirect(returnTo ?? dashboard);
}
