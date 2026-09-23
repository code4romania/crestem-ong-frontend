import {
  Building2,
  CalendarDays,
  Clock,
  Globe,
  Info,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Printer,
  Smartphone,
  User,
  type LucideIcon,
} from "lucide-react";
import type { ContactIconKey } from "./schema";

export const CONTACT_ICONS: Record<ContactIconKey, LucideIcon> = {
  "map-pin": MapPin,
  phone: Phone,
  smartphone: Smartphone,
  mail: Mail,
  clock: Clock,
  globe: Globe,
  building: Building2,
  user: User,
  "message-circle": MessageCircle,
  printer: Printer,
  calendar: CalendarDays,
  info: Info,
};
