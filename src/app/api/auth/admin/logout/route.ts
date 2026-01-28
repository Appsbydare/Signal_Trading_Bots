import { NextResponse } from "next/server";

import { ADMIN_COOKIE_NAME } from "@/lib/auth-tokens";

export async function POST(request: Request) {
  // Handle proxy environments (like ngrok) where request.url might be localhost
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") || "http";

  // Fallback to request.url logic if something is missing, otherwise construct from headers
  const baseUrl = host ? `${protocol}://${host}` : request.url;

  // Redirect to home page after logout
  const response = NextResponse.redirect(new URL("/", baseUrl), {
    status: 303, // See Other
  });

  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}


