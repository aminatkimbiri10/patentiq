import Link from "next/link";
import { Users, FolderKanban, ClipboardList, Settings, Gauge, Shield } from "lucide-react";
import { getDashboardOverview } from "@/lib/dashboard/overview-data";
import { runHealthCheck } from "@/lib/health/check";
import { requireUser } from "@/lib/auth/require-user";
import { SystemHealthPanel } from "@/components/admin/system-health-panel";
import { RoleDashboardOverview } from "@/components/dashboard/overview/role-dashboard-overview";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { DashboardLinkCard } from "@/components/dashboard/dashboard-link-card";

export const metadata = { title: "Administration" };

export default async function AdminPage() {
  const ctx = await requireUser();
  const [overview, health] = await Promise.all([
    getDashboardOverview(ctx.user.id, "admin", ctx.profile ?? undefined),
    runHealthCheck(),
  ]);

  const quickLinks = [
    {
      href: "/admin/users",
      label: "Utilisateurs",
      desc: "Rôles et comptes",
      icon: Users,
    },
    {
      href: "/admin/projects",
      label: "Projets",
      desc: "Supervision et assignations",
      icon: FolderKanban,
    },
    {
      href: "/admin/settings",
      label: "Paramètres",
      desc: "Workflow et assignation auto",
      icon: Settings,
    },
    {
      href: "/admin/audit-logs",
      label: "Audit",
      desc: "Traçabilité complète",
      icon: ClipboardList,
    },
  ];

  return (
    <RoleDashboardOverview
      data={overview}
      config={{
        layout: "home",
        projectsTitle: "Projets récents",
        projectsDescription: "Dernière activité sur la plateforme.",
        projectsHref: "/admin/projects",
        projectHrefFor: (id) => `/admin/projects/${id}`,
        showWorkflow: false,
        showSettings: false,
        showDocuments: false,
        showAi: false,
        extraBeforeGrid: <SystemHealthPanel report={health} />,
        extraSidebar: (
          <DashboardSection title="Administration" description="Modules de gestion" icon={Gauge}>
            {quickLinks.map((link) => (
              <DashboardLinkCard
                key={link.href}
                href={link.href}
                title={link.label}
                description={link.desc}
                icon={link.icon}
              />
            ))}
            <div className="border-t border-border/60 px-5 py-4 text-sm text-muted-foreground">
              <p className="flex items-start gap-2 leading-relaxed">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Workflow configurable dans{" "}
                <Link href="/admin/settings" className="font-medium text-primary hover:underline">
                  Paramètres
                </Link>
                .
              </p>
            </div>
          </DashboardSection>
        ),
      }}
    />
  );
}
