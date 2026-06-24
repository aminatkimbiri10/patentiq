import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";

import { KpiCards } from "@/components/dashboard/kpi-cards";

import { DashboardSection } from "@/components/dashboard/dashboard-section";

import { DashboardLinkCard } from "@/components/dashboard/dashboard-link-card";

import { Users, FolderKanban, ClipboardList, Settings, Gauge } from "lucide-react";

import { getAdminStats } from "@/lib/admin/stats";
import { runHealthCheck } from "@/lib/health/check";
import { SystemHealthPanel } from "@/components/admin/system-health-panel";

import { PROJECT_STATUS_LABELS } from "@/config/constants";

import type { ProjectStatus } from "@/types/database";



export const metadata = { title: "Administration" };



export default async function AdminPage() {

  const [stats, health] = await Promise.all([getAdminStats(), runHealthCheck()]);



  const statusSummary = Object.entries(stats.byStatus)

    .sort((a, b) => b[1] - a[1])

    .slice(0, 3)

    .map(([s, n]) => `${PROJECT_STATUS_LABELS[s as ProjectStatus] ?? s}: ${n}`)

    .join(" · ");



  const quickLinks = [

    {

      href: "/admin/users",

      label: "Gérer les utilisateurs",

      desc: "Rôles et comptes",

      icon: Users,

    },

    {

      href: "/admin/projects",

      label: "Superviser les projets",

      desc: "Assignations CPI / expert",

      icon: FolderKanban,

    },

    {

      href: "/admin/settings",

      label: "Paramètres workflow",

      desc: "Assignation auto, revue",

      icon: Settings,

    },

    {

      href: "/admin/audit-logs",

      label: "Journal d'audit",

      desc: "Traçabilité complète",

      icon: ClipboardList,

    },

  ];



  return (

    <div className="space-y-6">

      <PageHeader

        icon={Gauge}

        eyebrow="Administration"

        title="Supervision plateforme"

        description="Utilisateurs, projets, paramètres et traçabilité globale."

      />

      <SystemHealthPanel report={health} />

      <KpiCards

        items={[

          { title: "Utilisateurs", value: stats.usersCount, icon: Users },

          {

            title: "Projets",

            value: stats.projectsCount,

            icon: FolderKanban,

            hint: statusSummary || undefined,

          },

          {

            title: "Dossiers actifs",

            value: stats.projectsInReview,

            icon: FolderKanban,

            hint: "Soumis, en revue, expert, CPI",

          },

          { title: "Logs audit", value: stats.auditLogsCount, icon: ClipboardList },

        ]}

      />



      <DashboardSection title="Administration" description="Accès aux modules de gestion.">

        {quickLinks.map((link) => (

          <DashboardLinkCard

            key={link.href}

            href={link.href}

            title={link.label}

            description={link.desc}

            icon={link.icon}

          />

        ))}

      </DashboardSection>



      <div className="enterprise-panel px-5 py-4 text-sm text-muted-foreground">

        <p className="leading-relaxed">

          Workflow : assignation CPI à la soumission, passage en revue, assignation expert sur

          demande CPI — configurable dans{" "}

          <Link href="/admin/settings" className="font-medium text-primary hover:underline">

            Paramètres

          </Link>

          .

        </p>

      </div>

    </div>

  );

}

