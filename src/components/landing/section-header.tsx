import { cn } from "@/lib/utils/cn";

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  centered = true,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(centered && "mx-auto max-w-3xl text-center", className)}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl",
          eyebrow && "mt-3"
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
