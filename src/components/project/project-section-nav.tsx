"use client";

import { cn } from "@/lib/utils/cn";

export type ProjectSectionItem<T extends string = string> = {
  id: T;
  label: string;
  count?: number | string;
  highlight?: boolean;
};

export function ProjectSectionNav<T extends string>({
  sections,
  active,
  onChange,
  className,
}: {
  sections: ProjectSectionItem<T>[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <nav
      className={cn(
        "mb-6 flex max-w-full gap-0 overflow-x-auto overscroll-x-contain border-b border-border scrollbar-thin",
        className
      )}
      aria-label="Sections du dossier"
    >
      {sections.map((s) => {
        const isActive = active === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onChange(s.id)}
            className={cn(
              "relative inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            {s.label}
            {s.highlight && (s.count == null || s.count === 0) && (
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
            )}
            {s.count != null && s.count !== 0 && s.count !== "0%" && (
              <span
                className={cn(
                  "rounded-md bg-muted px-1.5 py-0.5 text-xs tabular-nums",
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground",
                  s.highlight && "font-semibold"
                )}
              >
                {s.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
