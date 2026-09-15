import { describe, expect, it } from "vitest";
import { sanitizeBlocks } from "./page-blocks-sanitize";
import type { PageBlock } from "./pages-types";

const DIRTY = '<p>ok</p><script>alert(1)</script><a href="javascript:alert(1)">x</a>';
const CLEAN = "<p>ok</p><a>x</a>";

describe("sanitizeBlocks", () => {
  it("cleans the rich-text block's `continut`", () => {
    const out = sanitizeBlocks([
      { id: "1", type: "rich-text", data: { titlu: "T", continut: DIRTY } },
    ]);
    expect((out[0].data as { continut: string }).continut).toBe(CLEAN);
  });

  it("cleans `text` on callout and image-text", () => {
    const out = sanitizeBlocks([
      { id: "1", type: "callout", data: { text: DIRTY } },
      { id: "2", type: "image-text", data: { text: DIRTY } },
    ]);
    expect((out[0].data as { text: string }).text).toBe(CLEAN);
    expect((out[1].data as { text: string }).text).toBe(CLEAN);
  });

  it("recurses into a section's children", () => {
    const out = sanitizeBlocks([
      {
        id: "s",
        type: "section",
        data: { blocuri: [{ id: "1", type: "rich-text", data: { continut: DIRTY } }] },
      },
    ]);
    const child = (out[0].data as { blocuri: PageBlock[] }).blocuri[0];
    expect((child.data as { continut: string }).continut).toBe(CLEAN);
  });

  it("recurses into every column of a columns block", () => {
    const out = sanitizeBlocks([
      {
        id: "c",
        type: "columns",
        data: {
          coloane: [
            { blocuri: [{ id: "1", type: "callout", data: { text: DIRTY } }] },
            { blocuri: [{ id: "2", type: "callout", data: { text: DIRTY } }] },
          ],
        },
      },
    ]);
    const { coloane } = out[0].data as { coloane: { blocuri: PageBlock[] }[] };
    expect((coloane[0].blocuri[0].data as { text: string }).text).toBe(CLEAN);
    expect((coloane[1].blocuri[0].data as { text: string }).text).toBe(CLEAN);
  });

  it("leaves custom-html untouched — staff-authored markup is deliberate", () => {
    const html = "<div onclick=\"x()\">raw</div>";
    const out = sanitizeBlocks([{ id: "1", type: "custom-html", data: { html } }]);
    expect((out[0].data as { html: string }).html).toBe(html);
  });

  it("passes through blocks and fields it does not know", () => {
    const blocks: PageBlock[] = [{ id: "1", type: "spacer", data: { inaltime: "mare" } }];
    expect(sanitizeBlocks(blocks)).toEqual(blocks);
  });

  it("does not mutate the input", () => {
    const data = { continut: DIRTY };
    sanitizeBlocks([{ id: "1", type: "rich-text", data }]);
    expect(data.continut).toBe(DIRTY);
  });
});
