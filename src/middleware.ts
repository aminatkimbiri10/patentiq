import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { AUTH_ROUTES, PUBLIC_ROUTES } from "@/config/navigation";
import { PROTECTED_PREFIXES, ONBOARDING_PATH } from "@/lib/auth/constants";
import { getAuthenticatedHomePath } from "@/lib/auth/middleware-home";

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

  // Email confirmé obligatoire (sauf page check-email)
  if (
    user &&
    isProtectedPath(pathname) &&
    !pathname.startsWith("/auth/check-email") &&
    !user.email_confirmed_at
  ) {
    return NextResponse.redirect(new URL("/auth/check-email", request.url));
  }

  if (user && isAuthPath(pathname)) {
    const home = await getAuthenticatedHomePath(supabase, user.id);
    return NextResponse.redirect(new URL(home, request.url));
  }

  if (user && pathname === ONBOARDING_PATH) {
    return supabaseResponse;
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
