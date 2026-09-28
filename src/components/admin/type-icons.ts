// Curated icons a content type can use in the sidebar. A fixed map (rather than
// importing all of lucide-react by name) keeps the admin bundle small.
import { createElement } from "react";
import {
  Award,
  Briefcase,
  Building2,
  Calendar,
  FileText,
  Globe,
  GraduationCap,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  MapPin,
  Megaphone,
  MessageCircle,
  MessageSquareQuote,
  Newspaper,
  Package,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  Users,
  Video,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export const TYPE_ICONS: Record<string, LucideIcon> = {
  FileText,
  Newspaper,
  Package,
  MapPin,
  Briefcase,
  Building2,
  Globe,
  MessageSquareQuote,
  MessageCircle,
  Users,
  Star,
  Award,
  HelpCircle,
  Calendar,
  GraduationCap,
  Image: ImageIcon,
  Video,
  Layers,
  Megaphone,
  ShoppingBag,
  Sparkles,
  Tag,
  Wrench,
};

export const typeIcon = (name?: string | null): LucideIcon => (name && TYPE_ICONS[name]) || FileText;

/** Renders a content type's icon by name without creating a component during render. */
export function TypeIcon({ name, className }: { name?: string | null; className?: string }) {
  return createElement(typeIcon(name), { className });
}
