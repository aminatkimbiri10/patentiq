"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

export function UserAvatar({
  src,
  alt,
  initials,
  className,
  fallbackClassName,
}: {
  src?: string | null;
  alt: string;
  initials: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted ring-1 ring-border/60",
        className
      )}
      title={alt}
      aria-label={alt}
    >
      <span
        className={cn(
          "flex h-full w-full items-center justify-center font-semibold text-primary",
          fallbackClassName
        )}
      >
        {initials}
      </span>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          aria-hidden
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-200",
            loaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(false)}
        />
      )}
    </span>
  );
}
