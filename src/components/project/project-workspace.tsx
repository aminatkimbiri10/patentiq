import { cn } from "@/lib/utils/cn";

export function ProjectWorkspace({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-lg border bg-card shadow-sm", className)}>
      {children}
    </div>
  );
}

export const projectMainTabTriggerClass =
  "relative gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 text-sm font-medium text-muted-foreground shadow-none transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none sm:px-5";

export const projectMainTabsListClass =
  "h-auto w-full justify-start gap-0 rounded-none border-0 bg-transparent p-0";
