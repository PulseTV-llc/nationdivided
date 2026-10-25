import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic admin gate. It only checks that a session cookie is present so
 * signed-out visitors are sent to the login page without rendering anything.
 * It does NOT authorize: every admin page, Server Action and API route
 * verifies the session against the database itself.
 */
const SESSION_COOKIES = ["__Host-nd_admin", "nd_admin"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) return NextResponse.next();

  const hasSession = SESSION_COOKIES.some((name) => Boolean(request.cookies.get(name)?.value));
  if (hasSession) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  if (pathname.startsWith("/admin/")) url.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};
