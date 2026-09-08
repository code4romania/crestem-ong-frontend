// lib/api/server.ts
import { cookies } from "next/headers";
import { ApiError } from "./client";
import { SESSION_COOKIE } from "./session-cookies";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface StrapiErrorResponse {
  error?: { message?: string; details?: unknown };
}

interface ServerFetchOptions {
  /**
   * Send the request with no `Authorization` header even when a session cookie
   * exists. For public reads that must survive a session cookie the backend no
   * longer accepts — see `getPublicPage`.
   */
  anonymous?: boolean;
}

export async function serverApiFetch<T>(
  path: string,
  init?: RequestInit,
  options?: ServerFetchOptions,
): Promise<T> {
  const cookieStore = await cookies();
  const jwt = options?.anonymous ? undefined : cookieStore.get(SESSION_COOKIE)?.value;

  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (jwt) {
    headers.set("Authorization", `Bearer ${jwt}`);
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  }).catch(() => {
    throw new ApiError("Nu am putut contacta serverul. Verifică conexiunea și încearcă din nou.", 0);
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorBody = (data as StrapiErrorResponse | null)?.error;
    const message = errorBody?.message ?? "A apărut o eroare. Încearcă din nou.";
    throw new ApiError(message, res.status, errorBody?.details);
  }

  return data as T;
}
