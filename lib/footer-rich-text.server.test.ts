import { describe, expect, it } from "vitest";
import { sanitizeFooterRichText } from "./footer-rich-text.server";

describe("sanitizeFooterRichText", () => {
  it("keeps the shared rich-text tags", () => {
    const html = "<p>a<strong>b</strong></p><ul><li>c</li></ul>";
    expect(sanitizeFooterRichText(html)).toBe(html);
  });

  it("keeps an uploaded image with its alt and width", () => {
    const html = '<img src="https://cdn.ro/a.png" alt="A" width="280" />';
    expect(sanitizeFooterRichText(html)).toBe(html);
  });

  it("keeps a site-relative image src", () => {
    const html = '<img src="/uploads/a.png" alt="A" />';
    expect(sanitizeFooterRichText(html)).toBe(html);
  });

  it("drops a data: image src while keeping the element", () => {
    const out = sanitizeFooterRichText('<img src="data:image/png;base64,AAA" alt="A" />');
    expect(out).not.toContain("data:");
    expect(out).toContain("<img");
  });

  it("drops a javascript: href", () => {
    expect(sanitizeFooterRichText('<a href="javascript:alert(1)">x</a>')).toBe("<a>x</a>");
  });

  it("strips script content and event handlers", () => {
    expect(sanitizeFooterRichText('<script>alert(1)</script><p onclick="x()">a</p>')).toBe(
      "<p>a</p>",
    );
  });
});
