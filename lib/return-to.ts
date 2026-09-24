import { DASHBOARD_ROOT } from "./dashboard-routes";

/**
 * The admin-transfer invitation page sits outside the dashboard but asks an
 * existing account to sign in and come back to it (US-3 step 2).
 */
export const TRANSFER_ADMIN_PATH = "/transfer-admin";

const RETURN_TO_ROOTS = [DASHBOARD_ROOT, TRANSFER_ADMIN_PATH];

/**
 * Where to send someone once they have signed in, when they arrived at the
 * login page from a protected one rather than on their own. The proxy puts the
 * path in this query param on its way to `/autentificare`; it lives only in
 * that URL — persisting it anywhere would make every later login land on the
 * same page.
 *
 * The value reaches us from the address bar, so it is only ever used after
 * passing through here: anything off-origin would turn the login form into an
 * open redirect. Nothing outside the dashboard (and the transfer invitation) is allowed, which keeps
 * `/autentificare` from being pointed at itself and looping.
 */
export function safeReturnTo(value: string | null | undefined): string | null {
  if (!value) return null;
  const root = RETURN_TO_ROOTS.find((candidate) => value.startsWith(candidate));
  if (!root) return null;
  // `/dashboards-evil` starts with the root but is a different path; only a
  // boundary right after it counts.
  const next = value.charAt(root.length);
  if (next !== "" && next !== "/" && next !== "?") return null;
  return value;
}

export const RETURN_TO_PARAM = "returnTo";

export const LOGIN_PATH = "/autentificare";

/**
 * The login URL to send an unauthenticated visitor to, remembering where they
 * were headed when that destination is one we would return them to.
 */
export function loginPathFor(pathAndQuery: string): string {
  const returnTo = safeReturnTo(pathAndQuery);
  if (!returnTo) return LOGIN_PATH;
  return `${LOGIN_PATH}?${RETURN_TO_PARAM}=${encodeURIComponent(returnTo)}`;
}
