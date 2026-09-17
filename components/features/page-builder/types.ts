import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import type { ZodType } from "zod";
import { z } from "zod";

/**
 * The block-library categories shown in the "Adaugă bloc de conținut" modal
 * sidebar. Only `hero` has a working block in pass A; the rest render as
 * empty/disabled sections.
 */
export type BlockCategory =
  | "hero"
  | "text"
  | "images"
  | "media"
  | "cards"
  | "dynamic"
  | "structure";

/** Field-keyed validation messages, produced from a block schema's zod errors. */
export type BlockFieldErrors = Record<string, string>;

/**
 * Imperative escape hatch for an editor that keeps a draft-of-a-draft (e.g.
 * Feature Cards' per-card sub-form) which only merges into `value` on some
 * internal "save" action. The drawer uses it to fold that nested draft into
 * `value` right before the block-level Save runs, and to warn before a
 * discard that would otherwise drop it silently.
 */
export interface BlockEditorHandle {
  /** Commit any pending nested draft into `value` and return the result (or `value` unchanged if there was nothing pending). */
  flush: () => unknown;
  /** Whether a nested draft is open and differs from where it started. */
  hasUnsavedNestedDraft: () => boolean;
}

export interface BlockEditorProps {
  value: unknown;
  onChange: (next: unknown) => void;
  errors: BlockFieldErrors;
  /** See `BlockEditorHandle`. Optional — most block editors have no nested draft and can ignore it. */
  bindHandle?: (handle: BlockEditorHandle | null) => void;
}

export interface BlockRendererProps {
  data: unknown;
}

export type BlockParseResult =
  | { success: true; data: unknown }
  | { success: false; errors: BlockFieldErrors };

/**
 * Everything the page builder needs to list, configure and render one kind of
 * block. Data-shape generics are erased at this boundary (see `defineBlock`) so
 * the registry can hold every block in one `Record`.
 */
export interface BlockDefinition {
  type: string;
  category: BlockCategory;
  name: string;
  description: string;
  icon: LucideIcon;
  /**
   * Render on the canvas without the card frame (border / radius / white fill).
   * For structural blocks that are themselves just whitespace or a rule, where
   * the frame reads as an empty card — e.g. Spacer, Divider.
   */
  bare: boolean;
  /**
   * When placed inside a Section, render edge-to-edge — no content-width
   * container, no horizontal padding, and (when it is the first/last child) no
   * section top/bottom spacing. For blocks that are their own full-width band,
   * e.g. the hero blocks.
   */
  fullBleed: boolean;
  /**
   * This block wraps child blocks and is edited through a canvas shell instead
   * of its `Renderer` — e.g. Section, Columns. Containers are offered only at
   * the page's top level, never inside another container.
   */
  container: boolean;
  defaults: unknown;
  /** Validate raw block data, returning either parsed data or field errors. */
  parse: (data: unknown) => BlockParseResult;
  Editor: ComponentType<BlockEditorProps>;
  Renderer: ComponentType<BlockRendererProps>;
}

/**
 * One block placed on the page. The ordered array of these mirrors a Strapi
 * dynamic-zone value (`{ __component, ...attributes }` ≡ `{ type, data }`), so
 * a backend can replace the in-memory list without touching any block.
 */
export interface BlockInstance {
  id: string;
  type: string;
  data: unknown;
}

interface DefineBlockConfig<TData> {
  type: string;
  category: BlockCategory;
  name: string;
  description: string;
  icon: LucideIcon;
  /** See `BlockDefinition.bare`. Defaults to `false`. */
  bare?: boolean;
  /** See `BlockDefinition.fullBleed`. Defaults to `false`. */
  fullBleed?: boolean;
  /** See `BlockDefinition.container`. Defaults to `false`. */
  container?: boolean;
  schema: ZodType<TData>;
  defaults: TData;
  Editor: ComponentType<{
    value: TData;
    onChange: (next: TData) => void;
    errors: BlockFieldErrors;
    bindHandle?: (handle: BlockEditorHandle | null) => void;
  }>;
  Renderer: ComponentType<{ data: TData }>;
}

function flattenZodErrors(error: z.ZodError): BlockFieldErrors {
  const { fieldErrors, formErrors } = z.flattenError(error);
  const result: BlockFieldErrors = {};
  for (const [field, messages] of Object.entries(fieldErrors)) {
    const first = (messages as string[] | undefined)?.find(Boolean);
    if (first) result[field] = first;
  }
  if (formErrors.length > 0) result._form = formErrors.filter(Boolean).join(" ");
  return result;
}

/**
 * Build a `BlockDefinition` from a typed schema + typed components. The single
 * `unknown` boundary lives here: `parse` produces data matching the schema, and
 * `defaults` is typed, so the component casts are sound in practice.
 */
export function defineBlock<TData>(
  config: DefineBlockConfig<TData>,
): BlockDefinition {
  const { schema } = config;
  return {
    type: config.type,
    category: config.category,
    name: config.name,
    description: config.description,
    icon: config.icon,
    bare: config.bare ?? false,
    fullBleed: config.fullBleed ?? false,
    container: config.container ?? false,
    defaults: config.defaults,
    parse: (data) => {
      const result = schema.safeParse(data);
      return result.success
        ? { success: true, data: result.data }
        : { success: false, errors: flattenZodErrors(result.error) };
    },
    Editor: config.Editor as unknown as ComponentType<BlockEditorProps>,
    Renderer: config.Renderer as unknown as ComponentType<BlockRendererProps>,
  };
}
