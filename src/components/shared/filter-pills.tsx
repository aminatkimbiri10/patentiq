import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export type FilterPill = {
  href: string;
  label: string;
  active?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
};

export function FilterPills({ items, className }: { items: FilterPill[]; className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
              item.active
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {item.label}
            {item.count != null && item.count > 0 && (
              <span className="tabular-nums text-xs opacity-90">({item.count})</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
