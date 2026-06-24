"use client";

import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Briefcase,
  ClipboardList,
  FileText,
  FolderOpen,
  LayoutDashboard,
  ListChecks,
  MessagesSquare,
  Microscope,
  BarChart3,
  NotebookText,
  ScanEye,
  Search,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import type { NavIconName } from "@/config/navigation";

/** Icônes sidebar — variantes épurées, lisibles à 16px */
export const NAV_ICONS: Record<NavIconName, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  "folder-kanban": FolderOpen,
  search: Search,
  "file-text": FileText,
  "message-square": MessagesSquare,
  "list-checks": ListChecks,
  bell: Bell,
  shield: Shield,
  users: Users,
  settings: Settings,
  "clipboard-list": ClipboardList,
  briefcase: Briefcase,
  "bar-chart-3": BarChart3,
  microscope: Microscope,
  eye: ScanEye,
};

/** Documentation / aide — exporté pour le pied de sidebar */
export const SIDEBAR_DOC_ICON = NotebookText;
