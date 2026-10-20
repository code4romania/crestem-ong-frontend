import { describe, expect, it } from "vitest";
import { hasRichText, toRichTextHtml } from "./has-rich-text";

describe("toRichTextHtml", () => {
  it("passes editor HTML through unchanged", () => {
    const html = "<p>a <strong>b</strong></p><ul><li>c</li></ul>";
    expect(toRichTextHtml(html)).toBe(html);
  });

  it("wraps legacy plain text, keeping its line breaks", () => {
    expect(toRichTextHtml("a\nb\n\nc")).toBe("<p>a<br />b</p><p>c</p>");
  });

  it("escapes markup in legacy plain text", () => {
    expect(toRichTextHtml('I <3 "ONG" & co')).toBe(
      "<p>I &lt;3 &quot;ONG&quot; &amp; co</p>",
    );
  });

  it("leaves an empty value empty", () => {
    expect(toRichTextHtml("")).toBe("");
    expect(hasRichText(toRichTextHtml("  "))).toBe(false);
  });

  it("treats the editor's empty document as empty", () => {
    expect(hasRichText("<p></p>")).toBe(false);
  });
});
