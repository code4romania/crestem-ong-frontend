import { describe, expect, it } from "vitest";
import { toggleRelatedSelection } from "./RelatedArticlesField";

describe("toggleRelatedSelection", () => {
  it("adds a new id when under the cap", () => {
    expect(toggleRelatedSelection(["a"], "b", 3)).toEqual(["a", "b"]);
  });

  it("removes an already-checked id even when at the cap", () => {
    expect(toggleRelatedSelection(["a", "b", "c"], "b", 3)).toEqual(["a", "c"]);
  });

  it("refuses to add a new id once at the cap, returning the same array unchanged", () => {
    const value = ["a", "b", "c"];
    expect(toggleRelatedSelection(value, "d", 3)).toEqual(value);
  });
});
