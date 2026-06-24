import { cn } from "@/lib/utils/cn";

export function NavBadge({
  count,
  className,
}: {
  count: number | string;
  className?: string;
}) {
  const label = typeof count === "number" && count > 99 ? "99+" : String(count);

  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold leading-none text-primary-foreground",
        className
      )}
    >
      {label}
    </span>
  );
}
