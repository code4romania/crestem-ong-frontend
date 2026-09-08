"use client";

import type { HeroIntroData } from "./schema";

type Background = HeroIntroData["background"];

/** Small preview swatch shown inside each card. */
const SWATCH_STYLE: Record<Background, React.CSSProperties> = {
  default: { background: "#ffffff", border: "1px solid #e2e8f0" },
  light: { background: "#eefaf4", border: "1px solid rgba(45,190,143,0.45)" },
  accent: { background: "#162040" },
};

const OPTIONS: { value: Background; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "light", label: "Light" },
  { value: "accent", label: "Accent" },
];

/**
 * The "Fundal" field for Hero – Intro: a 3-up grid of swatch cards, the selected
 * one outlined in blue. Colour-only (no image background), so co-located with the
 * block rather than shared with Hero – Centered.
 */
export function BackgroundPicker({
  value,
  onChange,
}: {
  value: Background;
  onChange: (next: Background) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Fundal" className="grid grid-cols-3 gap-3">
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
