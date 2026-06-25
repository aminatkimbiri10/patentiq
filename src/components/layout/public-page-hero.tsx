import { cn } from "@/lib/utils/cn";

export function PublicPageHero({
  eyebrow,
  title,
  description,
  className,
  centered = true,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  centered?: boolean;
}) {
  return (
    <header
      className={cn(
        "relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/[0.04] to-transparent",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 50% -20%, hsl(var(--primary) / 0.12), transparent 65%)",
        }}
      />
      <div className={cn("container relative section-padding !pb-12 !pt-14 sm:!pb-16 sm:!pt-16", centered && "text-center")}>
        {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
        <h1
          className={cn(
            "text-3xl font-semibold tracking-tight text-foreground sm:text-4xl",
            eyebrow && "mt-3",
            centered && "mx-auto max-w-3xl"
          )}
        >
          {title}
        </h1>
        {description && (
          <p
            className={cn(
              "mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg",
              centered && "mx-auto max-w-2xl"
            )}
          >
            {description}
          </p>
        )}
      </div>
    </header>
  );
}
