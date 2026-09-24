export type UserRoleType =
  | "super-admin"
  | "editor-fdsc"
  | "ngo-admin"
  | "ngo-member"
  | "mentor"
  | "individual";

/**
 * The two accounts that reach the FDSC dashboard. They see the same screens
 * apart from "Utilizatori", which belongs to the administrator alone.
 */
export const FDSC_STAFF_ROLES: UserRoleType[] = ["super-admin", "editor-fdsc"];

export function isFdscStaff(roleType?: string | null): boolean {
  return FDSC_STAFF_ROLES.includes(roleType as UserRoleType);
}

export const ROLE_OPTIONS: { type: UserRoleType; label: string }[] = [
  { type: "super-admin", label: "Admin FDSC" },
  { type: "editor-fdsc", label: "Editor FDSC" },
  { type: "ngo-admin", label: "Admin ONG" },
  { type: "ngo-member", label: "Membru ONG" },
  { type: "mentor", label: "Persoană resursă" },
  { type: "individual", label: "Cont individual" },
];

export const ROLE_BADGES: Record<UserRoleType, { label: string; bg: string; color: string }> = {
  "super-admin": { label: "Admin FDSC", bg: "#fef2f2", color: "#b91c1c" },
  "editor-fdsc": { label: "Editor FDSC", bg: "#f0fdf4", color: "#15803d" },
  "ngo-admin": { label: "Admin ONG", bg: "#dcfafb", color: "#5656e5" },
  "ngo-member": { label: "Membru ONG", bg: "#f0fdfa", color: "#0f766e" },
  mentor: { label: "Persoană resursă", bg: "#faf5ff", color: "#9333ea" },
  individual: { label: "Cont individual", bg: "#f8fafc", color: "#5b6779" },
};
