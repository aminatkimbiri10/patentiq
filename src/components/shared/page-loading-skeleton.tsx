import { Skeleton } from "@/components/ui/skeleton";

export function PageLoadingSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Chargement">
      <div className="space-y-3 border-b border-border pb-5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-56 sm:w-72" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>
      <Skeleton className="h-[88px] w-full rounded-md" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-36 rounded-md" />
          <Skeleton className="h-56 rounded-md" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-44 rounded-md" />
          <Skeleton className="h-40 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function ShellSidebarSkeleton() {
  return (
    <aside className="enterprise-sidebar hidden h-full max-h-[100dvh] w-[260px] shrink-0 overflow-hidden lg:flex lg:flex-col">
      <div className="sidebar-header">
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="space-y-1 px-2 py-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full rounded-md" />
        ))}
      </div>
    </aside>
  );
}

export function ShellTopbarSkeleton() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-4 sm:px-5">
      <Skeleton className="h-9 w-9 lg:hidden" />
      <Skeleton className="hidden h-9 flex-1 max-w-md lg:block" />
      <div className="ml-auto flex gap-1">
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>
    </header>
  );
}
