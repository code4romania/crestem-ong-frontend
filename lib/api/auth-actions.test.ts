import { describe, expect, it, vi, beforeEach } from "vitest";

const serverApiFetch = vi.fn();
const cookieDelete = vi.fn();
const redirect = vi.fn((path: string) => {
  // Mirrors next/navigation: redirect() signals by throwing, so the action must
  // call it outside the try/catch or the error handler swallows the navigation.
  const err = new Error(`NEXT_REDIRECT;${path}`);
  (err as { digest?: string }).digest = `NEXT_REDIRECT;replace;${path};307;`;
  throw err;
});

vi.mock("./server", () => ({ serverApiFetch: (...a: unknown[]) => serverApiFetch(...a) }));
vi.mock("next/headers", () => ({
  cookies: async () => ({ delete: (...a: unknown[]) => cookieDelete(...a), set: vi.fn() }),
}));
vi.mock("next/navigation", () => ({ redirect: (path: string) => redirect(path) }));

import { confirmEmailChangeAction } from "./auth-actions";
import { ApiError } from "./client";

beforeEach(() => {
  serverApiFetch.mockReset();
  cookieDelete.mockReset();
  redirect.mockClear();
});

describe("confirmEmailChangeAction", () => {
  it("redirects to the token-free success screen and drops the session cookies", async () => {
    serverApiFetch.mockResolvedValue({ email: "nou@exemplu.ro" });

    await expect(confirmEmailChangeAction("tok")).rejects.toThrow(/NEXT_REDIRECT/);

    expect(redirect).toHaveBeenCalledWith("/schimbare-email?confirmat=nou%40exemplu.ro");
    expect(cookieDelete).toHaveBeenCalledTimes(2);
  });

  it("returns the backend message when the token is already spent", async () => {
    serverApiFetch.mockRejectedValue(
      new ApiError("Link de confirmare invalid sau expirat", 400),
    );

    const res = await confirmEmailChangeAction("tok");

    expect(res).toEqual({ error: "Link de confirmare invalid sau expirat" });
    expect(redirect).not.toHaveBeenCalled();
  });
});
