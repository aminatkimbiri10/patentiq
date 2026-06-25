import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { AdminUserRoleForm } from "@/components/admin/admin-user-role-form";
import { listAdminUsers } from "@/lib/actions/admin-users";
import { ROLE_LABELS } from "@/types/roles";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Utilisateurs" };

export default async function AdminUsersPage() {
  const users = await listAdminUsers();

  return (
    <div className="dash-page w-full min-w-0 space-y-6">
      <PageHeader
        icon={Users}
        title="Utilisateurs"
        description="Gestion des comptes et attribution du rôle principal."
      />
      {users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun utilisateur"
          description="Aucun profil visible ou accès restreint par RLS."
        />
      ) : (
        <div className="enterprise-panel overflow-hidden">
          <div className="table-scroll">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th className="hidden sm:table-cell">Entreprise</th>
                  <th>Rôles</th>
                  <th>Rôle principal</th>
                  <th>Inscrit</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-5 py-4">
                      <p className="font-medium">{u.full_name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </td>
                    <td className="hidden px-5 py-4 text-muted-foreground sm:table-cell">
                      {u.company ?? "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.length === 0 ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          u.roles.map((r) => (
                            <Badge key={r} variant="outline" className="text-xs font-normal">
                              {ROLE_LABELS[r]}
                            </Badge>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <AdminUserRoleForm userId={u.id} currentRole={u.primaryRole} />
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(u.created_at), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
