"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Ong } from "@/lib/api/ongs";
import { OrgHeaderCard } from "./OrgHeaderCard";

const FDSC_TABS = [
  { key: "overview", label: "Overview", segment: "" },
  { key: "evaluari", label: "Istoric evaluări", segment: "evaluari" },
  {
    key: "evaluare-curenta",
    label: "Evaluare curentă",
    segment: "evaluare-curenta",
  },
  { key: "comparatie", label: "Comparație", segment: "comparatie" },
  { key: "rapoarte", label: "Rapoarte", segment: "rapoarte" },
  {
    key: "persoane-resursa",
    label: "Persoane resursă",
    segment: "persoane-resursa",
  },
] as const;

const MENTOR_TABS = [
  { key: "overview", label: "Overview", segment: "" },
  { key: "evaluari", label: "Istoric evaluări", segment: "evaluari" },
  {
    key: "evaluare-curenta",
    label: "Evaluare curentă",
    segment: "evaluare-curenta",
  },
  { key: "comparatie", label: "Comparație", segment: "comparatie" },
  { key: "rapoarte", label: "Rapoarte", segment: "rapoarte" },
] as const;

/**
 * Renders the org header + tab bar around `children`. Lives in the
 * `[documentId]` layout so it stays mounted across tab navigations instead
 * of re-fetching and remounting on every click. Only shown on the exact tab
 * routes — deeper drill-down pages (e.g. a single evaluation report) render
 * `children` bare, matching their pre-existing chrome-less look.
 */
export function OrgDetailChrome({
  ong,
  documentId,
  children,
  role = "fdsc",
}: {
  ong: Ong;
  documentId: string;
  children: React.ReactNode;
  /** Which role's tab set + base path to render — the mentor view drops Comparație and Persoane resursă. */
  role?: "fdsc" | "mentor";
}) {
  const pathname = usePathname();
  // Role-less, like every other in-app link: `usePathname()` reports the URL the
  // browser shows, which the proxy has already stripped the role segment from.
  // A role-carrying href here would never match, leaving the chrome unrendered.
  const base = `/dashboard/organizatii/${documentId}`;
  const backHref =
    role === "mentor" ? "/dashboard/programe" : "/dashboard/organizatii";
  const backLabel =
    role === "mentor" ? "Înapoi la programele mele" : "Înapoi la organizații";
  const TABS = role === "mentor" ? MENTOR_TABS : FDSC_TABS;
  const tabs = TABS.map((tab) => ({
    ...tab,
    href: tab.segment ? `${base}/${tab.segment}` : base,
  }));
  const activeTab = tabs.find((tab) => tab.href === pathname);

  if (!activeTab) {
    return <>{children}</>;
  }

  return (
    <>
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 print:hidden"
        style={{ color: "#5b6779" }}
      >
        <ArrowLeft size={14} /> {backLabel}
      </Link>

      <OrgHeaderCard ong={ong} />

      <div className="mb-6 flex items-center gap-6 overflow-x-auto border-b border-border print:hidden">
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab.key;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={
                isActive
                  ? "shrink-0 whitespace-nowrap pb-3 text-sm font-semibold border-b-2"
                  : "shrink-0 whitespace-nowrap pb-3 text-sm font-medium hover:text-slate-700 transition-colors"
              }
              style={
                isActive
                  ? { color: "#007d58", borderColor: "#007d58" }
                  : { color: "#5b6779" }
              }
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {children}
    </>
  );
}
