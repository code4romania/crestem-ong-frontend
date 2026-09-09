import { describe, expect, it, vi, beforeEach } from "vitest";

const fetchMock = vi.fn();
vi.mock("./server", () => ({ serverApiFetch: (...a: unknown[]) => fetchMock(...a) }));

import { listMediaAssets, listMediaTags } from "./media-library";

beforeEach(() => fetchMock.mockReset());

describe("listMediaAssets", () => {
  it("builds a query string from filters", async () => {
    fetchMock.mockResolvedValue({ data: [], meta: { pagination: {} } });
    await listMediaAssets({ search: "logo", tip: "image", etichete: ["brand", "press"], page: 2 });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/media-assets?search=logo&tip=image&etichete=brand%2Cpress&page=2",
    );
  });

  it("omits empty params", async () => {
    fetchMock.mockResolvedValue({ data: [], meta: { pagination: {} } });
    await listMediaAssets({});
    expect(fetchMock).toHaveBeenCalledWith("/api/media-assets");
  });
});

describe("listMediaTags", () => {
  it("unwraps data", async () => {
    fetchMock.mockResolvedValue({ data: [{ nume: "logo", slug: "logo" }] });
    expect(await listMediaTags()).toEqual([{ nume: "logo", slug: "logo" }]);
  });
});
