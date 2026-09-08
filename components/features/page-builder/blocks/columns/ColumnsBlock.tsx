import { BLOCK_REGISTRY } from "../../registry";
import {
  COLUMNS_GRID_CLASS,
  COLUMNS_SPAN_CLASS,
  columnCountFor,
  type ColumnsData,
} from "./schema";

/**
 * "Structure – Columns" — a two- or three-column layout that wraps child blocks
 * and collapses to a single column below `md`. Each column stacks its blocks
 * vertically. Pure (no hooks, no `"use client"`).
 *
 * Child blocks are resolved through `BLOCK_REGISTRY` (a benign import cycle with
 * `registry.ts`, safe because the registry is only read at render time). A
 * column is its own content width, so children ignore the `fullBleed` flag here.
 */
export function ColumnsBlock({ data }: { data: ColumnsData }) {
  const count = columnCountFor(data.numarColoane);
  const columns = data.coloane.slice(0, count);

  if (columns.every((column) => column.blocuri.length === 0)) return null;

  const gridClass =
    count === 3 ? "md:grid-cols-3" : COLUMNS_GRID_CLASS[data.proportie];
  const spanFor = (index: number): string => {
    if (count === 3) return "md:col-span-1";
    return COLUMNS_SPAN_CLASS[data.proportie][index] ?? "md:col-span-1";
  };

  return (
    <section>
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className={`grid gap-8 ${gridClass}`}>
          {columns.map((column, index) => (
            <div key={index} className={`flex flex-col gap-8 ${spanFor(index)}`}>
              {column.blocuri.map((child) => {
                const definition = BLOCK_REGISTRY[child.type];
                if (!definition) return null;
                const { Renderer } = definition;
                return <Renderer key={child.id} data={child.data} />;
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
