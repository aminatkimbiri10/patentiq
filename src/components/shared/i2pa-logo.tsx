import { cn } from "@/lib/utils/cn";
import { siteConfig } from "@/config/site";

const BRAND_BLUE = siteConfig.brand.blue;
const ORANGE = "#E86A43";
export const I2PA_TAGLINE = "International Intellectual Property Assistance";

/** Lockup typographique — fallback sans PNG */
export function I2PALogo({
  variant = "wordmark",
  size = "sm",
  showTagline = true,
  variantStyle = "default",
  className,
}: {
  variant?: "wordmark" | "mark";
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  variantStyle?: "default" | "light" | "flat" | "sidebar";
  className?: string;
}) {
  const taglineClass =
    variantStyle === "light" || variantStyle === "sidebar"
      ? "text-white/60"
      : "text-[hsl(var(--sidebar-pro-muted))]";
  const lockup = {
    sm: { word: "text-[24px]", tag: "text-[8px]", tagMt: "-mt-0.5" },
    md: { word: "text-[28px]", tag: "text-[8px]", tagMt: "-mt-0.5" },
    lg: { word: "text-[36px]", tag: "text-[9px]", tagMt: "-mt-0.5" },
  }[size];

  if (variant === "mark") {
    return (
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/[0.06]",
          className
        )}
        aria-hidden
      >
        <span className="text-[17px] font-extrabold leading-none" style={{ color: ORANGE }}>
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
            "max-w-[228px] font-normal leading-[1.25]",
            taglineClass,
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

/** PNG officiel I2PA — logo entier visible, redimensionné proprement */
export function I2PALogoImage({
  src,
  alt,
  compact = true,
  size = "sm",
  showTagline = false,
  variant = "default",
  surface = "transparent",
  prominent = false,
  placement = "default",
  className,
}: {
  src: string;
  alt: string;
  compact?: boolean;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  variant?: "default" | "light" | "flat" | "sidebar";
  surface?: "transparent" | "dark";
  prominent?: boolean;
  placement?: "landing" | "sidebar" | "sidebar-rail" | "auth-dark" | "auth-light" | "default";
  className?: string;
}) {
  const taglineClass =
    variant === "light" || variant === "sidebar"
      ? "text-white/60"
      : "text-muted-foreground";
  const tag = { sm: "text-[8px]", md: "text-[9px]", lg: "text-[10px]" }[size];
  const tagMt = { sm: "-mt-0.5", md: "-mt-0.5", lg: "-mt-1" }[size];

  const imgClass = cn(
    "block shrink-0 object-contain",
    placement === "sidebar-rail"
      ? "mx-auto h-8 w-8 max-w-[2rem] object-center"
      : placement === "auth-dark"
        ? "h-[4.25rem] w-auto max-w-[min(100%,260px)] object-left sm:h-[4.75rem]"
        : placement === "auth-light"
          ? "mx-auto h-12 w-auto max-w-[min(100%,220px)] object-contain"
      : prominent
        ? placement === "sidebar"
          ? "h-14 w-auto max-w-none object-left"
          : "h-14 sm:h-[4.75rem] w-auto max-w-none object-left"
        : placement === "sidebar"
          ? "h-10 w-auto max-w-none object-left"
          : { sm: "h-9 w-auto", md: "h-10 w-auto", lg: "h-12 w-auto" }[size]
  );

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={imgClass} draggable={false} />
  );

  if (surface === "dark") {
    return (
      <span
        className={cn(
          "inline-flex min-w-0 max-w-full shrink-0 flex-col gap-1",
          compact ? "items-center" : "items-start",
          className
        )}
      >
        <span
          className={cn(
            "inline-flex max-w-full items-center justify-center rounded-lg bg-black",
            compact ? "px-2 py-1" : "px-2.5 py-2"
          )}
        >
          {img}
        </span>
        {showTagline && !compact && (
          <span className={cn("max-w-[220px] font-normal leading-[1.25]", taglineClass, tag, tagMt)}>
            {I2PA_TAGLINE}
          </span>
        )}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex min-w-0 flex-col gap-1",
        placement === "sidebar-rail" ? "w-full items-center" : "max-w-full",
        className
      )}
    >
      {img}
      {showTagline && !compact && (
        <span className={cn("max-w-[220px] font-normal leading-[1.25]", taglineClass, tag, tagMt)}>
          {I2PA_TAGLINE}
        </span>
      )}
    </span>
  );
}
