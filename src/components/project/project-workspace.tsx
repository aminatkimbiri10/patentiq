import { cn } from "@/lib/utils/cn";

export function ProjectWorkspace({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm", className)}>
      {children}
    </div>
  );
}

export const projectMainTabTriggerClass =
  "relative shrink-0 gap-1.5 rounded-none border-b-2 border-transparent bg-transparent px-3 py-2.5 text-xs font-medium text-muted-foreground shadow-none transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none sm:gap-2 sm:px-4 sm:py-3 sm:text-sm";

export const projectMainTabsListClass =
  "h-auto w-full justify-start gap-0 rounded-none border-0 bg-transparent p-0";
