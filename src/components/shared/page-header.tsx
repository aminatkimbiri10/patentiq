import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type PageHeaderProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  eyebrow?: string;
  icon?: LucideIcon;
  /** default = bordure ; elevated = carte comme l'accueil dashboard */
  variant?: "default" | "elevated";
  bordered?: boolean;
};

/** En-tête sobre type ERP / console métier */
export function PageHeader({
  title,
  description,
  children,
  className,
  eyebrow,
  icon: Icon,
  variant = "default",
  bordered = true,
}: PageHeaderProps) {
  const elevated = variant === "elevated";

  return (
    <div
      className={cn(
        elevated &&
          "dashboard-hero w-full min-w-0 max-w-full rounded-xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/[0.03] p-5 shadow-sm sm:p-6",
        !elevated && bordered && "w-full min-w-0 max-w-full border-b border-border/80 pb-5",
        className
      )}
    >
      {eyebrow && <p className="section-eyebrow mb-2">{eyebrow}</p>}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && (
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15">
              <Icon className="h-5 w-5" />
            </span>
          )}
          <div className="min-w-0">
            <h1 className="break-words text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {title}
            </h1>
            {description && (
              <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        {children && (
          <div className="flex min-w-0 shrink flex-wrap items-center gap-2">{children}</div>
        )}
      </div>
    </div>
  );
}
