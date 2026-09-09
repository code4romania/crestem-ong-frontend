import { describe, expect, it } from "vitest";
import { toPickedFiles } from "./MediaLibraryPicker";
import type { MediaAssetCard } from "@/lib/api/media-library-types";

const card: MediaAssetCard = {
  documentId: "asset_doc_1",
  titlu: "Sigla FDSC",
  tip: "image",
  utilizariCount: 3,
  etichete: [{ id: 1, documentId: "tag_doc_1", nume: "logo", slug: "logo" }],
  fisier: {
    id: 42,
    url: "/uploads/sigla_fdsc.png",
    name: "sigla_fdsc.png",
    mime: "image/png",
    ext: ".png",
    size: 12345,
    alternativeText: "Sigla Fundației",
    width: 800,
    height: 240,
  },
};

describe("toPickedFiles", () => {
  it("maps a card to exactly the block-file fields", () => {
    expect(toPickedFiles([card])).toEqual([
      {
        id: 42,
        url: "/uploads/sigla_fdsc.png",
        name: "sigla_fdsc.png",
        ext: ".png",
        size: 12345,
        alternativeText: "Sigla Fundației",
      },
    ]);
  });

  it("drops everything that is not a picked-file field", () => {
    const [picked] = toPickedFiles([card]);
    expect(Object.keys(picked).sort()).toEqual(
      ["alternativeText", "ext", "id", "name", "size", "url"].sort(),
    );
    expect(picked).not.toHaveProperty("documentId");
    expect(picked).not.toHaveProperty("titlu");
    expect(picked).not.toHaveProperty("tip");
    expect(picked).not.toHaveProperty("etichete");
    expect(picked).not.toHaveProperty("utilizariCount");
    expect(picked).not.toHaveProperty("mime");
    expect(picked).not.toHaveProperty("width");
  });

  it("carries a null alternativeText through", () => {
    expect(
      toPickedFiles([{ ...card, fisier: { ...card.fisier, alternativeText: null } }])[0]
        .alternativeText,
    ).toBeNull();
  });
});
