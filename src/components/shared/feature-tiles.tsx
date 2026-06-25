import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function FeatureTiles({
  items,
  className,
}: {
  items: { icon: LucideIcon; title: string; description: string }[];
  className?: string;
}) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-3", className)}>
      {items.map((item) => (
        <div
          key={item.title}
          className="rounded-xl border border-border/80 bg-card p-4 text-center shadow-sm transition-shadow hover:shadow-md"
        >
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <item.icon className="h-5 w-5" />
          </span>
          <p className="mt-3 text-sm font-semibold text-foreground">{item.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
        </div>
      ))}
    </div>
  );
}
