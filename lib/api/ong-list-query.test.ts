import { describe, expect, it } from "vitest";
import { ongListQuery } from "./ong-list-query";

describe("ongListQuery", () => {
  it("is empty for the unfiltered first page", () => {
    expect(ongListQuery({ page: 1, search: "", judet: "", program: "" })).toBe("");
  });

  it("carries the page only past the first one", () => {
    expect(ongListQuery({ page: 3, search: "", judet: "", program: "" })).toBe("page=3");
  });

  it("carries search and both filters", () => {
    expect(
      ongListQuery({ page: 1, search: "asociatia", judet: "jd1", program: "pg1" }),
    ).toBe("search=asociatia&judet=jd1&program=pg1");
  });

  it("trims the search term and drops it when only blank", () => {
    expect(ongListQuery({ page: 1, search: "  cluj  ", judet: "", program: "" })).toBe(
      "search=cluj",
    );
    expect(ongListQuery({ page: 1, search: "   ", judet: "", program: "" })).toBe("");
  });

  it("encodes values that need it", () => {
    expect(ongListQuery({ page: 1, search: "a & b", judet: "", program: "" })).toBe(
      "search=a+%26+b",
    );
  });
});
