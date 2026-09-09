"use client";

import { AssetCard } from "./AssetCard";
import type { MediaAssetCard as Asset } from "@/lib/api/media-library-types";

export function AssetGrid({
  assets,
  selectedIds,
  onSelect,
  emptyLabel = "Niciun fișier găsit.",
}: {
  assets: Asset[];
  selectedIds?: Set<string>;
  onSelect: (asset: Asset) => void;
  emptyLabel?: string;
}) {
  if (assets.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-5 py-12 text-center">
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {assets.map((asset) => (
        <AssetCard
          key={asset.documentId}
          asset={asset}
          selected={selectedIds?.has(asset.documentId)}
          onClick={() => onSelect(asset)}
        />
      ))}
    </div>
  );
}
