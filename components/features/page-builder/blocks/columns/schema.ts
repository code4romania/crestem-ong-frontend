import { z } from "zod";

/**
 * A placed child block. Only the envelope is validated here — each child's own
 * `data` is checked by its block definition's `parse` when it is added, exactly
 * like a top-level block. Mirrors the identical shape in `blocks/section`.
 */
const childBlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.unknown(),
});

/**
 * One column: an ordered list of child blocks. Columns are positional — they
 * never reorder and carry no id — so the editor keys them by index.
 */
const columnSchema = z.object({
  blocuri: z.array(childBlockSchema).default([]),
});

export const columnsSchema = z.object({
  numarColoane: z.enum(["2", "3"]).default("2"),
  /** Only meaningful when `numarColoane === "2"`. Remembered across a 3-col detour. */
  proportie: z
    .enum(["50-50", "40-60", "60-40", "33-67", "67-33"])
    .default("50-50"),
  coloane: z.array(columnSchema).default([]),
});

export type ColumnsData = z.infer<typeof columnsSchema>;
export type Column = z.infer<typeof columnSchema>;
export type ColumnChild = Column["blocuri"][number];
export type NumarColoane = ColumnsData["numarColoane"];
export type Proportie = ColumnsData["proportie"];

const makeColumn = (): Column => ({ blocuri: [] });

/**
 * Always valid — an empty Columns block is a legitimate state (the canvas shows a
 * placeholder per column). Children are added on the canvas, not in the config
 * drawer, exactly like Section.
 */
export const COLUMNS_DEFAULTS: ColumnsData = {
  numarColoane: "2",
  proportie: "50-50",
  coloane: [makeColumn(), makeColumn()],
};

/** The ratio picker options, in the order the drawer lists them. */
export const PROPORTIE_OPTIONS: {
  value: Proportie;
  label: string;
  /** Relative flex weights for the two preview bars. */
  ratio: [number, number];
}[] = [
  { value: "50-50", label: "50 / 50", ratio: [1, 1] },
  { value: "40-60", label: "40 / 60", ratio: [2, 3] },
  { value: "60-40", label: "60 / 40", ratio: [3, 2] },
  { value: "33-67", label: "33 / 67", ratio: [1, 2] },
  { value: "67-33", label: "67 / 33", ratio: [2, 1] },
];

/** Full literal classes so the Tailwind scanner picks them up. */
export const COLUMNS_GRID_CLASS: Record<Proportie, string> = {
  "50-50": "md:grid-cols-2",
  "40-60": "md:grid-cols-5",
  "60-40": "md:grid-cols-5",
  "33-67": "md:grid-cols-3",
  "67-33": "md:grid-cols-3",
};

export const COLUMNS_SPAN_CLASS: Record<Proportie, [string, string]> = {
  "50-50": ["md:col-span-1", "md:col-span-1"],
  "40-60": ["md:col-span-2", "md:col-span-3"],
  "60-40": ["md:col-span-3", "md:col-span-2"],
  "33-67": ["md:col-span-1", "md:col-span-2"],
  "67-33": ["md:col-span-2", "md:col-span-1"],
};

export function columnCountFor(numarColoane: NumarColoane): 2 | 3 {
  return numarColoane === "3" ? 3 : 2;
}

/** Short canvas-header summary, e.g. `2 coloane · 33/67` or `3 coloane · egale`. */
export function columnsSummary(data: ColumnsData): string {
  const count = columnCountFor(data.numarColoane);
  if (count === 3) return "3 coloane · egale";
  return `2 coloane · ${data.proportie.replace("-", "/")}`;
}

/**
 * Resize `coloane` to match a new column count. Growing appends empty columns;
 * shrinking appends the dropped columns' blocks to the last kept column so no
 * content is lost silently.
 */
export function applyColumnCount(
  data: ColumnsData,
  next: NumarColoane,
): ColumnsData {
  const target = columnCountFor(next);
  const current = data.coloane.length > 0 ? data.coloane : [makeColumn()];

  if (current.length === target) {
    return { ...data, numarColoane: next, coloane: current };
  }

  if (target > current.length) {
    const added = Array.from({ length: target - current.length }, makeColumn);
    return { ...data, numarColoane: next, coloane: [...current, ...added] };
  }

  const kept = current.slice(0, target);
  const dropped = current.slice(target);
  const lastIndex = target - 1;
  const merged: Column = {
    blocuri: [
      ...kept[lastIndex].blocuri,
      ...dropped.flatMap((column) => column.blocuri),
    ],
  };
  return {
    ...data,
    numarColoane: next,
    coloane: [...kept.slice(0, lastIndex), merged],
  };
}
