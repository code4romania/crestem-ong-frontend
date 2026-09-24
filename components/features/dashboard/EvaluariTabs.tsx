import Link from "next/link";
import { evaluariHref, type EvaluariQuery } from "./evaluari-query";

export const EVALUARI_TABS = [
  { key: "utilizatori", label: "Evaluări per utilizator" },
  { key: "organizatii", label: "Evaluări per organizație" },
] as const;

export type EvaluariTab = (typeof EVALUARI_TABS)[number]["key"];

export function isEvaluariTab(value?: string): value is EvaluariTab {
  return EVALUARI_TABS.some((tab) => tab.key === value);
}

/**
 * Switching tabs keeps the filters: an organization and a program mean the same
 * thing on both sides, and the search term follows too so the list the user
 * built does not reset under them. The status is dropped — the users tab
 * filters on a respondent's status, the organizations tab on the round's — and
 * so is the page number, since the other tab has its own number of rows.
 */
export function EvaluariTabs({ query }: { query: EvaluariQuery }) {
  return (
    <div className="flex gap-1 mb-6 border-b border-border" role="tablist">
      {EVALUARI_TABS.map((tab) => {
        const isActive = tab.key === query.tab;
        return (
          <Link
            key={tab.key}
            href={evaluariHref({ ...query, tab: tab.key, status: "", page: 1 })}
            role="tab"
            aria-selected={isActive}
            className="px-4 py-2.5 text-sm font-semibold -mb-px border-b-2 transition-colors"
            style={
              isActive
                ? { borderColor: "#007d58", color: "#1c1c81" }
                : { borderColor: "transparent", color: "#5b6779" }
            }
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
