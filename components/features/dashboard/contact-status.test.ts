import { describe, expect, it } from "vitest";
import { contactStatusChipClass } from "./contact-status";

describe("contactStatusChipClass", () => {
  it("gives each status its own classes", () => {
    const classes = new Set([
      contactStatusChipClass("new"),
      contactStatusChipClass("in_progress"),
      contactStatusChipClass("closed"),
    ]);
    expect(classes.size).toBe(3);
  });

  it("returns a non-empty class string for every status", () => {
    for (const status of ["new", "in_progress", "closed"] as const) {
      expect(contactStatusChipClass(status).length).toBeGreaterThan(0);
    }
  });
});
