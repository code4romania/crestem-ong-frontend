"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { LinkPendingIndicator } from "@/components/ui/LinkPendingIndicator";
import type { MenuChild } from "@/lib/api/menus";

/**
 * A top-level entry that carries sub-elements. Which entries these are is the
 * editor's choice now — any menu item with children renders as a dropdown.
 */
export function NavDropdown({ label, items }: { label: string; items: MenuChild[] }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  // Storing the pathname the menu was opened on (instead of a boolean) closes
  // it automatically once navigation completes — so a clicked item keeps
  // showing its pending spinner until the new page is actually there.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt !== null && openedAt === pathname;

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenedAt(null);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpenedAt(open ? null : pathname)}
        aria-expanded={open}
        className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors ${open ? "text-foreground bg-muted font-semibold" : "text-muted-foreground font-medium hover:text-foreground hover:bg-muted"}`}
      >
        {label}
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-1.5 min-w-44 rounded-xl border border-border bg-white shadow-lg overflow-hidden z-50"
          style={{ boxShadow: "0 8px 32px rgba(22,32,64,0.12)" }}
        >
          {/* An entry without an address is one whose page was deleted; the
              editor flags it, visitors simply do not see it. */}
          {items.map((item) => (item.url ? (
            <Link
              key={`${item.label}-${item.url}`}
              href={item.url}
              onClick={() => {
                if (item.url === pathname) setOpenedAt(null);
              }}
              className="flex items-center justify-between gap-2 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
            >
              {item.label}
              <LinkPendingIndicator />
            </Link>
          ) : null))}
        </div>
      )}
    </div>
  );
}
