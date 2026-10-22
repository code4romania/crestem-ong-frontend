import { describe, expect, it } from "vitest";
import { formatDate, formatLongDate, toBucharestDay } from "./date";

describe("toBucharestDay", () => {
  it("moves a late-evening UTC datetime to the next Bucharest day (summer, UTC+3)", () => {
    expect(toBucharestDay("2026-10-19T22:30:00.000Z")).toBe("2026-10-20");
  });

  it("moves a late-evening UTC datetime to the next Bucharest day (winter, UTC+2)", () => {
    expect(toBucharestDay("2026-01-14T22:30:00.000Z")).toBe("2026-01-15");
  });

  it("keeps the same day before local midnight", () => {
    expect(toBucharestDay("2026-10-19T20:59:00.000Z")).toBe("2026-10-19");
  });

  it("passes date-only values through unchanged", () => {
    expect(toBucharestDay("2026-03-01")).toBe("2026-03-01");
  });

  it("returns null for an invalid value", () => {
    expect(toBucharestDay("not a date")).toBeNull();
  });
});

describe("formatDate", () => {
  it("formats a datetime by its Bucharest day", () => {
    expect(formatDate("2026-10-19T22:30:00.000Z")).toBe("20.10.2026");
  });

  it("formats a date-only value", () => {
    expect(formatDate("2026-03-01")).toBe("01.03.2026");
  });

  it("shows a dash for empty or invalid values", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate("")).toBe("—");
    expect(formatDate("not a date")).toBe("—");
  });
});

describe("formatLongDate", () => {
  it("formats a datetime by its Bucharest day", () => {
    expect(formatLongDate("2026-10-19T22:30:00.000Z")).toBe("20 octombrie 2026");
  });
});
