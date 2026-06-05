import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { siteConfig } from "@/config/site";

export function BrandLogo({
  href = "/",
  showText = true,
  size = "md",
  variant = "default",
  className,
}: {
  href?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "light";
  className?: string;
}) {
  const sizes = {
    sm: { box: "h-8 w-8 text-xs", text: "text-base" },
    md: { box: "h-9 w-9 text-sm", text: "text-lg" },
    lg: { box: "h-11 w-11 text-base", text: "text-xl" },
  };
  const s = sizes[size];

  return (
    <Link href={href} className={cn("group flex min-w-0 items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl font-bold text-primary-foreground shadow-md shadow-primary/30 transition-transform group-hover:scale-105",
          s.box
        )}
        style={{
          background: `linear-gradient(135deg, ${siteConfig.brand.blue} 0%, hsl(210, 90%, 28%) 100%)`,
        }}
      >
        PI
      </span>
      {showText && (
        <span
          className={cn(
            "truncate font-bold tracking-tight",
            s.text,
            variant === "light" && "text-white"
          )}
        >
          {siteConfig.name}
        </span>
      )}
    </Link>
  );
}
