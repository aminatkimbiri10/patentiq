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
    <div className="space-y-6">
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
        <div className="card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Utilisateur</th>
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">Entreprise</th>
                  <th className="px-5 py-3 font-medium">Rôles</th>
                  <th className="px-5 py-3 font-medium">Rôle principal</th>
                  <th className="px-5 py-3 font-medium">Inscrit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {users.map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-muted/20">
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
