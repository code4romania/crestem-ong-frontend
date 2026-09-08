"use client";

import type { HeroCenteredData } from "./schema";

type Background = HeroCenteredData["background"];

/** Small preview swatch shown inside each card. */
const SWATCH_STYLE: Record<Background, React.CSSProperties> = {
  default: { background: "#ffffff", border: "1px solid #e2e8f0" },
  light: { background: "#eefaf4", border: "1px solid rgba(45,190,143,0.45)" },
  accent: { background: "#162040" },
  imagine: { background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" },
};

const OPTIONS: { value: Background; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "light", label: "Light" },
  { value: "accent", label: "Accent" },
  { value: "imagine", label: "Imagine" },
];

/**
 * The "Fundal" field for Hero – Centered: a 4-up grid of swatch cards, the
 * selected one outlined in blue. Feature-specific, so co-located with the block.
 */
export function BackgroundPicker({
  value,
  onChange,
}: {
  value: Background;
  onChange: (next: Background) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Fundal" className="grid grid-cols-4 gap-3">
      {OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={`flex flex-col items-center gap-3 rounded-2xl border-2 px-4 py-4 transition-colors ${
              selected
                ? "border-[#2563eb] bg-[#eef1fd]"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <span
              className="h-9 w-16 rounded-full shadow-sm"
              style={SWATCH_STYLE[option.value]}
            />
            <span
              className={`text-sm font-semibold ${
                selected ? "text-[#162040]" : "text-[#475569]"
              }`}
            >
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
