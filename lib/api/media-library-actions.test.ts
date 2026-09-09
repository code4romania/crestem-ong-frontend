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
  replaceMediaAssetFileAction,
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

describe("replaceMediaAssetFileAction", () => {
  it("returns { mismatch: true } on a 409", async () => {
    getCurrentUser.mockResolvedValue({ role: { type: "super-admin" } });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({}),
    });
    vi.stubGlobal("fetch", fetchMock);

    const form = new FormData();
    form.append("files", new File(["x"], "new.png", { type: "image/png" }));
    const res = await replaceMediaAssetFileAction("a1", form);

    expect(res).toEqual({ mismatch: true });
    vi.unstubAllGlobals();
  });
});

describe("uploadMediaAssetsBatchAction", () => {
  const batchForm = () => {
    const form = new FormData();
    form.append("files", new File(["a"], "one.png", { type: "image/png" }));
    form.append("files", new File(["b"], "two.png", { type: "image/png" }));
    return form;
  };

  it("creates one asset per uploaded file", async () => {
    getCurrentUser.mockResolvedValue({ role: { type: "super-admin" } });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => [
          { id: 11, name: "one.png" },
          { id: 12, name: "two.png" },
        ],
      }),
    );
    serverApiFetch
      .mockResolvedValueOnce({ data: { documentId: "a11", titlu: "one" } })
      .mockResolvedValueOnce({ data: { documentId: "a12", titlu: "two" } });

    const res = await uploadMediaAssetsBatchAction(batchForm());

    expect(res.error).toBeUndefined();
    expect(res.failed).toEqual([]);
    expect(res.assets.map((a) => a.documentId)).toEqual(["a11", "a12"]);
    vi.unstubAllGlobals();
  });

  it("records a per-file create failure and purges its orphan", async () => {
    getCurrentUser.mockResolvedValue({ role: { type: "super-admin" } });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => [
          { id: 11, name: "one.png" },
          { id: 12, name: "two.png" },
        ],
      }),
    );
    serverApiFetch
      .mockResolvedValueOnce({ data: { documentId: "a11", titlu: "one" } })
      .mockRejectedValueOnce(new ApiError("boom", 500))
      .mockResolvedValueOnce({}); // cleanup-orphan-file

    const res = await uploadMediaAssetsBatchAction(batchForm());

    expect(res.assets.map((a) => a.documentId)).toEqual(["a11"]);
    expect(res.failed).toEqual(["two.png"]);
    expect(serverApiFetch).toHaveBeenCalledWith(
      "/api/media-assets/cleanup-orphan-file",
      expect.objectContaining({ method: "POST" }),
    );
    vi.unstubAllGlobals();
  });

  it("aborts with an error when the upload call fails", async () => {
    getCurrentUser.mockResolvedValue({ role: { type: "super-admin" } });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 413,
        json: async () => ({ error: { message: "prea mare" } }),
      }),
    );

    const res = await uploadMediaAssetsBatchAction(batchForm());

    expect(res.assets).toEqual([]);
    expect(res.error).toBeTruthy();
    expect(serverApiFetch).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
