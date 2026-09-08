"use client";

import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, Search, X } from "lucide-react";
import { ModalOverlay } from "@/components/ui/ModalOverlay";
import {
  BLOCK_REGISTRY,
  CATEGORY_DOT,
  CATEGORY_ICON,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  UPCOMING_BLOCKS,
} from "./registry";
import type { BlockCategory, BlockDefinition } from "./types";

interface Card {
  key: string;
  name: string;
  description: string;
  category: BlockCategory;
  definition?: BlockDefinition;
}

function cardsForCategory(
  category: BlockCategory,
  excludeTypes: string[] = [],
): Card[] {
  const working: Card[] = Object.values(BLOCK_REGISTRY)
    .filter(
      (block) =>
        block.category === category && !excludeTypes.includes(block.type),
    )
    .map((definition) => ({
      key: definition.type,
      name: definition.name,
      description: definition.description,
      category,
      definition,
    }));
  const upcoming: Card[] = UPCOMING_BLOCKS.filter(
    (block) =>
      block.category === category &&
      !excludeTypes.includes(block.name.toLowerCase()),
  ).map((block) => ({
    key: `${block.category}:${block.name}`,
    name: block.name,
    description: block.description,
    category: block.category,
  }));
  return [...working, ...upcoming];
}

export function AddBlockModal({
  onSelect,
  onClose,
  excludeTypes,
}: {
  onSelect: (type: string) => void;
  onClose: () => void;
  /** Block types to hide from the picker — e.g. the container types when adding
   *  inside a container, so containers stay top-level and never nest. */
  excludeTypes?: string[];
}) {
  const [activeCategory, setActiveCategory] = useState<BlockCategory>("hero");
  const [query, setQuery] = useState("");
  const excludeKey = (excludeTypes ?? []).join(",");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const trimmedQuery = query.trim().toLowerCase();

  const visibleCards = useMemo(() => {
    const exclude = excludeKey ? excludeKey.split(",") : [];
    if (!trimmedQuery) return cardsForCategory(activeCategory, exclude);
    return CATEGORY_ORDER.flatMap((category) =>
      cardsForCategory(category, exclude),
    ).filter(
      (card) =>
        card.name.toLowerCase().includes(trimmedQuery) ||
        card.description.toLowerCase().includes(trimmedQuery),
    );
  }, [activeCategory, trimmedQuery, excludeKey]);

  return (
    <ModalOverlay labelledBy="add-block-title">
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl bg-white">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <h2
            id="add-block-title"
            className="font-heading text-lg font-extrabold text-[#162040]"
          >
            Adaugă bloc de conținut
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Închide"
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          <nav className="w-44 shrink-0 overflow-y-auto border-r border-border p-3">
            <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-[#94a3b8]">
              Categorii
            </p>
            <ul className="space-y-0.5">
              {CATEGORY_ORDER.map((category) => {
                const active = category === activeCategory && !trimmedQuery;
                return (
                  <li key={category}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCategory(category);
                        setQuery("");
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors ${
                        active
                          ? "bg-[#eff6ff] text-[#2563eb]"
                          : "text-[#475569] hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: CATEGORY_DOT[category] }}
                      />
                      {CATEGORY_LABELS[category]}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex min-w-0 flex-1 flex-col overflow-y-auto p-5">
            <div className="relative mb-4">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Caută bloc..."
                aria-label="Caută bloc"
                className="w-full rounded-xl border border-border py-2.5 pl-9 pr-4 text-sm transition-colors focus:border-[#2dbe8f] focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30"
              />
            </div>

            {visibleCards.length === 0 ? (
              <p className="px-1 py-8 text-center text-sm text-muted-foreground">
                {trimmedQuery
                  ? "Niciun bloc nu corespunde căutării."
                  : "Blocuri în curând pentru această categorie."}
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {visibleCards.map((card) => {
                  const Icon = card.definition?.icon ?? LayoutGrid;
                  const chip = CATEGORY_ICON[card.category];
                  if (!card.definition) {
                    return (
                      <div
                        key={card.key}
                        aria-disabled
                        className="flex cursor-not-allowed gap-3 rounded-xl border border-border p-4 opacity-60"
                      >
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                          style={{ background: chip.bg, color: chip.fg }}
                        >
                          <Icon size={18} />
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[#162040]">
                              {card.name}
                            </span>
                            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[#94a3b8]">
                              în curând
                            </span>
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {card.description}
                          </span>
                        </span>
                      </div>
                    );
                  }
                  const type = card.definition.type;
                  return (
                    <button
                      key={card.key}
                      type="button"
                      onClick={() => onSelect(type)}
                      className="flex gap-3 rounded-xl border border-border p-4 text-left transition-colors hover:border-[#2dbe8f] hover:bg-[#f0fdf9]"
                    >
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: chip.bg, color: chip.fg }}
                      >
                        <Icon size={18} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-[#162040]">
                          {card.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {card.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}
