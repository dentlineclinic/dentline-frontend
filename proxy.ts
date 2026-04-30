import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeJwtPayload, isTokenExpired, ROLE_ROUTE_MAP } from "@/lib/jwt";

const PROTECTED_PREFIXES = ["/admin", "/doctor", "/patient"];
const AUTH_PREFIXES = ["/login", "/register", "/admin-login"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
}

function isAuthPage(pathname: string): boolean {
  return AUTH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  let validRole: string | null = null;

  if (token) {
    const payload = decodeJwtPayload(token);
    if (payload && !isTokenExpired(payload)) {
      const role = payload.role?.replace("ROLE_", "");
      if (role && role in ROLE_ROUTE_MAP) {
        validRole = role;
      }
    }
  }

  if (isAuthPage(pathname)) {
    if (validRole) {
      return NextResponse.redirect(
        new URL(ROLE_ROUTE_MAP[validRole], request.url),
        307
      );
    }
    return NextResponse.next();
  }

  if (isProtected(pathname)) {
    if (!validRole) {
      const loginUrl =
        pathname === "/admin" || pathname.startsWith("/admin/")
          ? "/admin-login/request-otp"
          : "/login";
      return NextResponse.redirect(new URL(loginUrl, request.url), 307);
    }

    const requiredPrefix = PROTECTED_PREFIXES.find(
      (p) => pathname === p || pathname.startsWith(p + "/")
    );
    const requiredRole = Object.entries(ROLE_ROUTE_MAP).find(
      ([, prefix]) => prefix === requiredPrefix
    )?.[0];

    if (requiredRole === validRole) {
      return NextResponse.next();
    }

    return NextResponse.redirect(
      new URL(ROLE_ROUTE_MAP[validRole], request.url),
      307
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
