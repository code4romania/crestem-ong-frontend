import { BLOCK_REGISTRY } from "@/components/features/page-builder/registry";
import type { PageBlock } from "@/lib/api/pages-types";

/**
 * Renders a stored block tree through the same definitions the editor uses.
 *
 * Each block is parsed with its own schema first and skipped when it fails.
 * The backend only validates the envelope, so a block saved before its shape
 * changed would otherwise throw — and inside a Server Component that takes the
 * whole page down, not just the block.
 */
export function BlockRenderer({ blocks }: { blocks: PageBlock[] }) {
  return (
    <>
      {blocks.map((block) => {
        const definition = BLOCK_REGISTRY[block.type];
        if (!definition) return null;

        const parsed = definition.parse(block.data);
        if (!parsed.success) return null;

        const Renderer = definition.Renderer as React.ComponentType<{ data: unknown }>;
        return <Renderer key={block.id} data={parsed.data} />;
      })}
    </>
  );
}
