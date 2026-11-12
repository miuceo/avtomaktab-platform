import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "avtomaktab_session";
const ROLE_COOKIE_NAME = "avtomaktab_role";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets and uploaded files are always served.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/uploads") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const role = request.cookies.get(ROLE_COOKIE_NAME)?.value as
    | "admin"
    | "teacher"
    | "student"
    | undefined;

  // Protected route groups (coarse check; every page and API re-checks on the server).
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/teacher") ||
    pathname.startsWith("/student")
  ) {
    if (!sessionToken || !role) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (pathname.startsWith("/admin") && role !== "admin") {
      const target = role === "teacher" ? "/teacher" : "/student";
      return NextResponse.redirect(new URL(target, request.url));
    }

    if (pathname.startsWith("/teacher") && role !== "teacher" && role !== "admin") {
      return NextResponse.redirect(new URL("/student", request.url));
    }

    if (pathname.startsWith("/student") && role !== "student" && role !== "admin") {
      const target = role === "teacher" ? "/teacher" : "/admin";
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  // The root layout needs the pathname to enforce the "no admin yet -> /setup"
  // redirect (the database cannot be queried from the edge middleware).
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
