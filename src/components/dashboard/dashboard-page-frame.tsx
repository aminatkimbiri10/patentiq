import { cn } from "@/lib/utils/cn";

/** Enveloppe commune pour les pages du dashboard (animation + espacement) */
export function DashboardPageFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("dash-page animate-fade-in w-full min-w-0 space-y-5 sm:space-y-6", className)}>{children}</div>;
}
