import {
  ArrowLeftRight,
  Building2,
  Calendar,
  CalendarClock,
  Flag,
  Hourglass,
  Layers,
  MessageCircle,
  UserCheck,
  UserCog,
  UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { NotificationType } from "@/lib/api/notifications";

export interface NotificationAppearance {
  icon: LucideIcon;
  /** Tailwind classes for the icon tile: background, border and icon colour. */
  tile: string;
}

const TEAL = "bg-[#f0fdfa] border-[#d5f5ec] text-[#0f9d76]";
const AMBER = "bg-[#fefce8] border-[#fbf1c6] text-[#b45309]";
const BLUE = "bg-[#eef2ff] border-[#e0e7ff] text-[#5656e5]";
const PURPLE = "bg-[#faf5ff] border-[#f0e4fe] text-[#7c3aed]";

export const NOTIFICATION_APPEARANCE: Record<NotificationType, NotificationAppearance> = {
  "account-activated": { icon: UserCheck, tile: TEAL },
  "member-joined": { icon: UserPlus, tile: TEAL },
  "mentor-assigned": { icon: UserCog, tile: TEAL },
  "ong-added-to-program": { icon: Layers, tile: BLUE },
  "ong-registered": { icon: Building2, tile: TEAL },
  "admin-transfer": { icon: ArrowLeftRight, tile: AMBER },
  "meeting-created": { icon: Calendar, tile: BLUE },
  "meeting-updated": { icon: Calendar, tile: BLUE },
  "meeting-cancelled": { icon: Calendar, tile: BLUE },
  "phase-ended": { icon: Flag, tile: PURPLE },
  "phase-ending-soon": { icon: Hourglass, tile: AMBER },
  "phase-dates-changed": { icon: CalendarClock, tile: PURPLE },
  "message-received": { icon: MessageCircle, tile: BLUE },
};

/** A type this build does not know yet still renders, as a plain tile. */
export const FALLBACK_APPEARANCE: NotificationAppearance = {
  icon: Calendar,
  tile: BLUE,
};
