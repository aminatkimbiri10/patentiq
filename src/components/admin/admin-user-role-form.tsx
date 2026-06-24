"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  assignUserPrimaryRole,
  type AdminRoleActionState,
} from "@/lib/actions/admin-users";
import { APP_ROLES, ROLE_LABELS, type AppRole } from "@/types/roles";

export function AdminUserRoleForm({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: AppRole | null;
}) {
  const router = useRouter();
  const [state, formAction] = useFormState(assignUserPrimaryRole, {} as AdminRoleActionState);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message ?? "Rôle mis à jour");
      router.refresh();
    }
    if (state?.error) toast.error(state.error);
  }, [state, router]);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="user_id" value={userId} />
      <select
        name="role_name"
        defaultValue={currentRole ?? "project_holder"}
        className="h-9 w-full min-w-0 max-w-full rounded-lg border border-input bg-background px-2 text-xs sm:h-9 sm:min-w-[10rem] sm:text-sm"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      >
        {APP_ROLES.map((role) => (
          <option key={role} value={role}>
            {ROLE_LABELS[role]}
          </option>
        ))}
      </select>
    </form>
  );
}
