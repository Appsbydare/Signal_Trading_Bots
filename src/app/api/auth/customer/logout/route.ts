import { NextResponse } from "next/server";

import { CUSTOMER_COOKIE_NAME } from "@/lib/auth-tokens";

export async function POST() {
  const response = NextResponse.json(
    { success: true, message: "Logged out" },
    { status: 200 },
  );

  response.cookies.set(CUSTOMER_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}


