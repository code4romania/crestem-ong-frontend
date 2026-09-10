import { describe, expect, it } from "vitest";
import { buildPreviewDocument } from "./preview-document";

const gol = { html: "", css: "", scripturi: [] };

describe("buildPreviewDocument", () => {
  it("puts the stylesheet in the head and the markup in the body", () => {
    const doc = buildPreviewDocument({
      ...gol,
      html: "<p>salut</p>",
      css: ".a{color:red}",
    });

    expect(doc).toContain("<style>.a{color:red}</style>");
    expect(doc.indexOf(".a{color:red}")).toBeLessThan(doc.indexOf("<p>salut</p>"));
  });

  it("opens links in a new tab so the preview cannot navigate itself away", () => {
    expect(buildPreviewDocument({ ...gol, html: "<a href='/x'>x</a>" })).toContain(
      '<base target="_blank">',
    );
  });

  it("re-emits an inline script as a script tag", () => {
    const doc = buildPreviewDocument({
      ...gol,
      scripturi: [{ cod: "console.log(1);" }],
    });

    expect(doc).toContain("<script>console.log(1);</script>");
  });

  /**
   * A closing tag inside the code would end the surrounding element and dump
   * the rest of the script into the page as text.
   */
  it("escapes a closing script tag that appears inside the code", () => {
    const doc = buildPreviewDocument({
      ...gol,
      scripturi: [{ cod: "var s = '</script>';" }],
    });

    expect(doc).not.toContain("'</script>';");
    expect(doc).toContain("<\/script>");
  });

  it("keeps an external script as a src reference", () => {
    const doc = buildPreviewDocument({
      ...gol,
      scripturi: [{ src: "https://cdn.example/a.js" }],
    });

    expect(doc).toContain('<script src="https://cdn.example/a.js"></script>');
  });
});
