import Link from "next/link";
import { User } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { LinkPendingIndicator } from "@/components/ui/LinkPendingIndicator";
import { NavLinks } from "./NavLinks";
import { MobileMenu } from "./MobileMenu";
import type { MenuItem } from "@/lib/api/menus";
import type { NavUser } from "./types";

export function Navbar({ user, items }: { user: NavUser | null; items: MenuItem[] }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Logo variant="dark" height={28} />
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <NavLinks items={items} />
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span
                className="flex items-center gap-1.5 text-sm font-medium truncate max-w-[160px]"
                style={{ color: "#162040" }}
              >
                <User size={16} className="shrink-0" />
                {user.nume}
              </span>
              <Link
                href={user.dashboardHref}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: "#2dbe8f" }}
              >
                Mergi la dashboard
                <LinkPendingIndicator />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/autentificare"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted"
                style={{ color: "#162040", border: "1.5px solid #e2e8f0" }}
              >
                Intră în cont
                <LinkPendingIndicator />
              </Link>
              <Link
                href="/inregistrare"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: "#2dbe8f" }}
              >
                Înregistrează-te
                <LinkPendingIndicator />
              </Link>
            </>
          )}
        </div>

        <MobileMenu user={user} items={items} />
      </div>
    </nav>
  );
}
