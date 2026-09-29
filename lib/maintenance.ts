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

export type MaintenanceAction =
  | { type: "redirect"; to: string }
  | { type: "unavailable" }
  | { type: "pass" };

/**
 * While maintenance is on, pages redirect to the maintenance page and API
 * calls answer 503. While it is off, the maintenance page itself redirects
 * home so nobody lands on it after launch.
 */
export function maintenanceAction(pathname: string, enabled: boolean): MaintenanceAction {
  const isMaintenancePage = pathname === MAINTENANCE_PATH;

  if (!enabled) {
    return isMaintenancePage ? { type: "redirect", to: "/" } : { type: "pass" };
  }

  if (isMaintenancePage) return { type: "pass" };
  if (pathname === "/api" || pathname.startsWith("/api/")) return { type: "unavailable" };
  return { type: "redirect", to: MAINTENANCE_PATH };
}
