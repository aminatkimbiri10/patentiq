import Link from "next/link";
import { I2PALogo, I2PALogoImage, I2PA_TAGLINE } from "@/components/shared/i2pa-logo";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils/cn";

export function AuthBrandLogo({
  variant = "on-light",
  className,
}: {
  /** on-dark = panneau bleu ; on-light = colonne formulaire */
  variant?: "on-dark" | "on-light";
  className?: string;
}) {
  const href = "/";
  const org = siteConfig.organization;
  const logoSrc = org.logoUrl;
  const isDark = variant === "on-dark";

  if (logoSrc) {
    return (
      <Link
        href={href}
        className={cn(
          "inline-flex max-w-full min-w-0 flex-col transition-opacity hover:opacity-90",
          isDark ? "items-start gap-3" : "items-center gap-2 text-center",
          className
        )}
        title={org.name}
      >
        <I2PALogoImage
          src={logoSrc}
          alt={`${org.name} — ${org.legalName}`}
          compact
          showTagline={false}
          variant={isDark ? "light" : "default"}
          surface="transparent"
          placement={isDark ? "auth-dark" : "auth-light"}
          className="max-w-full"
        />
        {isDark ? (
          <p className="max-w-xs text-[10px] font-normal leading-snug text-white/55">{I2PA_TAGLINE}</p>
        ) : (
          <p className="max-w-[240px] text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {siteConfig.productLabel}
          </p>
        )}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex max-w-full min-w-0 flex-col gap-2 transition-opacity hover:opacity-90",
        isDark ? "items-start text-left" : "items-center text-center",
        className
      )}
      title={org.name}
    >
      <I2PALogo
        variant="wordmark"
        size="lg"
        showTagline={isDark}
        variantStyle={isDark ? "light" : "default"}
      />
      {!isDark && (
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {siteConfig.productLabel}
        </p>
      )}
    </Link>
  );
}
