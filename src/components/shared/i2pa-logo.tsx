import { cn } from "@/lib/utils/cn";
import { siteConfig } from "@/config/site";

const BRAND_BLUE = siteConfig.brand.blue;
const ORANGE = "#E86A43";
export const I2PA_TAGLINE = "International Intellectual Property Assistance";

/** Lockup compact — I2PA serré + sous-titre en dessous (inspiré i2pa.com). */
export function I2PALogo({
  variant = "wordmark",
  size = "sm",
  showTagline = true,
  className,
}: {
  variant?: "wordmark" | "mark";
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
}) {
  const lockup = {
    sm: { word: "text-[24px]", tag: "text-[8px]", tagMt: "-mt-0.5" },
    md: { word: "text-[28px]", tag: "text-[8px]", tagMt: "-mt-0.5" },
    lg: { word: "text-[64px]", tag: "text-[7px]", tagMt: "-mt-2" },
  }[size];

  if (variant === "mark") {
    return (
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/[0.06]",
          className
        )}
        aria-hidden
      >
        <span className="text-[19px] font-extrabold leading-none" style={{ color: ORANGE }}>
          2
        </span>
      </span>
    );
  }

  return (
    <span
      className={cn("inline-flex min-w-0 max-w-full flex-col gap-0", className)}
      role="img"
      aria-label={`I2PA — ${I2PA_TAGLINE}`}
    >
      <span
        className={cn(
          "inline-flex w-fit select-none items-baseline font-extrabold leading-none tracking-tight",
          lockup.word
        )}
      >
        <span style={{ color: BRAND_BLUE }}>I</span>
        <span className="-mx-px" style={{ color: ORANGE }}>
          2
        </span>
        <span className="-ml-0.5 tracking-[-0.06em]" style={{ color: BRAND_BLUE }}>
          PA
        </span>
      </span>

      {showTagline && (
        <span
          className={cn(
            "max-w-[228px] font-normal leading-[1.25] text-[hsl(var(--sidebar-pro-muted))]",
            lockup.tag,
            lockup.tagMt
          )}
        >
          {I2PA_TAGLINE}
        </span>
      )}
    </span>
  );
}

/** PNG officiel — fond noir retiré visuellement sur fond clair. */
export function I2PALogoImage({
  src,
  alt,
  compact,
  size = "sm",
  showTagline = true,
  className,
}: {
  src: string;
  alt: string;
  compact?: boolean;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
}) {
  const tag = { sm: "text-[8px]", md: "text-[8px]", lg: "text-[7px]" }[size];
  const tagMt = { sm: "-mt-0.5", md: "-mt-0.5", lg: "-mt-2" }[size];
  const imgH = { sm: "h-7", md: "h-8", lg: "h-9" }[size];

  if (compact) {
    return (
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-black",
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="h-6 w-auto max-w-none object-left object-contain"
          draggable={false}
        />
      </span>
    );
  }

  return (
    <span className={cn("inline-flex min-w-0 max-w-full flex-col gap-0", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={cn(imgH, "w-auto max-w-[200px] object-contain object-left [mix-blend-mode:screen]")}
        draggable={false}
      />
      {showTagline && (
        <span
          className={cn(
            "max-w-[228px] font-normal leading-[1.25] text-[hsl(var(--sidebar-pro-muted))]",
            tag,
            tagMt
          )}
        >
          {I2PA_TAGLINE}
        </span>
      )}
    </span>
  );
}
