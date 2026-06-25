import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthBrandLogo } from "@/components/auth/auth-brand-logo";
import { cn } from "@/lib/utils/cn";

export function AuthCard({
  title,
  description,
  children,
  className,
  showBrand = false,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  showBrand?: boolean;
}) {
  return (
    <Card className={cn("w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-border/80 bg-card shadow-md", className)}>
      <CardHeader className="space-y-1.5 pb-2 text-center sm:text-left">
        {showBrand && (
          <div className="mb-3 flex min-w-0 justify-center pb-1 sm:justify-start lg:hidden">
            <AuthBrandLogo variant="on-light" className="w-full max-w-full items-center sm:items-start" />
          </div>
        )}
        <CardTitle className="break-words text-xl font-semibold tracking-tight">{title}</CardTitle>
        {description && (
          <CardDescription className="break-words text-sm leading-relaxed">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-2">{children}</CardContent>
    </Card>
  );
}
