"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LinkPendingIndicator } from "@/components/ui/LinkPendingIndicator";
import type { MenuItem } from "@/lib/api/menus";
import { NavDropdown } from "./NavDropdown";

export function NavLinks({ items }: { items: MenuItem[] }) {
  const pathname = usePathname();

  return (
    <>
      {items.map((item) => {
        // Children make it a dropdown; without them it is a plain link, and the
        // schema guarantees such an item has an address.
        if (item.children.length > 0) {
          return <NavDropdown key={item.label} label={item.label} items={item.children} />;
        }
        if (!item.url) return null;

        const isActive = pathname === item.url;
        return (
          <Link
            key={item.label}
            href={item.url}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive
                ? "text-foreground bg-muted font-semibold"
                : "text-muted-foreground font-medium hover:text-foreground hover:bg-muted"
            }`}
          >
            {item.label}
            <LinkPendingIndicator />
          </Link>
        );
      })}
    </>
  );
}
