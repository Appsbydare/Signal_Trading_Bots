import { NextRequest, NextResponse } from "next/server";

const CUSTOMER_COOKIE = "stb_session";
const ADMIN_COOKIE    = "stb_admin_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Admin pages & admin API routes ---
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi  = pathname.startsWith("/api/admin");

  if (isAdminPage || isAdminApi) {
    const adminToken = request.cookies.get(ADMIN_COOKIE)?.value;
    if (!adminToken) {
      if (isAdminApi) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/auth/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // --- Customer portal pages & customer API routes ---
  const isPortalPage    = pathname.startsWith("/portal");
  const isCustomerApi   = pathname.startsWith("/api/auth/customer/me") ||
                          pathname.startsWith("/api/customer") ||
                          pathname.startsWith("/api/portal") ||
                          pathname.startsWith("/api/subscription") ||
                          pathname.startsWith("/api/license/sessions");

  if (isPortalPage || isCustomerApi) {
    const customerToken = request.cookies.get(CUSTOMER_COOKIE)?.value;
    if (!customerToken) {
      if (isCustomerApi) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/portal/:path*",
    "/api/admin/:path*",
    "/api/auth/customer/me",
    "/api/customer/:path*",
    "/api/portal/:path*",
    "/api/subscription/:path*",
    "/api/license/sessions/:path*",
  ],
};
