import { describe, expect, it } from "vitest";
import { getEmbedSrc } from "./embed-src";
import { VIDEO_DEFAULTS, type VideoData } from "./schema";

const YT = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

function data(patch: Partial<VideoData> = {}): VideoData {
  return { ...VIDEO_DEFAULTS, sursaUrl: YT, ...patch };
}

describe("getEmbedSrc", () => {
  it("keeps YouTube on the nocookie host", () => {
    const src = getEmbedSrc(data());
    expect(src?.startsWith("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?")).toBe(true);
  });

  it("autoplays, because the iframe only ever mounts after a click", () => {
    const params = new URL(getEmbedSrc(data())!).searchParams;
    expect(params.get("autoplay")).toBe("1");
    expect(params.get("rel")).toBe("0");
  });

  it("mutes only when the block asks for it", () => {
    expect(new URL(getEmbedSrc(data())!).searchParams.get("mute")).toBeNull();
    expect(
      new URL(getEmbedSrc(data({ mut: true }))!).searchParams.get("mute"),
    ).toBe("1");
  });

  it("hides the controls when the block turns them off", () => {
    expect(
      new URL(getEmbedSrc(data({ controale: false }))!).searchParams.get(
        "controls",
      ),
    ).toBe("0");
  });

  it("repeats a looping video by pointing the playlist at itself", () => {
    const params = new URL(getEmbedSrc(data({ loop: true }))!).searchParams;
    expect(params.get("loop")).toBe("1");
    expect(params.get("playlist")).toBe("dQw4w9WgXcQ");
  });

  it("sends Vimeo to its own player with autoplay on", () => {
    const src = getEmbedSrc(
      data({ sursaTip: "vimeo", sursaUrl: "https://vimeo.com/76979871" }),
    );
    expect(src?.startsWith("https://player.vimeo.com/video/76979871?")).toBe(
      true,
    );
    expect(new URL(src!).searchParams.get("autoplay")).toBe("1");
  });

  it("returns null for an uploaded file, which needs no embed", () => {
    expect(getEmbedSrc(data({ sursaTip: "fisier" }))).toBeNull();
  });

  it("returns null when the link is not a recognisable video URL", () => {
    expect(getEmbedSrc(data({ sursaUrl: "https://example.com/clip" }))).toBeNull();
  });
});
