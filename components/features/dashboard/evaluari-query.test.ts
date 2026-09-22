import { describe, expect, it } from "vitest";
import { evaluariHref, hasActiveEvaluariFilters } from "./evaluari-query";

describe("evaluariHref", () => {
  it("keeps the tab alone when nothing is filtered", () => {
    expect(evaluariHref({ tab: "utilizatori" })).toBe("/dashboard/evaluari?tab=utilizatori");
  });

  it("carries every filter across a tab switch", () => {
    expect(
      evaluariHref({
        tab: "organizatii",
        search: "ana@example.org",
        ongs: ["ong-1", "ong-2"],
        programs: ["independent"],
        status: "in_lucru",
      }),
    ).toBe(
      "/dashboard/evaluari?tab=organizatii&search=ana%40example.org&ongs=ong-1%2Cong-2&programs=independent&status=in_lucru",
    );
  });

  it("omits empty filters instead of writing blank params", () => {
    expect(
      evaluariHref({ tab: "utilizatori", search: "", ongs: [], programs: [], status: "" }),
    ).toBe("/dashboard/evaluari?tab=utilizatori");
  });

  it("writes the page only past the first one", () => {
    expect(evaluariHref({ tab: "utilizatori", page: 1 })).toBe(
      "/dashboard/evaluari?tab=utilizatori",
    );
    expect(evaluariHref({ tab: "utilizatori", page: 3 })).toBe(
      "/dashboard/evaluari?tab=utilizatori&page=3",
    );
  });

  it("builds on a caller-supplied base path", () => {
    expect(evaluariHref({ tab: "utilizatori" }, "/dashboard/fdsc/evaluari")).toBe(
      "/dashboard/fdsc/evaluari?tab=utilizatori",
    );
  });
});

describe("hasActiveEvaluariFilters", () => {
  it("is false when nothing narrows the list", () => {
    expect(hasActiveEvaluariFilters({ search: "", ongs: [], programs: [], status: "" })).toBe(
      false,
    );
    expect(hasActiveEvaluariFilters({})).toBe(false);
  });

  it("is true for any single active filter", () => {
    expect(hasActiveEvaluariFilters({ search: "ana" })).toBe(true);
    expect(hasActiveEvaluariFilters({ ongs: ["ong-1"] })).toBe(true);
    expect(hasActiveEvaluariFilters({ programs: ["independent"] })).toBe(true);
    expect(hasActiveEvaluariFilters({ status: "completat" })).toBe(true);
  });
})
