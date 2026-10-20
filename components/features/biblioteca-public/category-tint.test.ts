import { describe, expect, it } from "vitest";
import { categoryTint } from "./category-tint";

describe("categoryTint", () => {
  it("keeps the original colours of the former twelve icons", () => {
    expect(categoryTint("scale")).toEqual({ bg: "#fef2f2", fg: "#dc2626" });
    expect(categoryTint("book-open")).toEqual({ bg: "#dcfafb", fg: "#5656e5" });
  });

  it("gives any other icon a stable colour from the same palette", () => {
    const tint = categoryTint("rocket");
    expect(categoryTint("rocket")).toEqual(tint);
    const palette = [
      "scale",
      "folder",
      "message-square",
      "trending-up",
      "users",
      "globe",
      "heart",
      "briefcase",
    ].map(categoryTint);
    expect(palette).toContainEqual(tint);
  });
});
