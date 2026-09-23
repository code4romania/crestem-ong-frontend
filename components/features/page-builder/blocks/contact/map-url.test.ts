import { describe, expect, it } from "vitest";
import { mapEmbedUrl, mapLinkUrl } from "./map-url";

describe("mapEmbedUrl", () => {
  it("encodes the address into the keyless embed endpoint", () => {
    expect(mapEmbedUrl("Str. Academiei nr. 14, București")).toBe(
      "https://www.google.com/maps?q=Str.%20Academiei%20nr.%2014%2C%20Bucure%C8%99ti&output=embed",
    );
  });

  it("returns an empty string for a blank address", () => {
    expect(mapEmbedUrl("   ")).toBe("");
  });
});

describe("mapLinkUrl", () => {
  it("builds the documented search link", () => {
    expect(mapLinkUrl("Piața Victoriei")).toBe(
      "https://www.google.com/maps/search/?api=1&query=Pia%C8%9Ba%20Victoriei",
    );
  });

  it("returns an empty string for a blank address", () => {
    expect(mapLinkUrl("")).toBe("");
  });
});
