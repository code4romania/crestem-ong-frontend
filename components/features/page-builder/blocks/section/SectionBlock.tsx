import { getMediaUrl } from "@/lib/api/client";
import { BLOCK_REGISTRY } from "../../registry";
import type { SectionData } from "./schema";

const NAVY_BG = "#162040";

/** Full literal classes so the Tailwind scanner picks them up. */
const PT_CLASS: Record<SectionData["spatiereSus"], string> = {
  mica: "pt-8",
  standard: "pt-16",
  mare: "pt-24",
  "foarte-mare": "pt-36",
};

const PB_CLASS: Record<SectionData["spatiereJos"], string> = {
  mica: "pb-8",
  standard: "pb-16",
  mare: "pb-24",
  "foarte-mare": "pb-36",
};

const WIDTH_CLASS: Record<SectionData["latimeContinut"], string> = {
  compacta: "max-w-3xl",
  standard: "max-w-5xl",
  lata: "max-w-7xl",
  full: "max-w-none",
};

/**
 * "Structure – Section" — a full-bleed band (colour or image background) that
 * wraps an ordered list of child blocks, with independent top / bottom spacing
 * and a configurable inner content width. `numeIntern` is CMS-only and never
 * rendered. Pure (no hooks, no `"use client"`).
 *
 * Child blocks are resolved through `BLOCK_REGISTRY`, which creates a benign
 * import cycle with `registry.ts` — safe because the registry is only read at
 * render time, after every module has finished evaluating.
 */
export function SectionBlock({ data }: { data: SectionData }) {
  const {
    fundal,
    imagine,
    overlay,
    latimeContinut,
    spatiereSus,
    spatiereJos,
    idSectiune,
    blocuri,
  } = data;

  const hasImage = fundal === "imagine" && imagine !== null;

  const sectionStyle: React.CSSProperties = hasImage
    ? {
        backgroundImage: `url(${getMediaUrl(imagine.url)})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : fundal === "accent"
      ? { background: NAVY_BG }
      : fundal === "light"
        ? { background: "#eefaf4" }
        : { background: "#ffffff" };

  const first = blocuri[0];
  const last = blocuri[blocuri.length - 1];
  const skipTopPad = first ? BLOCK_REGISTRY[first.type]?.fullBleed : false;
  const skipBottomPad = last ? BLOCK_REGISTRY[last.type]?.fullBleed : false;

  return (
    <section
      id={idSectiune || undefined}
      className="relative overflow-hidden"
      style={sectionStyle}
    >
      {hasImage && overlay ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: "rgba(13,27,53,0.6)" }}
        />
      ) : null}

      {blocuri.length > 0 ? (
        <div
          className={`relative flex flex-col gap-8 ${
            skipTopPad ? "" : PT_CLASS[spatiereSus]
          } ${skipBottomPad ? "" : PB_CLASS[spatiereJos]}`}
        >
          {blocuri.map((child) => {
            const definition = BLOCK_REGISTRY[child.type];
            if (!definition) return null;
            const { Renderer } = definition;

            if (definition.fullBleed) {
              return <Renderer key={child.id} data={child.data} />;
            }
            return (
              <div
                key={child.id}
                className={`mx-auto w-full px-6 ${WIDTH_CLASS[latimeContinut]}`}
              >
                <Renderer data={child.data} />
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
