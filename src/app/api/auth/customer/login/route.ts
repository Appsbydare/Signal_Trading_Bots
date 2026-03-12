import { NextRequest, NextResponse } from "next/server";

import { CUSTOMER_COOKIE_NAME, createAuthToken } from "@/lib/auth-tokens";
import { getCustomerByEmail, verifyPassword } from "@/lib/auth-users";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // 10 attempts per IP per 15 minutes
  if (!checkRateLimit(`login:${getClientIp(request)}`, { limit: 10, windowSeconds: 900 })) {
    return NextResponse.json({ success: false, message: "Too many login attempts. Please try again later." }, { status: 429 });
  }
  let body: { email?: string; password?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json(
      { success: false, message: "Email and password are required" },
      { status: 400 },
    );
  }

  const customer = await getCustomerByEmail(email);
  if (!customer) {
    return NextResponse.json(
      { success: false, message: "Invalid email or password" },
      { status: 401 },
    );
  }

  const valid = await verifyPassword(password, customer.password_hash);
  if (!valid) {
    return NextResponse.json(
      { success: false, message: "Invalid email or password" },
      { status: 401 },
    );
  }

  const token = await createAuthToken(customer.id, customer.email, "customer", customer.password_set_by_user ?? false);

  const response = NextResponse.json(
    {
      success: true,
      message: "Logged in successfully",
    },
    { status: 200 },
  );

  response.cookies.set(CUSTOMER_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Number(process.env.AUTH_TOKEN_TTL_SECONDS ?? 60 * 60 * 24 * 7),
  });

  return response;
}


