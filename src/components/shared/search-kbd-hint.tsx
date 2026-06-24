"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

export function SearchKbdHint({ className }: { className?: string }) {
  const [mac, setMac] = useState(false);

  useEffect(() => {
    setMac(/Mac|iPhone|iPad/.test(navigator.userAgent));
  }, []);

  return (
    <kbd
      className={cn(
        "pointer-events-none hidden h-5 select-none items-center rounded border border-border/80 bg-muted/60 px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex",
        className
      )}
    >
      {mac ? "⌘K" : "Ctrl+K"}
    </kbd>
  );
}
