import { describe, expect, it } from "vitest";
import {
  formatNotificationTime,
  groupNotificationsByDay,
  notificationDayGroup,
} from "./notification-time";

// 2026-10-30 11:00 in Bucharest (EET, UTC+2; summer time ended on 25 Oct).
const NOW = new Date("2026-10-30T09:00:00Z");

function ago(ms: number) {
  return new Date(NOW.getTime() - ms).toISOString();
}
const MIN = 60_000;
const HOUR = 60 * MIN;

describe("formatNotificationTime", () => {
  it("reads 'chiar acum' under a minute, and for a clock-skewed future time", () => {
    expect(formatNotificationTime(ago(20_000), NOW)).toBe("chiar acum");
    expect(formatNotificationTime(ago(-30_000), NOW)).toBe("chiar acum");
  });

  it("uses singular and plural minutes", () => {
    expect(formatNotificationTime(ago(MIN), NOW)).toBe("acum un minut");
    expect(formatNotificationTime(ago(5 * MIN), NOW)).toBe("acum 5 minute");
    expect(formatNotificationTime(ago(19 * MIN), NOW)).toBe("acum 19 minute");
    expect(formatNotificationTime(ago(20 * MIN), NOW)).toBe("acum 20 de minute");
    expect(formatNotificationTime(ago(59 * MIN), NOW)).toBe("acum 59 de minute");
  });

  it("uses singular and plural hours", () => {
    expect(formatNotificationTime(ago(HOUR), NOW)).toBe("acum o oră");
    expect(formatNotificationTime(ago(2 * HOUR), NOW)).toBe("acum 2 ore");
  });

  it("labels yesterday with its Bucharest time", () => {
    // 2026-10-29 08:30 UTC = 10:30 Bucharest.
    expect(formatNotificationTime("2026-10-29T08:30:00Z", NOW)).toBe("ieri, 10:30");
  });

  it("labels older notifications with the full date", () => {
    expect(formatNotificationTime("2026-10-24T08:08:00Z", NOW)).toBe("24 oct. 2026, 11:08");
  });

  it("judges the day in Bucharest, not UTC", () => {
    // 22:30 UTC on the 29th is already 00:30 on the 30th in Bucharest: today.
    expect(formatNotificationTime("2026-10-29T22:30:00Z", NOW)).toMatch(/^acum /);
    // 22:30 UTC on the 28th is 00:30 on the 29th: yesterday, though the 28th in UTC.
    expect(formatNotificationTime("2026-10-28T22:30:00Z", NOW)).toBe("ieri, 00:30");
  });

  it("handles the DST change (winter time after 25 Oct 2026)", () => {
    // Summer time ended on 25 Oct: that day had 25 hours.
    const now = new Date("2026-10-26T10:00:00Z");
    expect(formatNotificationTime("2026-10-25T10:00:00Z", now)).toBe("ieri, 12:00");
  });
});

describe("notificationDayGroup", () => {
  it("buckets today, yesterday and earlier", () => {
    expect(notificationDayGroup(ago(HOUR), NOW)).toBe("today");
    expect(notificationDayGroup("2026-10-29T10:00:00Z", NOW)).toBe("yesterday");
    expect(notificationDayGroup("2026-10-28T10:00:00Z", NOW)).toBe("earlier");
  });

  it("finds yesterday across a month boundary", () => {
    const now = new Date("2026-11-01T10:00:00Z");
    expect(notificationDayGroup("2026-10-31T10:00:00Z", now)).toBe("yesterday");
  });

  it("splits at Bucharest midnight", () => {
    // 22:00Z on the 29th is exactly 00:00 on the 30th in Bucharest (UTC+2).
    expect(notificationDayGroup("2026-10-29T21:59:59Z", NOW)).toBe("yesterday");
    expect(notificationDayGroup("2026-10-29T22:00:00Z", NOW)).toBe("today");
  });
});

describe("groupNotificationsByDay", () => {
  it("groups in display order with labels, skipping empty groups", () => {
    const items = [
      { id: "a", createdAt: ago(MIN) },
      { id: "b", createdAt: ago(HOUR) },
      { id: "c", createdAt: "2026-10-20T10:00:00Z" },
    ];
    const groups = groupNotificationsByDay(items, NOW);
    expect(groups.map((g) => g.label)).toEqual(["Astăzi", "Mai devreme"]);
    expect(groups[0].items.map((i) => i.id)).toEqual(["a", "b"]);
  });

  it("returns nothing for an empty list", () => {
    expect(groupNotificationsByDay([], NOW)).toEqual([]);
  });
});
