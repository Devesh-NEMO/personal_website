import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "admin_session";

/**
 * ============================================================================
 * PROXY (formerly `middleware`)
 * ============================================================================
 * Two jobs for the admin area only:
 *
 *  1. Send cookie-less visitors to the login page before any admin route runs.
 *  2. Stamp every /admin response with `X-Robots-Tag: noindex`, in case a
 *     crawler ignores the page metadata.
 *
 * Authentication is *verified* in `requireAdmin()` inside the pages and
 * actions; this only checks that a cookie is present, so a stale cookie gets
 * through to the layout, which redirects properly. That avoids a redirect loop
 * between here and the login page.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login";
  const hasSessionCookie = request.cookies.has(SESSION_COOKIE);

  if (!isLogin && !hasSessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
