import { describe, expect, it } from "vitest";
import { sanitizeRichText } from "./sanitize.server";

describe("sanitizeRichText", () => {
  it("keeps every tag the editor can produce", () => {
    const html =
      "<h2>H</h2><h3>h</h3><p>p<br /><strong>s</strong><em>e</em></p><ul><li>a</li></ul><ol><li>b</li></ol>";
    expect(sanitizeRichText(html)).toBe(html);
  });

  it("drops a script tag together with its content", () => {
    expect(sanitizeRichText("<p>ok</p><script>alert(1)</script>")).toBe("<p>ok</p>");
  });

  it("drops a disallowed tag but keeps its text", () => {
    expect(sanitizeRichText("<div>text</div>")).toBe("text");
  });

  it("strips <img> — the page-builder allowlist has no images", () => {
    expect(sanitizeRichText('<p>a</p><img src="https://x/y.png" />')).toBe("<p>a</p>");
  });

  it("strips event handlers and inline styles", () => {
    expect(sanitizeRichText('<p onerror="x()" style="color:red">a</p>')).toBe("<p>a</p>");
  });

  it("drops a javascript: href but keeps the link text", () => {
    expect(sanitizeRichText('<a href="javascript:alert(1)">x</a>')).toBe("<a>x</a>");
  });

  it("keeps http(s) and site-relative hrefs, with target and rel", () => {
    const html = '<a href="https://x.ro" target="_blank" rel="noopener">x</a>';
    expect(sanitizeRichText(html)).toBe(html);
    expect(sanitizeRichText('<a href="/despre">x</a>')).toBe('<a href="/despre">x</a>');
  });
});
