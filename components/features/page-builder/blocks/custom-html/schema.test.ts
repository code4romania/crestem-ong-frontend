import { describe, expect, it } from "vitest";
import { customHtmlSchema, CUSTOM_HTML_DEFAULTS } from "./schema";

describe("customHtmlSchema", () => {
  it("keeps the pasted source exactly as it was typed", () => {
    const sursa =
      '<div onclick="alert(1)"><style>.a{color:red}</style><!-- nota --></div>';

    const parsed = customHtmlSchema.parse({ ...CUSTOM_HTML_DEFAULTS, sursa });

    expect(parsed.sursa).toBe(sursa);
  });

  it("defaults the width to the content container", () => {
    const parsed = customHtmlSchema.parse({ sursa: "<p>x</p>" });

    expect(parsed.latime).toBe("continut");
  });

  it("rejects a block with no source", () => {
    const result = customHtmlSchema.safeParse({ ...CUSTOM_HTML_DEFAULTS });

    expect(result.success).toBe(false);
  });

  it("rejects a source of nothing but whitespace", () => {
    const result = customHtmlSchema.safeParse({
      ...CUSTOM_HTML_DEFAULTS,
      sursa: "   \n  ",
    });

    expect(result.success).toBe(false);
  });

  it("accepts a source that is only a script", () => {
    const result = customHtmlSchema.safeParse({
      ...CUSTOM_HTML_DEFAULTS,
      sursa: "<script>void 0;</script>",
    });

    expect(result.success).toBe(true);
  });
});
