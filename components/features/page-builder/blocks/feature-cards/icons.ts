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
import type { FeatureIconKey } from "./schema";

/** Maps a stored icon key to its `lucide-react` component. */
export const FEATURE_ICONS: Record<FeatureIconKey, LucideIcon> = {
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
