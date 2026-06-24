import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function DashboardLinkCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
  icon?: unknown;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 border-t border-border px-5 py-3.5 text-sm transition-colors first:border-t-0 hover:bg-muted/30"
    >
      <div className="min-w-0">
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}
