import { describe, expect, it } from "vitest";
import { ApiError, errorMessage, getApiErrorMessage } from "./client";

describe("errorMessage", () => {
  it("keeps a Romanian message", () => {
    expect(errorMessage(new Error("Organizația nu există"), "Eroare")).toBe(
      "Organizația nu există",
    );
  });

  it.each(["Forbidden", "Not Found", "Internal Server Error", "Failed to fetch", "Load failed"])(
    "replaces the English default %s with the fallback",
    (message) => {
      expect(errorMessage(new Error(message), "Eroare")).toBe("Eroare");
    },
  );

  it("falls back for anything that is not an error", () => {
    expect(errorMessage(undefined, "Eroare")).toBe("Eroare");
  });

  it("is applied to API errors", () => {
    expect(getApiErrorMessage(new ApiError("Not Found", 404), "Eroare")).toBe("Eroare");
  });
});
