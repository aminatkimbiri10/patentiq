"use client";

import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Briefcase,
  FileText,
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  Search,
  Settings,
  Shield,
  Users,
  ClipboardList,
  Microscope,
  BarChart3,
  ListChecks,
} from "lucide-react";
import type { NavIconName } from "@/config/navigation";

export const NAV_ICONS: Record<NavIconName, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  "folder-kanban": FolderKanban,
  search: Search,
  "file-text": FileText,
  "message-square": MessageSquare,
  "list-checks": ListChecks,
  bell: Bell,
  shield: Shield,
  users: Users,
  settings: Settings,
  "clipboard-list": ClipboardList,
  briefcase: Briefcase,
  "bar-chart-3": BarChart3,
  microscope: Microscope,
};
