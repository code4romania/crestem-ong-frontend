import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { refreshSession, getMe } from "@/lib/api/auth";
import type { RefreshResponse } from "@/lib/api/auth";
import { isJwtExpired } from "@/lib/api/jwt";
import {
  SESSION_COOKIE,
  REFRESH_COOKIE,
  ROLE_COOKIE,
  sessionCookieOptions,
  refreshCookieOptions,
  roleCookieOptions,
} from "@/lib/api/session-cookies";
import { loginPathFor } from "@/lib/return-to";
import {
  DASHBOARD_ROOT,
  addDashboardSegment,
  dashboardSegmentForRole,
  isDashboardSegment,
  stripDashboardSegment,
} from "@/lib/dashboard-routes";

function mergedCookieHeader(request: NextRequest, overrides: Record<string, string>) {
  const cookies = new Map(request.cookies.getAll().map((c) => [c.name, c.value]));
  for (const [name, value] of Object.entries(overrides)) {
    cookies.set(name, value);
  }
  return [...cookies].map(([name, value]) => `${name}=${value}`).join("; ");
}

// Coalesces concurrent refresh attempts for the same refresh token (e.g. Link
// prefetches racing on an expired session) so the backend only rotates it once —
// the backend invalidates a refresh token on use, so a second concurrent call
// with the same token would otherwise fail and log the user out.
const pendingRefreshes = new Map<string, Promise<RefreshResponse>>();

function coalescedRefresh(refreshToken: string) {
  const existing = pendingRefreshes.get(refreshToken);
  if (existing) return existing;
  const promise = refreshSession(refreshToken).finally(() => {
    pendingRefreshes.delete(refreshToken);
  });
  pendingRefreshes.set(refreshToken, promise);
  return promise;
}

function isDashboardRequest(request: NextRequest) {
  const path = request.nextUrl.pathname;
  return path === DASHBOARD_ROOT || path.startsWith(`${DASHBOARD_ROOT}/`);
}

function redirectToLogin(request: NextRequest) {
  // The page they asked for travels along, so signing in returns them to it
  // rather than to their role's landing page — an evaluation invitation links
  // straight to the respondent's wizard, and dropping the destination here
  // would strand them one click short of it.
  const target = loginPathFor(request.nextUrl.pathname + request.nextUrl.search);
  const response = NextResponse.redirect(new URL(target, request.url));
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  response.cookies.delete(ROLE_COOKIE);
  return response;
}

/**
 * Resolves which dashboard folder the session belongs in. The cookie set at
 * login answers it for free; a session that predates the cookie (or had it
 * dropped) pays one `/api/auth/me` call and gets it back.
 */
async function resolveSegment(request: NextRequest, jwt: string) {
  const cached = request.cookies.get(ROLE_COOKIE)?.value;
  if (isDashboardSegment(cached)) return { segment: cached!, cached: true };

  try {
    const me = await getMe(jwt);
    const segment = dashboardSegmentForRole(me.data.role?.type);
    return { segment, cached: false };
  } catch {
    return { segment: null, cached: false };
  }
}

/**
 * Keeps the role out of the address bar: the browser only ever sees
 * `/dashboard/<page>`, which is rewritten onto `app/dashboard/<role>/<page>`.
 * Pre-existing links that still carry the role segment are redirected to the
 * role-less form so bookmarks keep working without leaking it back.
 */
async function routeDashboard(
  request: NextRequest,
  jwt: string,
  requestHeaders?: Headers,
): Promise<NextResponse> {
  const next = () =>
    requestHeaders ? NextResponse.next({ request: { headers: requestHeaders } }) : NextResponse.next();

  if (!isDashboardRequest(request)) return next();

  const url = request.nextUrl;
  const stripped = stripDashboardSegment(url.pathname);
  if (stripped !== url.pathname) {
    const target = new URL(stripped, request.url);
    target.search = url.search;
    return NextResponse.redirect(target);
  }

  // Session looks valid but its role cannot be read (revoked account, backend
  // down). Home rather than the login page, which would bounce right back here.
  const { segment, cached } = await resolveSegment(request, jwt);
  if (!segment) return NextResponse.redirect(new URL("/", request.url));

  const target = new URL(addDashboardSegment(url.pathname, segment), request.url);
  target.search = url.search;
  const response = NextResponse.rewrite(target, requestHeaders ? { request: { headers: requestHeaders } } : undefined);
  if (!cached) {
    response.cookies.set(ROLE_COOKIE, segment, roleCookieOptions);
  }
  return response;
}

export async function proxy(request: NextRequest) {
  const jwt = request.cookies.get(SESSION_COOKIE)?.value;
  if (jwt && !isJwtExpired(jwt)) {
    return routeDashboard(request, jwt);
  }

  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (refreshToken) {
    try {
      const fresh = await coalescedRefresh(refreshToken);

      // Rewrite the incoming request's cookie header so Server Components /
      // Server Actions further down this same request see the new JWT
      // immediately, since they can't set cookies themselves.
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set(
        "cookie",
        mergedCookieHeader(request, {
          [SESSION_COOKIE]: fresh.jwt,
          [REFRESH_COOKIE]: fresh.refreshToken,
        }),
      );

      const response = await routeDashboard(request, fresh.jwt, requestHeaders);
      response.cookies.set(SESSION_COOKIE, fresh.jwt, sessionCookieOptions);
      response.cookies.set(REFRESH_COOKIE, fresh.refreshToken, refreshCookieOptions);
      return response;
    } catch {
      // Refresh token invalid, expired, or revoked — fall through as unauthenticated.
    }
  }

  // API calls: let the request through with no/stale cookies so the route
  // handler's own auth check returns a proper 401 instead of an HTML redirect.
  if (!isDashboardRequest(request)) {
    return NextResponse.next();
  }

  return redirectToLogin(request);
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/((?!auth/).*)"],
};
