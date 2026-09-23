"use client";

import { useEffect, useState } from "react";
import Link, { useLinkStatus } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  Layers,
  ClipboardList,
  LayoutGrid,
  FileText,
  BookOpen,
  Menu,
  X,
  Workflow,
  Image as ImageIcon,
  // ListChecks, // E-learning: not implemented yet, nav entries commented out below
  // Plus, // E-learning: not implemented yet, nav entries commented out below
  Building2,
  UserCog,
  Users,
  Settings,
  User,
  Mail,
  // GraduationCap, // E-learning: not implemented yet, nav entries commented out below
  Calendar,
  MessageCircle,
  Loader2,
  Globe,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { LinkPendingIndicator } from "@/components/ui/LinkPendingIndicator";
import { RefreshableLink } from "@/components/ui/RefreshableLink";
import { logoutSession } from "@/lib/api/session";

export interface DashboardNavSection {
  label?: string;
  items: {
    href: string;
    label: string;
    icon: LucideIcon;
    /** Section the item stays highlighted across, when `href` opens a page inside it rather than its root. */
    activePath?: string;
  }[];
}

export const USER_MANAGEMENT_HREF = "/dashboard/utilizatori";

const FDSC_NAV_SECTIONS: DashboardNavSection[] = [
  {
    items: [{ href: "/dashboard", label: "Panou principal", icon: LayoutGrid }],
  },
  {
    label: "CMS",
    items: [
      { href: "/dashboard/pagini", label: "Pagini", icon: FileText },
      { href: "/dashboard/biblioteca", label: "Bibliotecă", icon: BookOpen },
      { href: "/dashboard/meniuri", label: "Meniuri", icon: Menu },
      {
        href: "/dashboard/arbori-decizionali",
        label: "Arbori decizionali",
        icon: Workflow,
      },
      {
        href: "/dashboard/media-library",
        label: "Media library",
        icon: ImageIcon,
      },
    ],
  },
  // E-learning: module not implemented yet, hidden from nav until it ships.
  // {
  //   label: "E-Learning",
  //   items: [
  //     { href: "/dashboard/cursuri", label: "Lista cursuri", icon: ListChecks },
  //     { href: "/dashboard/cursuri/adauga", label: "Adaugă curs", icon: Plus },
  //   ],
  // },
  {
    label: "Programe",
    items: [
      {
        href: "/dashboard/programe",
        label: "Management programe",
        icon: Layers,
      },
      { href: "/dashboard/organizatii", label: "Organizații", icon: Building2 },
      { href: "/dashboard/evaluari", label: "Evaluări", icon: ClipboardList },
      {
        href: "/dashboard/persoane-resursa",
        label: "Persoane resursă",
        icon: UserCog,
      },
    ],
  },
  {
    label: "Admin",
    items: [
      { href: USER_MANAGEMENT_HREF, label: "Utilizatori", icon: Users },
      { href: "/dashboard/mesaje-contact", label: "Mesaje contact", icon: Mail },
      { href: "/dashboard/setari", label: "Setări", icon: Settings },
    ],
  },
];

const ONG_NAV_SECTIONS: DashboardNavSection[] = [
  {
    items: [
      { href: "/dashboard", label: "Panou principal", icon: LayoutGrid },
      { href: "/dashboard/profil", label: "Profilul meu", icon: User },
      {
        href: "/dashboard/evaluari/overview",
        label: "Evaluările mele",
        icon: ClipboardList,
        activePath: "/dashboard/evaluari",
      },
      { href: "/dashboard/programe", label: "Programele mele", icon: Layers },
      { href: "/dashboard/utilizatori", label: "Utilizatori", icon: Users },
      // { href: "/dashboard/e-learning", label: "E-Learning", icon: GraduationCap }, // E-learning: not implemented yet
      {
        href: "/dashboard/persoane-resursa",
        label: "Persoane resursă",
        icon: UserCog,
      },
    ],
  },
];

const MEMBER_NAV_SECTIONS: DashboardNavSection[] = [
  {
    items: [
      { href: "/dashboard/profil", label: "Profilul meu", icon: User },
      { href: "/dashboard", label: "Evaluările mele", icon: ClipboardList },
      // { href: "/dashboard/e-learning", label: "E-Learning", icon: GraduationCap }, // E-learning: not implemented yet
    ],
  },
];

const INDIVIDUAL_NAV_SECTIONS: DashboardNavSection[] = [
  {
    items: [
      { href: "/dashboard", label: "Profilul meu", icon: User },
      // { href: "/dashboard/e-learning", label: "E-Learning", icon: GraduationCap }, // E-learning: not implemented yet
    ],
  },
];

const MENTOR_NAV_SECTIONS: DashboardNavSection[] = [
  {
    items: [
      { href: "/dashboard", label: "Panou principal", icon: LayoutGrid },
      { href: "/dashboard/profil", label: "Profilul meu", icon: User },
      { href: "/dashboard/programe", label: "Programele mele", icon: Layers },
      { href: "/dashboard/intalniri", label: "Întâlniri", icon: Calendar },
      { href: "/dashboard/mesaje", label: "Mesaje", icon: MessageCircle },
    ],
  },
];

const NAV_SECTIONS_BY_VARIANT: Record<
  "fdsc" | "ong" | "member" | "individual" | "mentor",
  DashboardNavSection[]
> = {
  fdsc: FDSC_NAV_SECTIONS,
  ong: ONG_NAV_SECTIONS,
  member: MEMBER_NAV_SECTIONS,
  individual: INDIVIDUAL_NAV_SECTIONS,
  mentor: MENTOR_NAV_SECTIONS,
};

export function DashboardSidebar({
  userName,
  userEmail,
  variant = "fdsc",
  accountLabel,
  showUserManagement = true,
}: {
  userName: string;
  userEmail: string;
  variant?: "fdsc" | "ong" | "member" | "individual" | "mentor";
  accountLabel?: string;
  /** False for `editor-fdsc`, whose account has no user administration. */
  showUserManagement?: boolean;
}) {
  const sections = showUserManagement
    ? NAV_SECTIONS_BY_VARIANT[variant]
    : NAV_SECTIONS_BY_VARIANT[variant]
        .map((section) => ({
          ...section,
          items: section.items.filter(
            (item) => item.href !== USER_MANAGEMENT_HREF,
          ),
        }))
        .filter((section) => section.items.length > 0);
  const pathname = usePathname();
  const router = useRouter();

  // Longest-prefix match: a root item like "Panou principal" (href "/dashboard")
  // would otherwise stay highlighted on every nested page, since its href prefixes them all.
  const activePath = sections
    .flatMap((section) => section.items)
    .map((item) => item.activePath ?? item.href)
    .filter((path) => pathname === path || pathname.startsWith(`${path}/`))
    .sort((a, b) => b.length - a.length)[0];

  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  // Off-canvas on mobile: closed by default, opened by the fixed top bar's
  // hamburger button, closed again on navigation so it never lingers open
  // over the page it just routed to.
  const [open, setOpen] = useState(false);

  // Reset during render rather than in an effect — the recommended pattern
  // for clearing state when a prop (here, the route) changes.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const handleLogout = async () => {
    setLoggingOut(true);
    setLogoutError(null);
    try {
      await logoutSession();
      router.replace("/");
      router.refresh();
    } catch {
      setLoggingOut(false);
      setLogoutError("Nu am putut finaliza deconectarea. Încearcă din nou.");
    }
  };

  const initial = userName.trim().charAt(0).toUpperCase() || "?";

  return (
    <>
      {/* Mobile top bar: fixed and out of the flex row's flow, so it doesn't
          disturb the sidebar/main layout at `lg` and up, where it's hidden. */}
      <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-2 border-b border-border bg-white px-4 py-3 lg:hidden print:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Deschide meniul"
          className="-ml-2 rounded-lg p-2 text-[#334155] hover:bg-muted"
        >
          <Menu size={20} aria-hidden />
        </button>
        <Logo variant="dark" height={24} />
        <span className="w-9" aria-hidden />
      </header>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-border bg-white transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-60 lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:transition-none print:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <Logo variant="dark" height={28} />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Închide meniul"
            className="rounded-lg p-1.5 text-[#334155] hover:bg-muted lg:hidden"
          >
            <X size={18} aria-hidden />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {sections.map((section, index) => (
            <div key={section.label ?? `section-${index}`}>
              {section.label && (
                <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.label}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = (item.activePath ?? item.href) === activePath;
                  return (
                    <RefreshableLink
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={
                        active
                          ? { background: "#162040", color: "white" }
                          : { color: "#334155" }
                      }
                    >
                      <NavItemContent icon={Icon} label={item.label} />
                    </RefreshableLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-border space-y-3">
          <div className="flex items-center gap-2.5 px-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0"
              style={{
                background: variant === "individual" ? "#2563eb" : "#2dbe8f",
              }}
            >
              {initial}
            </div>
            <div className="min-w-0">
              <p
                className="text-sm font-semibold truncate"
                style={{ color: "#162040" }}
              >
                {userName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {accountLabel ?? userEmail}
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted"
            style={{ color: "#334155" }}
          >
            <span className="flex items-center gap-2">
              <Globe size={16} />
              Înapoi la site
            </span>
            <LinkPendingIndicator />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted disabled:opacity-60"
            style={{ color: "#ef4444" }}
          >
            <LogOut size={16} />
            Deconectare
          </button>
          {logoutError && (
            <p className="px-3 text-xs" style={{ color: "#ef4444" }}>
              {logoutError}
            </p>
          )}
        </div>
      </aside>
    </>
  );
}

/**
 * Rendered inside a <Link> so `useLinkStatus` can report that navigation. The
 * icon swaps for a spinner the moment the link is clicked, which covers the gap
 * before the route's loading skeleton takes over.
 */
function NavItemContent({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  const { pending } = useLinkStatus();

  return (
    <>
      {pending ? (
        <Loader2 size={16} className="animate-spin" aria-hidden />
      ) : (
        <Icon size={16} aria-hidden />
      )}
      {label}
      {pending && <span className="sr-only">Se încarcă…</span>}
    </>
  );
}
