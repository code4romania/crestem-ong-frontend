import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { SiteChrome } from "@/components/features/navigation/SiteChrome";
import {
  getCurrentUser,
  getDashboardPathForRole,
} from "@/lib/api/session-server";
import { userDisplayName } from "@/lib/api/auth";
import type { NavUser } from "@/components/features/navigation/types";
import { listMenus, type MenuItem } from "@/lib/api/menus";
import { getFooter, type FooterContent } from "@/lib/api/footer";
import "./globals.css";

const EMPTY_FOOTER: FooterContent = {
  description: "",
  copyright: "",
  socials: [],
};

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
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
      className={`${inter.variable} ${plusJakartaSans.variable} h-full antialiased`}
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
      </body>
    </html>
  );
}
