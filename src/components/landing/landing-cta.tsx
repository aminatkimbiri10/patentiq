import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { landingConfig } from "@/config/landing";
import { cn } from "@/lib/utils/cn";

export function LandingPrimaryCta({
  className,
  size = "default",
}: {
  className?: string;
  size?: "default" | "lg";
}) {
  return (
    <Button
      size={size}
      className={cn(
        "bg-[hsl(213,52%,25%)] shadow-lg shadow-primary/25 hover:bg-[hsl(213,52%,20%)] dark:bg-cyan-600 dark:hover:bg-cyan-500",
        size === "lg" && "h-12 px-8",
        className
      )}
      asChild
    >
      <Link href={landingConfig.primaryCta.href}>
        {landingConfig.primaryCta.label}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  );
}

export function LandingSecondaryCta({
  className,
  size = "default",
}: {
  className?: string;
  size?: "default" | "lg";
}) {
  return (
    <Button
      variant="outline"
      size={size}
      className={cn(
        "border-border/80 bg-background/80 backdrop-blur-sm hover:bg-muted/50",
        size === "lg" && "h-12 px-8",
        className
      )}
      asChild
    >
      <Link href={landingConfig.secondaryCta.href}>{landingConfig.secondaryCta.label}</Link>
    </Button>
  );
}
