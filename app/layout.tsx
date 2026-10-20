import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import { Toaster } from "sonner";
import { SiteChrome } from "@/components/features/navigation/SiteChrome";
import { PirschAnalytics } from "@/components/features/analytics/PirschAnalytics";
import {
  getCurrentUser,
  getDashboardPathForRole,
} from "@/lib/api/session-server";
import { userDisplayName } from "@/lib/api/auth";
import type { NavUser } from "@/components/features/navigation/types";
import { listMenus, type MenuItem } from "@/lib/api/menus";
import { SITE_URL } from "@/lib/site";
import { getFooter, type FooterContent } from "@/lib/api/footer";
import "./globals.css";

const EMPTY_FOOTER: FooterContent = {
  description: "",
  copyright: "",
  socials: [],
};

// Variable font: headlines use ExtraBold (800), subheadlines Semibold (600),
// body Regular (400). latin-ext carries the Romanian ș/ț glyphs.
const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  // Link previews need absolute image URLs; Next builds them from this base.
  metadataBase: new URL(SITE_URL),
  title: "Crestem ONG",
  description:
    "Crestem este platforma care reunește resurse, instrumente juridice, programe de accelerare și o comunitate vibrantă pentru toți cei care construiesc schimbarea în România.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  let navUser: NavUser | null = null;
  try {
    const currentUser = await getCurrentUser();
    const dashboardHref = currentUser
      ? getDashboardPathForRole(currentUser.role?.type)
      : null;
    if (currentUser && dashboardHref) {
      navUser = { nume: userDisplayName(currentUser), dashboardHref };
    }
  } catch {
    navUser = null;
  }

  // The chrome is editable content, so a backend hiccup must not take the whole
  // site down with it: the page still renders, with an empty header and footer.
  let headerItems: MenuItem[] = [];
  let footerItems: MenuItem[] = [];
  let footerContent: FooterContent = EMPTY_FOOTER;
  try {
    const [menus, footer] = await Promise.all([listMenus(), getFooter()]);
    headerItems = menus.find((menu) => menu.location === "header")?.items ?? [];
    footerItems = menus.find((menu) => menu.location === "footer")?.items ?? [];
    footerContent = footer;
  } catch {
    // Falls through to the empty defaults above.
  }

  return (
    <html
      lang="ro"
      className={`${interTight.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteChrome
          user={navUser}
          headerItems={headerItems}
          footerItems={footerItems}
          footerContent={footerContent}
        >
          {children}
        </SiteChrome>
        <Toaster richColors closeButton position="top-center" />
        <PirschAnalytics />
      </body>
    </html>
  );
}
