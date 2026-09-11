import { apiFetch } from "./client";

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
}

export interface LoginResponse {
  jwt: string;
  user: AuthUser;
  refreshToken: string;
  /** True only on the login that stamped the account's firstLoginAt. */
  isFirstLogin?: boolean;
}

export function login(payload: LoginPayload) {
  return apiFetch<LoginResponse>("/api/auth/local", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface CurrentUser {
  id: number;
  documentId: string;
  /** Accounts created by an admin (e.g. invited mentors) come back without a name. */
  nume: string | null;
  email: string;
  createdAt: string;
  role: { type: string; name: string } | null;
}

/** Name to show in the UI, falling back to the email local part when no name is set. */
export function userDisplayName(user: { nume: string | null; email: string }): string {
  return user.nume?.trim() || user.email.split("@")[0];
}

export function getMe(jwt: string) {
  return apiFetch<{ data: CurrentUser }>("/api/auth/me", {
    headers: { Authorization: `Bearer ${jwt}` },
  });
}

export interface RefreshResponse {
  jwt: string;
  refreshToken: string;
}

export function refreshSession(refreshToken: string) {
  return apiFetch<RefreshResponse>("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export interface RegisterNgoPayload {
  nume: string;
  email: string;
  password: string;
  telefon: string;
  cui: string;
  numeOng: string;
  judet: string;
  localitate: string;
  acordTermeniSiConditii: boolean;
}

export function registerNgo(payload: RegisterNgoPayload) {
  return apiFetch<unknown>("/api/auth/register/ngo", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface RegisterIndividualPayload {
  nume: string;
  email: string;
  password: string;
  telefon?: string;
  acordTermeniSiConditii: boolean;
}

export function registerIndividual(payload: RegisterIndividualPayload) {
  return apiFetch<unknown>("/api/auth/register/individual", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface ActivateAccountPayload {
  token: string;
  password: string;
  confirmedPassword: string;
}

export function activateAccount(payload: ActivateAccountPayload) {
  return apiFetch<{ message: string }>("/api/auth/activate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
