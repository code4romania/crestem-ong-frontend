import {
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  CheckSquare,
  FileText,
  Globe,
  GraduationCap,
  Layers,
  Library,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { ProgrammeIconKey } from "./schema";

/** Maps a stored icon key to its `lucide-react` component. */
export const PROGRAMME_ICONS: Record<ProgrammeIconKey, LucideIcon> = {
  book: BookOpen,
  users: Users,
  award: Award,
  globe: Globe,
  graduation: GraduationCap,
  library: Library,
  layers: Layers,
  file: FileText,
  zap: Zap,
  calendar: Calendar,
  chart: BarChart3,
  check: CheckSquare,
};
