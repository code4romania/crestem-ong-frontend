export const MAINTENANCE_PATH = "/mentenanta";

/**
 * `MAINTENANCE_MODE` in the Vercel project's environment variables:
 * `ACTIVE` sends every visitor to the maintenance page, `OFFLINE` serves the
 * site normally. Any other value (or none) also serves the site, so a typo
 * cannot lock everyone out. Vercel only applies env changes to new
 * deployments, so flipping it takes a redeploy.
 */
export function isMaintenanceMode(value = process.env.MAINTENANCE_MODE) {
  return value === "ACTIVE";
}

/**
 * Lets the team use the site while maintenance is on. Opening any page with
 * `?bypass=<MAINTENANCE_BYPASS_TOKEN>` stores the token in this cookie, and
 * the browser then sees the site as if maintenance were off. Changing the
 * token in Vercel (plus a redeploy) revokes every cookie handed out so far;
 * leaving it unset disables the bypass entirely.
 */
export const MAINTENANCE_BYPASS_PARAM = "bypass";
export const MAINTENANCE_BYPASS_COOKIE = "maintenance_bypass";

export const maintenanceBypassCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

/** Compares in constant time so response timing cannot leak the token. */
export function bypassTokenMatches(
  candidate: string | undefined,
  token = process.env.MAINTENANCE_BYPASS_TOKEN,
) {
  if (!token || !candidate || candidate.length !== token.length) return false;
  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= candidate.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * `requested`: the URL carries a valid token. `granted`: the cookie does.
 */
export type MaintenanceBypass = "none" | "requested" | "granted";

export type MaintenanceAction =
  | { type: "redirect"; to: string }
  | { type: "grant-bypass" }
  | { type: "unavailable" }
  | { type: "pass" };

/**
 * While maintenance is on, pages redirect to the maintenance page and API
 * calls answer 503, unless the visitor holds the bypass. While it is off, the
 * maintenance page itself redirects home so nobody lands on it after launch.
 */
export function maintenanceAction(
  pathname: string,
  enabled: boolean,
  bypass: MaintenanceBypass = "none",
): MaintenanceAction {
  const isMaintenancePage = pathname === MAINTENANCE_PATH;

  if (!enabled) {
    return isMaintenancePage ? { type: "redirect", to: "/" } : { type: "pass" };
  }

  if (bypass === "requested") return { type: "grant-bypass" };
  if (bypass === "granted") return { type: "pass" };

  if (isMaintenancePage) return { type: "pass" };
  if (pathname === "/api" || pathname.startsWith("/api/")) return { type: "unavailable" };
  return { type: "redirect", to: MAINTENANCE_PATH };
}
