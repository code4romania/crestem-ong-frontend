import {
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  Folder,
  Globe,
  Heart,
  MessageSquare,
  Scale,
  Settings,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { CategoryIconKey } from "./schema";

/** Maps a stored icon key to its `lucide-react` component. */
export const CATEGORY_ICONS: Record<CategoryIconKey, LucideIcon> = {
  folder: Folder,
  settings: Settings,
  scale: Scale,
  message: MessageSquare,
  trending: TrendingUp,
  users: Users,
  award: Award,
  book: BookOpen,
  globe: Globe,
  heart: Heart,
  briefcase: Briefcase,
  calendar: Calendar,
};
