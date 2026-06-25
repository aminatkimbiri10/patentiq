"use client";

import { forwardRef, useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getProfileHrefForRole } from "@/config/navigation";
import type { AppRole } from "@/types/roles";
import { cn } from "@/lib/utils/cn";

const triggerClassName =
  "relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-card p-0 shadow-sm touch-manipulation [-webkit-tap-highlight-color:transparent] hover:bg-muted/80 active:scale-[0.97]";

function AvatarButton({
  name,
  initials,
  avatarUrl,
  className,
}: {
  name: string;
  initials: string;
  avatarUrl?: string | null;
  className?: string;
}) {
  return (
    <UserAvatar
      src={avatarUrl}
      alt={name}
      initials={initials}
      className={cn("h-10 w-10 ring-0", className)}
      fallbackClassName="text-xs"
    />
  );
}

const AccountMenuPanel = forwardRef<
  HTMLDivElement,
  {
    name: string;
    email: string;
    profileHref: string;
    onNavigate?: () => void;
    className?: string;
    style?: CSSProperties;
  }
>(function AccountMenuPanel(
  { name, email, profileHref, onNavigate, className, style },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        "w-56 overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-xl",
        className
      )}
      style={style}
      role="menu"
    >
      <div className="border-b border-border px-3 py-2.5">
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className="truncate text-xs text-muted-foreground">{email}</p>
      </div>
      <div className="p-1">
        <Link
          href={profileHref}
          onClick={onNavigate}
          className="flex w-full rounded-lg px-2.5 py-2 text-sm hover:bg-muted"
        >
          Profil
        </Link>
        <Link
          href="/dashboard/security"
          onClick={onNavigate}
          className="flex w-full rounded-lg px-2.5 py-2 text-sm hover:bg-muted"
        >
          Sécurité
        </Link>
      </div>
      <div className="border-t border-border p-1">
        <SignOutButton />
      </div>
    </div>
  );
});

AccountMenuPanel.displayName = "AccountMenuPanel";

function MobileUserMenu({
  email,
  name,
  initials,
  avatarUrl,
  profileHref,
}: {
  email: string;
  name: string;
  initials: string;
  avatarUrl?: string | null;
  profileHref: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [panelStyle, setPanelStyle] = useState<{ top: number; right: number } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPanelStyle({
        top: rect.bottom + 6,
        right: Math.max(12, window.innerWidth - rect.right),
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative sm:hidden">
      <button
        ref={triggerRef}
        type="button"
        className={triggerClassName}
        aria-label="Menu compte"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <AvatarButton name={name} initials={initials} avatarUrl={avatarUrl} />
      </button>

      {open &&
        mounted &&
        panelStyle &&
        createPortal(
          <AccountMenuPanel
            ref={panelRef}
            name={name}
            email={email}
            profileHref={profileHref}
            onNavigate={() => setOpen(false)}
            className="fixed z-[110]"
            style={{ top: panelStyle.top, right: panelStyle.right }}
          />,
          document.body
        )}
    </div>
  );
}

export function UserMenu({
  email,
  name,
  initials,
  avatarUrl,
  role,
}: {
  email: string;
  name: string;
  initials: string;
  avatarUrl?: string | null;
  role?: AppRole | null;
}) {
  const profileHref = getProfileHrefForRole(role ?? null);

  return (
    <>
      <MobileUserMenu
        email={email}
        name={name}
        initials={initials}
        avatarUrl={avatarUrl}
        profileHref={profileHref}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn(triggerClassName, "hidden sm:inline-flex")}
            aria-label="Menu compte"
          >
            <AvatarButton name={name} initials={initials} avatarUrl={avatarUrl} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="z-[100] w-56 border-border bg-card shadow-lg"
        >
          <DropdownMenuLabel>
            <p className="font-medium">{name}</p>
            <p className="text-xs font-normal text-muted-foreground">{email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={profileHref} className="w-full cursor-pointer">
              Profil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/security" className="w-full cursor-pointer">
              Sécurité
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <SignOutButton />
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
