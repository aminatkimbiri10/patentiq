import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { siteConfig } from "@/config/site";
import { I2PALogo, I2PALogoImage } from "@/components/shared/i2pa-logo";

export function BrandLogo({
  href = "/",
  showText = true,
  size = "md",
  variant = "default",
  context = "organization",
  prominent = false,
  rail = false,
  placement,
  className,
}: {
  href?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "light" | "flat" | "sidebar";
  context?: "product" | "organization";
  prominent?: boolean;
  /** Menu latéral réduit — icône compacte centrée */
  rail?: boolean;
  /** sidebar = menu dashboard (même PNG que landing) */
  placement?: "landing" | "sidebar" | "sidebar-rail" | "default";
  className?: string;
}) {
  const org = siteConfig.organization;
  const label = org.name || siteConfig.name;
  const logoSrc = org.logoUrl;
  const useDarkSurface = variant === "light";

  if (logoSrc) {
    const resolvedPlacement =
      placement ?? (rail ? "sidebar-rail" : prominent ? "landing" : "default");

    return (
      <Link
        href={href}
        className={cn(
          "inline-flex min-w-0 items-center",
          rail ? "mx-auto justify-center" : prominent ? "shrink-0" : "w-full",
          className
        )}
        title={label}
      >
        <I2PALogoImage
          src={logoSrc}
          alt={`${label} — ${org.legalName}`}
          compact={!showText}
          size={rail ? "sm" : prominent ? "md" : size}
          showTagline={showText && context === "organization" && !prominent && !rail}
          variant={variant}
          surface={useDarkSurface ? "dark" : "transparent"}
          prominent={prominent && !rail}
          placement={resolvedPlacement}
        />
      </Link>
    );
  }

  if (rail) {
    return (
      <Link href={href} className={cn("mx-auto inline-flex justify-center", className)} title={label}>
        <I2PALogo variant="mark" size="sm" variantStyle={variant} />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn("inline-flex min-w-0 items-center gap-2.5", className)}
      title={label}
    >
      <I2PALogo
        variant={showText ? "wordmark" : "mark"}
        size={prominent ? "md" : size}
        showTagline={showText}
        variantStyle={variant}
      />
    </Link>
  );
}
