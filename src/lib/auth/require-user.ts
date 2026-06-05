import { redirect } from "next/navigation";
import { getUserContext, type UserContext } from "@/lib/auth/get-user";

export async function requireUser(): Promise<UserContext> {
  const ctx = await getUserContext();
  if (!ctx) redirect("/auth/login");
  return ctx;
}
