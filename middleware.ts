import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

import { ADMIN_COOKIE_NAME, CUSTOMER_COOKIE_NAME, type AuthJwtPayload } from "@/lib/auth-tokens";

const AUTH_JWT_SECRET = process.env.AUTH_JWT_SECRET;

async function verifyToken(token: string, expectedRole: "customer" | "admin") {
  if (!AUTH_JWT_SECRET) {
    return null;
  }

  try {
    const secretKey = new TextEncoder().encode(AUTH_JWT_SECRET);
    const { payload } = await jwtVerify<AuthJwtPayload>(token, secretKey);
    if (!payload.sub || !payload.email || payload.role !== expectedRole) {
      return null;
    }
    return payload;
  } catch {
    return null;
  } 
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect customer portal routes
  if (pathname.startsWith("/portal")) {
    const token = request.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
    const valid = token ? await verifyToken(token, "customer") : null;

    if (!valid) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // Protect admin routes (except /admin/login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const valid = token ? await verifyToken(token, "admin") : null;

    if (!valid) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*", "/admin/:path*"],
};


