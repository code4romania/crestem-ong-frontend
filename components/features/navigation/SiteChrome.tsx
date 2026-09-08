"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import type { NavUser } from "./types";
import { PageTransition } from "@/components/ui/PageTransition";
import type { FooterContent } from "@/lib/api/footer-types";
import type { MenuItem } from "@/lib/api/menus";

export function SiteChrome({
  children,
  user,
  headerItems,
  footerItems,
  footerContent,
}: {
  children: React.ReactNode;
  user: NavUser | null;
  headerItems: MenuItem[];
  footerItems: MenuItem[];
  footerContent: FooterContent;
}) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard") ?? false;

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar user={user} items={headerItems} />
      <main className="flex-1 pt-16">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer content={footerContent} items={footerItems} />
    </>
  );
}
