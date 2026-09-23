import { describe, expect, it } from "vitest";
import { contactSchema, CONTACT_DEFAULTS } from "./schema";

describe("contactSchema", () => {
  it("accepts the defaults, so a fresh block is already valid", () => {
    expect(contactSchema.safeParse(CONTACT_DEFAULTS).success).toBe(true);
  });

  it("fills every field from an empty object", () => {
    const parsed = contactSchema.safeParse({});
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.subjects).toEqual([]);
      expect(parsed.data.infoItems).toEqual([]);
      expect(parsed.data.socials).toEqual([]);
      expect(parsed.data.mapEnabled).toBe(false);
    }
  });

  it("rejects duplicate subjects", () => {
    const parsed = contactSchema.safeParse({
      ...CONTACT_DEFAULTS,
      subjects: ["Parteneriate", "Parteneriate"],
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects an empty subject entry", () => {
    const parsed = contactSchema.safeParse({ ...CONTACT_DEFAULTS, subjects: ["Ok", "  "] });
    expect(parsed.success).toBe(false);
  });

  it("rejects an info item without a value", () => {
    const parsed = contactSchema.safeParse({
      ...CONTACT_DEFAULTS,
      infoItems: [{ icon: "map-pin", label: "ADRESĂ", value: "" }],
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects a social entry without a url", () => {
    const parsed = contactSchema.safeParse({
      ...CONTACT_DEFAULTS,
      socials: [{ platform: "facebook", url: "" }],
    });
    expect(parsed.success).toBe(false);
  });

  it("requires an address once the map is enabled", () => {
    const parsed = contactSchema.safeParse({
      ...CONTACT_DEFAULTS,
      mapEnabled: true,
      mapAddress: "",
    });
    expect(parsed.success).toBe(false);
  });

  it("ignores a blank address while the map is off", () => {
    const parsed = contactSchema.safeParse({
      ...CONTACT_DEFAULTS,
      mapEnabled: false,
      mapAddress: "",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects an unknown icon key", () => {
    const parsed = contactSchema.safeParse({
      ...CONTACT_DEFAULTS,
      infoItems: [{ icon: "nonexistent", label: "X", value: "Y" }],
    });
    expect(parsed.success).toBe(false);
  });
});
