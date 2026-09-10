import { describe, expect, it } from "vitest";
import { splitHtmlSource } from "./split";

describe("splitHtmlSource", () => {
  it("moves <style> contents into css and drops the tag from html", () => {
    const result = splitHtmlSource(
      '<div class="a">salut</div><style>.a { color: red; }</style>',
    );

    expect(result.css).toBe(".a { color: red; }");
    expect(result.html).toBe('<div class="a">salut</div>');
  });

  it("moves an inline <script> into scripturi and drops the tag from html", () => {
    const result = splitHtmlSource(
      "<p>text</p><script>console.log('salut');</script>",
    );

    expect(result.scripturi).toEqual([{ cod: "console.log('salut');" }]);
    expect(result.html).toBe("<p>text</p>");
  });

  it("keeps a <script src> as a src entry rather than as code", () => {
    const result = splitHtmlSource(
      '<p>text</p><script src="https://cdn.brevo.com/js/sdk-loader.js" async></script>',
    );

    expect(result.scripturi).toEqual([
      { src: "https://cdn.brevo.com/js/sdk-loader.js" },
    ]);
    expect(result.html).toBe("<p>text</p>");
  });
});

describe("splitHtmlSource, inline SVG", () => {
  /**
   * The Legixplore markup carries inline logos whose fills live in a
   * `<defs><style>` — and several of them reuse `.cls-1` with a different
   * colour. Hoisting those into the block's stylesheet would make the last
   * logo's palette win everywhere.
   */
  it("leaves a <style> inside an inline <svg> where it is", () => {
    const svg =
      '<svg viewBox="0 0 10 10"><defs><style>.cls-1{fill:#00D495}</style></defs><path class="cls-1" d="M0 0h10v10H0z"/></svg>';

    const result = splitHtmlSource(`${svg}<style>.b{color:blue}</style>`);

    expect(result.html).toBe(svg);
    expect(result.css).toBe(".b{color:blue}");
  });

  it("leaves a <script> inside an inline <svg> where it is", () => {
    const svg = '<svg viewBox="0 0 10 10"><script>void 0;</script></svg>';

    const result = splitHtmlSource(svg);

    expect(result.html).toBe(svg);
    expect(result.scripturi).toEqual([]);
  });
});

describe("splitHtmlSource, ordering and no-ops", () => {
  it("keeps scripts in the order they appeared", () => {
    const result = splitHtmlSource(
      '<script>one();</script><div></div><script src="/two.js"></script><script>three();</script>',
    );

    expect(result.scripturi).toEqual([
      { cod: "one();" },
      { src: "/two.js" },
      { cod: "three();" },
    ]);
  });

  it("returns the markup untouched when there is nothing to split out", () => {
    const result = splitHtmlSource("<section><h2>Titlu</h2></section>");

    expect(result).toEqual({
      html: "<section><h2>Titlu</h2></section>",
      css: "",
      scripturi: [],
    });
  });
});

describe("splitHtmlSource, missing source", () => {
  /**
   * The builder's preview renders blocks straight from stored data, without
   * running them through their schema first — so a block saved under an older
   * shape reaches here with no source at all.
   */
  it("returns empty parts when the source is not a string", () => {
    const result = splitHtmlSource(undefined as unknown as string);

    expect(result).toEqual({ html: "", css: "", scripturi: [] });
  });
});
