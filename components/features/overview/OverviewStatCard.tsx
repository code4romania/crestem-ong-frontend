import Link from "next/link";
import type { ReactNode } from "react";

interface OverviewStatCardProps {
  label: string;
  value: ReactNode;
  /**
   * `number` for the headline counters, `text` for the smaller word-shaped
   * values (program name, date, course count) on the second row of the grid.
   */
  size?: "number" | "text";
  /** Small line under the value, e.g. `completări`. */
  caption?: string;
  link?: { href: string; label: string };
}

export function OverviewStatCard({
  label,
  value,
  size = "number",
  caption,
  link,
}: OverviewStatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-border p-5 flex flex-col">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={
          size === "number"
            ? "mt-2 text-3xl font-heading font-extrabold text-primary"
            : "mt-2 text-lg font-heading font-bold text-primary"
        }
      >
        {value}
      </p>
      {caption && <p className="mt-1 text-sm text-muted-foreground">{caption}</p>}
      {link && (
        <Link
          href={link.href}
          className="mt-auto pt-4 text-sm font-semibold text-accent-strong hover:underline"
        >
          {link.label} →
        </Link>
      )}
    </div>
  );
}
