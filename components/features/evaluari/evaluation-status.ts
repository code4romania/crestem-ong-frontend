import { CheckCircle2, Clock, AlertCircle, XCircle } from "lucide-react";

/**
 * Presentation of an `EvaluationStatus`, shared by the ONG admin's invited-members
 * table and the FDSC respondents table so both read identically. Keyed loosely so
 * an unknown status coming off the API degrades to the "neinceput" styling instead
 * of crashing the row.
 */
export const MEMBER_STATUS_LABELS: Record<string, string> = {
  neinceput: "Neînceput",
  in_lucru: "În progres",
  completat: "Completat",
  nefinalizat: "Nefinalizat",
};

export const MEMBER_STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  neinceput: { bg: "#f8fafc", color: "#5b6779" },
  in_lucru: { bg: "#fefce8", color: "#a16207" },
  completat: { bg: "#f0fdf4", color: "#15803d" },
  nefinalizat: { bg: "#fff5f5", color: "#b91c1c" },
};

export const MEMBER_STATUS_ICONS: Record<string, typeof CheckCircle2> = {
  neinceput: AlertCircle,
  in_lucru: Clock,
  completat: CheckCircle2,
  nefinalizat: XCircle,
};

/**
 * Header row both invited-members tables render. `Utilizator` stays left-aligned,
 * header and cells alike; every other column is centered.
 */
export const MEMBER_TABLE_COLUMNS = [
  { label: "Utilizator", align: "text-left" },
  { label: "Status", align: "text-center" },
  { label: "Completat la", align: "text-center" },
  { label: "Acțiuni", align: "text-center" },
] as const;
