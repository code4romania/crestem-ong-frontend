"use client";

import {
  AUDIENCE_LABEL,
  VISIBILITY_AUDIENCES,
  type VisibilityAudience,
} from "@/lib/api/pages-types";

export function VisibilityField({
  value,
  onChange,
}: {
  value: VisibilityAudience[];
  onChange: (next: VisibilityAudience[]) => void;
}) {
  const toggle = (audience: VisibilityAudience) => {
    onChange(
      value.includes(audience)
        ? value.filter((item) => item !== audience)
        : [...value, audience],
    );
  };

  return (
    <fieldset>
      <legend className="mb-1.5 text-xs font-semibold text-[#475569]">Vizibilitate</legend>
      <div className="grid gap-2 rounded-xl border border-border p-4 sm:grid-cols-3">
        {VISIBILITY_AUDIENCES.map((audience) => (
          <label key={audience} className="flex items-center gap-2 text-sm text-[#162040]">
            <input
              type="checkbox"
              checked={value.includes(audience)}
              onChange={() => toggle(audience)}
              className="h-4 w-4 rounded border-border accent-[#2dbe8f]"
            />
            {AUDIENCE_LABEL[audience]}
          </label>
        ))}
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        „Public” înseamnă vizibilă pentru oricine, inclusiv nelogat. Fără nicio bifă, pagina
        nu poate fi salvată.
      </p>
    </fieldset>
  );
}
