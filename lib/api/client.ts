const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Strapi media `url` fields are relative to the backend (e.g. `/uploads/x.png`),
 * not the frontend origin — prefix them with the API base URL so <img src> resolves.
 */
export function getMediaUrl(url: string): string {
  return /^https?:\/\//.test(url) ? url : `${API_URL}${url}`;
}

interface StrapiErrorResponse {
  error?: { message?: string; details?: unknown };
}

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export interface ZodFlattenError {
  formErrors?: string[];
  fieldErrors?: Record<string, string[]>;
}

export function isZodFlattenError(details: unknown): details is ZodFlattenError {
  return (
    typeof details === "object" &&
    details !== null &&
    ("fieldErrors" in details || "formErrors" in details)
  );
}

/**
 * Strapi and the browser's `fetch` report generic failures in English ("Forbidden",
 * "Failed to fetch", "Internal Server Error"…). Those must never reach a toast or
 * an inline error, so they are swapped for the caller's Romanian fallback.
 */
const ENGLISH_DEFAULT_MESSAGE =
  /^(forbidden|unauthorized|not found|bad request|internal server error|bad gateway|service unavailable|gateway timeout|payload too large|request entity too large|method not allowed|too many requests|conflict|failed to fetch|load failed|networkerror.*|the operation was aborted.*|fetch failed)\.?$/i;

export function errorMessage(err: unknown, fallback: string): string {
  const message = err instanceof Error ? err.message : typeof err === "string" ? err : "";
  return message && !ENGLISH_DEFAULT_MESSAGE.test(message.trim()) ? message : fallback;
}

/**
 * Strapi validation errors carry the real reason (e.g. "Cel puțin o fază
 * trebuie să aibă evaluare") in `details.fieldErrors`/`formErrors`, while
 * `message` is often just a generic "Date invalide: ". Prefer the details.
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (!(err instanceof ApiError)) return fallback;

  if (err.status === 403) {
    return "Nu ai permisiunea necesară pentru această acțiune.";
  }

  if (isZodFlattenError(err.details)) {
    const messages = [
      ...(err.details.formErrors ?? []),
      ...Object.values(err.details.fieldErrors ?? {}).flat(),
    ].filter(Boolean);
    if (messages.length > 0) return messages.join(" ");
  }

  return errorMessage(err, fallback);
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
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

export interface ParsedApiError {
  /** Form-level message: `formErrors`, else `error.message`, else the fallback. */
  message: string;
  /** `details.fieldErrors` flattened to one message per field, for `setError`. */
  fieldErrors: Record<string, string>;
}

/**
 * Splits a Strapi error into what belongs on individual inputs and what belongs
 * in the form-level alert. Use when the caller renders per-field errors;
 * `getApiErrorMessage` stays the right call for a single inline message.
 */
export function parseApiError(err: unknown, fallback: string): ParsedApiError {
  if (!(err instanceof ApiError)) return { message: fallback, fieldErrors: {} };

  if (err.status === 403) {
    return { message: "Nu ai permisiunea necesară pentru această acțiune.", fieldErrors: {} };
  }

  const fieldErrors: Record<string, string> = {};
  let formMessage = "";

  if (isZodFlattenError(err.details)) {
    for (const [field, messages] of Object.entries(err.details.fieldErrors ?? {})) {
      const first = messages?.find(Boolean);
      if (first) fieldErrors[field] = first;
    }
    formMessage = (err.details.formErrors ?? []).filter(Boolean).join(" ");
  }

  // Only fall back to `error.message` when nothing landed on a field — Strapi's
  // top-level message is often just a generic "Date invalide: ".
  if (!formMessage && Object.keys(fieldErrors).length === 0) {
    formMessage = errorMessage(err, fallback);
  }

  return { message: formMessage, fieldErrors };
}
