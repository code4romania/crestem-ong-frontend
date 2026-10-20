import { describe, expect, it } from "vitest";
import { rankRelatedCandidates } from "./related-articles";
import type { ArticleOption } from "./articles-types";

function option(overrides: Partial<ArticleOption>): ArticleOption {
  return {
    documentId: "id",
    titlu: "Titlu",
    rezumat: "",
    cale: "/biblioteca/a/b/c",
    categorie: null,
    categorieId: null,
    subcategorieId: null,
    etichete: [],
    tip: "",
    stare: "publicat",
    vizibilitate: ["public"],
    dataPublicarii: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("rankRelatedCandidates", () => {
  const target = { documentId: "target", etichete: ["fiscal", "ong"] };

  it("ranks by shared tag count, highest first", () => {
    const a = option({ documentId: "a", etichete: ["fiscal"] });
    const b = option({ documentId: "b", etichete: ["fiscal", "ong"] });
    expect(rankRelatedCandidates(target, [a, b]).map((r) => r.documentId)).toEqual([
      "b",
      "a",
    ]);
  });

  it("drops candidates with no shared tags", () => {
    const a = option({ documentId: "a", etichete: ["altceva"] });
    expect(rankRelatedCandidates(target, [a])).toEqual([]);
  });

  it("excludes the target article itself", () => {
    const self = option({ documentId: "target", etichete: ["fiscal"] });
    expect(rankRelatedCandidates(target, [self])).toEqual([]);
  });

  it("excludes unpublished (draft) candidates", () => {
    const draft = option({ documentId: "a", etichete: ["fiscal"], stare: "schita" });
    expect(rankRelatedCandidates(target, [draft])).toEqual([]);
  });

  it("breaks ties by most recently published first", () => {
    const older = option({
      documentId: "older",
      etichete: ["fiscal"],
      dataPublicarii: "2023-01-01T00:00:00.000Z",
    });
    const newer = option({
      documentId: "newer",
      etichete: ["fiscal"],
      dataPublicarii: "2024-06-01T00:00:00.000Z",
    });
    expect(rankRelatedCandidates(target, [older, newer]).map((r) => r.documentId)).toEqual([
      "newer",
      "older",
    ]);
  });

  it("caps the result at 10", () => {
    const many = Array.from({ length: 15 }, (_, i) =>
      option({ documentId: `a${i}`, etichete: ["fiscal"] }),
    );
    expect(rankRelatedCandidates(target, many)).toHaveLength(10);
  });

  it("projects only the fields the card needs", () => {
    const a = option({
      documentId: "a",
      titlu: "Ghid",
      etichete: ["fiscal"],
      tip: "Ghid",
      cale: "/biblioteca/x/y/ghid",
    });
    expect(rankRelatedCandidates(target, [a])).toEqual([
      { documentId: "a", titlu: "Ghid", cale: "/biblioteca/x/y/ghid", etichete: ["fiscal"], tip: "Ghid" },
    ]);
  });
});
