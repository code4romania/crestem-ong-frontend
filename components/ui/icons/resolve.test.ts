import { describe, expect, it } from "vitest";
import { z } from "zod";
import { FALLBACK_ICON, toStored } from "./names";
import { isIconName, resolveIconName } from "./registry";
import { LEGACY_ICONS, RECOMMENDED_ICONS } from "./legacy";
import { iconSchema } from "./schema";

describe("LEGACY_ICONS", () => {
  it("maps every legacy key of every scope to a real lucide icon", () => {
    for (const [scope, map] of Object.entries(LEGACY_ICONS)) {
      for (const [key, name] of Object.entries(map)) {
        expect(isIconName(name), `${scope}.${key} -> ${name}`).toBe(true);
      }
    }
  });

  it("keeps scope-specific meanings of the same key", () => {
    expect(resolveIconName("message", "callout")).toBe("message-circle");
    expect(resolveIconName("message", "category")).toBe("message-square");
    expect(resolveIconName("calendar", "contact")).toBe("calendar-days");
    expect(resolveIconName("calendar", "feature")).toBe("calendar");
    expect(resolveIconName("check", "callout")).toBe("circle-check-big");
    expect(resolveIconName("check", "feature")).toBe("square-check-big");
  });

  it("recommends only real icons, without duplicates", () => {
    expect(RECOMMENDED_ICONS.every(isIconName)).toBe(true);
    expect(new Set(RECOMMENDED_ICONS).size).toBe(RECOMMENDED_ICONS.length);
  });
});

describe("resolveIconName", () => {
  it("reads unprefixed values as the scope's legacy key", () => {
    // `book` is also a real lucide icon (closed book); legacy meant BookOpen.
    expect(resolveIconName("book", "feature")).toBe("book-open");
    expect(resolveIconName("building", "contact")).toBe("building-complex");
  });

  it("reads prefixed values as lucide names, even when they collide with legacy keys", () => {
    expect(resolveIconName("lucide:book", "feature")).toBe("book");
    expect(resolveIconName("lucide:calendar", "contact")).toBe("calendar");
    expect(resolveIconName("lucide:arrow-down-0-1", "callout")).toBe("arrow-down-0-1");
  });

  it("falls back for junk, unknown names and non-strings", () => {
    expect(resolveIconName("lucide:not-an-icon", "feature", "layers")).toBe("layers");
    expect(resolveIconName("nope", "feature", "layers")).toBe("layers");
    expect(resolveIconName(42, "feature", "layers")).toBe("layers");
    expect(resolveIconName(undefined, "feature")).toBe(FALLBACK_ICON);
  });

  it("maps a legacy fallback key through the scope", () => {
    expect(resolveIconName(undefined, "contact", "building")).toBe("building-complex");
  });
});

describe("iconSchema", () => {
  const schema = iconSchema("feature", "layers");

  it("normalises legacy keys to the stored format", () => {
    expect(schema.parse("chart")).toBe("lucide:chart-column");
  });

  it("round-trips new values", () => {
    expect(schema.parse("lucide:book")).toBe("lucide:book");
    expect(schema.parse(schema.parse("lucide:book"))).toBe("lucide:book");
  });

  it("keeps a cleared icon cleared", () => {
    expect(schema.parse("")).toBe("");
  });

  it("uses the default for missing or invalid values instead of failing", () => {
    expect(schema.parse(undefined)).toBe("lucide:layers");
    expect(schema.parse("junk")).toBe("lucide:layers");
  });

  it("treats a missing key in an object as the default", () => {
    const card = z.object({ icon: schema });
    expect(card.parse({})).toEqual({ icon: "lucide:layers" });
  });

  it("stores bare names with the prefix", () => {
    expect(toStored("book-open")).toBe("lucide:book-open");
  });
});

describe("bundle boundary", () => {
  // Block schemas are imported by client components on public pages; if this
  // chain imports lucide-react's `icons`, every public page ships all ~1,800
  // icons. Only `registry.ts` may.
  it("keeps the schema-side modules free of lucide-react", async () => {
    const { readFileSync } = await import("node:fs");
    for (const file of ["schema.ts", "resolve.ts", "names.ts", "legacy.ts"]) {
      const source = readFileSync(new URL(`./${file}`, import.meta.url), "utf8");
      expect(source, file).not.toMatch(/from "lucide-react"|from "\.\/registry"/);
    }
  });
});
