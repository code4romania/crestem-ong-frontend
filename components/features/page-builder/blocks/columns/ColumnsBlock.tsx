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
 * column is its own content width, so children ignore the `fullBleed` flag here
 * and have their wrapper max-width / side padding stripped (every block renders
 * `section > div.mx-auto.max-w-* px-6`), so they fill the column edge to edge.
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
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Column gap only: each child block already carries its own py-8
            top/bottom padding as vertical rhythm (see BlockRenderer, which
            stacks top-level blocks with no extra gap). Adding a row gap here
            would double up with that padding once columns collapse to one on
            mobile. Below md, a later column's own top py-8 still meets the
            previous column's bottom py-8, so pull it up by one py-8's worth
            (-mt-8) to leave a single, tighter gap instead of two stacked. */}
        <div className={`grid gap-x-8 ${gridClass} [&>*+*]:-mt-8 md:[&>*+*]:mt-0`}>
          {columns.map((column, index) => (
            <div key={index} className={`flex min-w-0 flex-col gap-8 [&>section>div]:max-w-none [&>section>div]:px-0 ${spanFor(index)}`}>
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
