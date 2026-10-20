import { describe, expect, it } from "vitest";
import pkg from "@/package.json";

describe("lucide packages", () => {
  // Icon names come from lucide-react and search tags from lucide-static; if the
  // two drift, new icons silently lose their tags. Upgrade both together.
  it("pins lucide-react and lucide-static to the same exact version", () => {
    const react = pkg.dependencies["lucide-react"];
    const stat = pkg.dependencies["lucide-static"];
    expect(react).toMatch(/^\d+\.\d+\.\d+$/);
    expect(stat).toBe(react);
  });
});
