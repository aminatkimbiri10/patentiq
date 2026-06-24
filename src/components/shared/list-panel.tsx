import { cn } from "@/lib/utils/cn";

export function ListPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("enterprise-panel divide-y divide-border overflow-hidden", className)}>
      {children}
    </div>
  );
}

export function ListPanelItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "dash-list-row flex-col sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      {children}
    </div>
  );
}
