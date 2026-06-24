import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { siteConfig } from "@/config/site";
import { I2PALogo, I2PALogoImage } from "@/components/shared/i2pa-logo";

export function BrandLogo({
  href = "/",
  showText = true,
  size = "md",
  variant = "default",
  context = "product",
  className,
}: {
  href?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "light" | "flat" | "sidebar";
  /** `organization` = logo entreprise dans la console ; `product` = marque PatentIQ (site public) */
  context?: "product" | "organization";
  className?: string;
}) {
  const sizes = {
    sm: { box: "h-8 w-8 text-xs", text: "text-[15px]" },
    md: { box: "h-9 w-9 text-sm", text: "text-lg" },
    lg: { box: "h-11 w-11 text-base", text: "text-xl" },
  };
  const s = sizes[size];

  const org = siteConfig.organization;
  const useOrganization =
    context === "organization" && Boolean(org.name || org.logoUrl);
  const isI2pa = org.name.toUpperCase() === "I2PA";

  if (useOrganization) {
    const label = org.name || siteConfig.name;
    const compact = !showText;

    if (org.logoUrl) {
      return (
        <Link
          href={href}
          className={cn("flex w-full min-w-0 items-center", className)}
          title={label}
        >
          <I2PALogoImage
            src={org.logoUrl}
            alt={label}
            compact={compact}
            size={size}
            showTagline={showText}
          />
        </Link>
      );
    }

    if (isI2pa) {
      return (
        <Link
          href={href}
          className={cn("flex w-full min-w-0 items-center", className)}
          title={label}
        >
          <I2PALogo
            variant={compact ? "mark" : "wordmark"}
            size={size}
            showTagline={showText}
          />
        </Link>
      );
    }

    if (org.name) {
      return (
        <Link href={href} className={cn("flex min-w-0 items-center", className)} title={label}>
          <span className={cn("truncate font-semibold tracking-tight text-foreground", s.text)}>
            {org.name}
          </span>
        </Link>
      );
    }
  }

  return (
    <Link href={href} className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded font-semibold",
          s.box,
          variant === "flat" && "bg-primary text-primary-foreground shadow-none",
          variant === "sidebar" &&
            "border border-white/10 bg-white/[0.08] text-[hsl(214,32%,91%)] shadow-none",
          variant !== "flat" && variant !== "sidebar" && "rounded-md text-primary-foreground shadow-sm"
        )}
        style={
          variant === "flat" || variant === "sidebar"
            ? undefined
            : {
                background: `linear-gradient(135deg, ${siteConfig.brand.blue} 0%, hsl(210, 90%, 28%) 100%)`,
              }
        }
      >
        PI
      </span>
      {showText && (
        <span
          className={cn(
            "truncate font-semibold tracking-tight",
            s.text,
            variant === "light" || variant === "sidebar"
              ? "text-[hsl(214,32%,91%)]"
              : "text-foreground"
          )}
        >
          {siteConfig.name}
        </span>
      )}
    </Link>
  );
}
