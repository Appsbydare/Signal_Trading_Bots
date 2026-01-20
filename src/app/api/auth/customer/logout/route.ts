import { NextRequest, NextResponse } from "next/server";

import { CUSTOMER_COOKIE_NAME } from "@/lib/auth-tokens";

export async function POST(request: NextRequest) {
  // Get the origin from the request headers
  const origin = request.headers.get("origin") || request.nextUrl.origin;

  // Create redirect URL using the actual origin
  const redirectUrl = new URL("/login", origin);

  const response = NextResponse.redirect(redirectUrl, { status: 303 });

  // Clear the customer cookie
  response.cookies.set(CUSTOMER_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}


