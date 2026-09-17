import { describe, expect, it, vi, beforeEach } from "vitest";

const serverApiFetch = vi.fn();
const getCurrentUser = vi.fn();
vi.mock("./server", () => ({ serverApiFetch: (...a: unknown[]) => serverApiFetch(...a) }));
vi.mock("./session-server", () => ({ getCurrentUser: () => getCurrentUser() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => ({ value: "jwt" }) }) }));

import {
  updateMediaAssetAction,
  deleteMediaAssetAction,
  deleteMediaAssetsBatchAction,
  finalizeMediaAssetReplaceAction,
  uploadMediaAssetsBatchAction,
} from "./media-library-actions";
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

describe("deleteMediaAssetsBatchAction", () => {
  it("force-deletes every id and reports failures", async () => {
    getCurrentUser.mockResolvedValue({ role: { type: "super-admin" } });
    serverApiFetch
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new ApiError("boom", 500))
      .mockResolvedValueOnce({});

    const res = await deleteMediaAssetsBatchAction(["a1", "a2", "a3"]);

    expect(res.deleted).toEqual(["a1", "a3"]);
    expect(res.failed).toEqual(["a2"]);
    expect(serverApiFetch).toHaveBeenNthCalledWith(
      1,
      "/api/media-assets/a1?force=true",
      { method: "DELETE" },
    );
  });

  it("refuses a non-staff user before any request", async () => {
    getCurrentUser.mockResolvedValue({ role: { type: "mentor" } });
    const res = await deleteMediaAssetsBatchAction(["a1"]);
    expect(res.error).toMatch(/permisiune/i);
    expect(res.deleted).toEqual([]);
    expect(serverApiFetch).not.toHaveBeenCalled();
  });
});

describe("finalizeMediaAssetReplaceAction", () => {
  // The raw file now goes straight from the browser to Strapi's `/replace`
  // endpoint (see `lib/api/upload-direct.ts`), so this action only ever
  // receives an already-successful response to finalize (cache invalidation).
  // A 409 format mismatch is handled client-side before this is ever called.
  it("returns the asset from Strapi's response", async () => {
    getCurrentUser.mockResolvedValue({ role: { type: "super-admin" } });

    const res = await finalizeMediaAssetReplaceAction({
      data: { documentId: "a1" } as never,
      meta: { revalidate: ["/pagina"] },
    });

    expect(res).toEqual({ asset: { documentId: "a1" } });
  });

  it("refuses a non-staff user", async () => {
    getCurrentUser.mockResolvedValue({ role: { type: "mentor" } });
    const res = await finalizeMediaAssetReplaceAction({ data: { documentId: "a1" } as never });
    expect(res.error).toMatch(/permisiune/i);
  });
});

describe("uploadMediaAssetsBatchAction", () => {
  // The raw files now go straight from the browser to Strapi's `/api/upload`
  // (see `lib/api/upload-direct.ts`), so this action only ever receives the
  // already-uploaded `{ id, name }` pairs and creates the media-asset rows.
  const uploadedFiles = () => [
    { id: 11, name: "one.png" },
    { id: 12, name: "two.png" },
  ];

  it("creates one asset per uploaded file", async () => {
    getCurrentUser.mockResolvedValue({ role: { type: "super-admin" } });
    serverApiFetch
      .mockResolvedValueOnce({ data: { documentId: "a11", titlu: "one" } })
      .mockResolvedValueOnce({ data: { documentId: "a12", titlu: "two" } });

    const res = await uploadMediaAssetsBatchAction(uploadedFiles());

    expect(res.error).toBeUndefined();
    expect(res.failed).toEqual([]);
    expect(res.assets.map((a) => a.documentId)).toEqual(["a11", "a12"]);
  });

  it("records a per-file create failure and purges its orphan", async () => {
    getCurrentUser.mockResolvedValue({ role: { type: "super-admin" } });
    serverApiFetch
      .mockResolvedValueOnce({ data: { documentId: "a11", titlu: "one" } })
      .mockRejectedValueOnce(new ApiError("boom", 500))
      .mockResolvedValueOnce({}); // cleanup-orphan-file

    const res = await uploadMediaAssetsBatchAction(uploadedFiles());

    expect(res.assets.map((a) => a.documentId)).toEqual(["a11"]);
    expect(res.failed).toEqual(["two.png"]);
    expect(serverApiFetch).toHaveBeenCalledWith(
      "/api/media-assets/cleanup-orphan-file",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("returns an error when given no files", async () => {
    getCurrentUser.mockResolvedValue({ role: { type: "super-admin" } });

    const res = await uploadMediaAssetsBatchAction([]);

    expect(res.assets).toEqual([]);
    expect(res.error).toBeTruthy();
    expect(serverApiFetch).not.toHaveBeenCalled();
  });
});
