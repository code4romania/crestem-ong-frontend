import { describe, expect, it } from "vitest";
import { searchIcons } from "./search";
import { loadIconTags } from "./tags";

const TAGS: Record<string, string[]> = {
  book: ["reading", "library"],
  "book-open": ["reading", "library", "pages"],
  "notebook-pen": ["writing"],
  users: ["group", "people"],
  "user-round": ["person"],
  library: ["books"],
};

describe("searchIcons", () => {
  it("returns nothing for an empty query", () => {
    expect(searchIcons("   ", TAGS)).toEqual([]);
  });

  it("ranks exact name, then name prefix, then name contains, then tags", () => {
    expect(searchIcons("book", TAGS)).toEqual([
      "book",
      "book-open",
      "notebook-pen",
      "library", // tag "books"
    ]);
  });

  it("finds icons by tag after name matches", () => {
    expect(searchIcons("people", TAGS)).toEqual(["users"]);
    // "library" is an exact name; book / book-open match it as a tag.
    expect(searchIcons("library", TAGS)).toEqual(["library", "book", "book-open"]);
  });

  it("ignores case and treats spaces like dashes", () => {
    expect(searchIcons("Book Open", TAGS)).toEqual(["book-open"]);
    expect(searchIcons("BOOK-OPEN", TAGS)).toEqual(["book-open"]);
  });

  it("matches partial tags", () => {
    expect(searchIcons("pers", TAGS)).toEqual(["user-round"]);
  });
});

describe("loadIconTags", () => {
  it("loads lucide's tags keyed by names we can render", async () => {
    const tags = await loadIconTags();
    expect(Object.keys(tags).length).toBeGreaterThan(1500);
    expect(tags["book-open"]).toContain("reading");
  });
});
