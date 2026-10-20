import { describe, expect, it } from "vitest";
import { parseVideoId, videoSchema, VIDEO_DEFAULTS } from "./schema";

describe("parseVideoId", () => {
  it("accepts a nocookie embed link, which is what the renderer hands back", () => {
    expect(
      parseVideoId(
        "youtube",
        "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
      ),
    ).toBe("dQw4w9WgXcQ");
  });

  it("accepts the bare nocookie host too", () => {
    expect(
      parseVideoId("youtube", "https://youtube-nocookie.com/embed/dQw4w9WgXcQ"),
    ).toBe("dQw4w9WgXcQ");
  });

  it("still rejects a look-alike host", () => {
    expect(
      parseVideoId("youtube", "https://notyoutube-nocookie.com/embed/dQw4w9WgXcQ"),
    ).toBeNull();
  });
});

describe("videoSchema poster", () => {
  it("defaults to no poster, so a blank block shows the placeholder", () => {
    expect(VIDEO_DEFAULTS.poster).toBeNull();
  });

  it("keeps an uploaded poster", () => {
    const parsed = videoSchema.parse({
      sursaTip: "youtube",
      sursaUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      poster: { id: 7, url: "/uploads/poster.jpg", name: "poster.jpg" },
    });
    expect(parsed.poster).toEqual({
      id: 7,
      url: "/uploads/poster.jpg",
      name: "poster.jpg",
    });
  });
});
