import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { AUTH_ROUTES, PUBLIC_ROUTES } from "@/config/navigation";
import { PROTECTED_PREFIXES, ONBOARDING_PATH } from "@/lib/auth/constants";
import { getHomePathForRole } from "@/lib/auth/redirect-by-role";
import { parseRoleFromJoin } from "@/lib/auth/parse-role";
import type { AppRole } from "@/types/roles";

function isPublicPath(pathname: string) {
  return (
    PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`)) ||
    pathname.startsWith("/auth/")
  );
}

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isAuthPath(pathname: string) {
  return AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(r));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { supabaseResponse, user, supabase } = await updateSession(request);

  // API routes — session refresh only
  if (pathname.startsWith("/api/")) {
    return supabaseResponse;
  }

  if (!user && isProtectedPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthPath(pathname)) {
    const { data: roles } = await supabase
      .from("user_roles")
      .select("is_primary, roles(role_name)")
      .eq("user_id", user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .single();

    const primary = roles?.find((r) => r.is_primary);
    const roleName = parseRoleFromJoin(
      primary?.roles as { role_name: AppRole } | { role_name: AppRole }[] | null
    );

    const home = getHomePathForRole(
      roleName,
      profile?.onboarding_completed ?? false
    );

    return NextResponse.redirect(new URL(home, request.url));
  }

  if (user && pathname === ONBOARDING_PATH) {
    return supabaseResponse;
  }

  if (user && isProtectedPath(pathname) && !pathname.startsWith(ONBOARDING_PATH)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .single();

    const { count } = await supabase
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (!profile?.onboarding_completed || (count ?? 0) === 0) {
      return NextResponse.redirect(new URL(ONBOARDING_PATH, request.url));
    }

    // Role-based route guards
    if (pathname.startsWith("/admin")) {
      const { data } = await supabase.rpc("has_role", { p_role: "admin" } as never);
      if (!data) return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (pathname.startsWith("/cpi")) {
      const { data } = await supabase.rpc("has_role", { p_role: "cpi_advisor" } as never);
      if (!data) return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (pathname.startsWith("/expert")) {
      const { data } = await supabase.rpc("has_role", { p_role: "expert" } as never);
      if (!data) return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (!user && !isPublicPath(pathname) && !pathname.startsWith("/api")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
