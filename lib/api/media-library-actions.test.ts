import { describe, expect, it, vi, beforeEach } from "vitest";

const serverApiFetch = vi.fn();
const getCurrentUser = vi.fn();
vi.mock("./server", () => ({ serverApiFetch: (...a: unknown[]) => serverApiFetch(...a) }));
vi.mock("./session-server", () => ({ getCurrentUser: () => getCurrentUser() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => ({ value: "jwt" }) }) }));

import { updateMediaAssetAction, deleteMediaAssetAction } from "./media-library-actions";
import { ApiError } from "./client";

beforeEach(() => {
  serverApiFetch.mockReset();
  getCurrentUser.mockReset();
});

describe("staff guard", () => {
  it("refuses a non-staff user", async () => {
    getCurrentUser.mockResolvedValue({ role: { type: "mentor" } });
    const res = await updateMediaAssetAction("a1", { titlu: "x" });
    expect(res.error).toMatch(/permisiune/i);
    expect(serverApiFetch).not.toHaveBeenCalled();
  });
});

describe("deleteMediaAssetAction", () => {
  it("returns the usage list on a 409", async () => {
    getCurrentUser.mockResolvedValue({ role: { type: "super-admin" } });
    serverApiFetch.mockRejectedValue(
      new ApiError("folosit", 409, { utilizari: [{ documentId: "p1", titlu: "P", cale: "/p" }] }),
    );
    const res = await deleteMediaAssetAction("a1");
    expect(res.utilizari).toHaveLength(1);
    expect(res.ok).toBeUndefined();
  });

  it("returns ok on success", async () => {
    getCurrentUser.mockResolvedValue({ role: { type: "super-admin" } });
    serverApiFetch.mockResolvedValue({ data: { documentId: "a1" } });
    expect(await deleteMediaAssetAction("a1", { force: true })).toEqual({ ok: true });
  });
});
